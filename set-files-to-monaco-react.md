# Note: Set file path to monaco-editor as react component

目標：マルチ・モデル・エディタを実現する

## 手順


- monaco.editor.create()でeditorインスタンスを生成しておく
- file情報を基にmodelを生成する
- そのmodelをeditorInstance.setModel(model)でエディタにmodelを適用させる


## マルチモデルの元となるfile情報を反映させる方法

#### 手順

要約：

fileを基にしたmonaco.ITextModelを生成させてeditorインスタンスに反映させる

詳細：

1. fileにはpath, language, valueを持たせる。

```TypeScript
export interface iFiles {
    [path: string]: iFile
};

export interface iFile {
    path: string;
    language: string;
    value: string;
};

export const files: iFiles = {
    'react': {
        path: '/main.jsx',
        language: 'javascript',
        value: ``
    },
    'react-typescript': {
        path: '/main.tsx',
        language: 'typescript',
        value: `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`
    },
};
```

2. file情報を基にしたmodelを生成させる

NOTE: 同一のmodelを複数生成しようとするとコンパイルエラーになるので、生成前に同じmodelがないか確認すること

NOTE: monaco.Uri()の生成するURIを必ず確認すること

modelの区別はその`model.uri`で行うのが一般的な模様。

fileからは`path`を渡すので`model.uri.path`で区別することになる。

```TypeScript
/**
 * @param {string} path - file["react-typescript"].path
 * @param {string} value - file["react-typescript"].value
 * @param {string} language - file["react-typescript"].language
 * */ 
const _initializeFiles = (path: string, value: string, language: string) => {
        // 必須：既存のモデルと被っているかどうかチェック
        let model = monaco.editor.getModels()?.find(m => m.uri.path === path);
        if(model) {
            // TODO: apply latest state to the model
        }
        else {
            // model生成時にfileの情報を渡す
            model = monaco.editor.createModel(
                value, language, 
                // NOTE: ここのpathに注意
                new monaco.Uri().with({ path })
            );
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true,        
            });
        }
    };
```

生成されるUriは次の通り:

```JavaScript
authority: ""
fragment: ""
path: "/main.tsx"
query: ""
scheme: "file"
_formatted: "file:///main.tsx"
```

`path: "/main.tsx"`でも`path: "main.tsx"`でも、

Uri.pathは`"/main.tsx"`で生成されるので

`path: "main.tsx"`でpath比較すると一生一致しない判定が出るので注意。


3. modelをeditorインスタンスに反映させる

```TypeScript
    const _applyFile = (path: string) => {
        if(!_refEditor.current) return;
        const model = monaco.editor.getModels()?.find(
            m => m.uri.path === path
        );
        model && _refEditor.current.setModel(model);
    };
```

これで反映できた。

確認方法：

```TypeScript
console.log(monaco.editor.getModels());
console.log(editorInstance.getModel());
console.log(editorInstance.getModel().uri);
```

など。

fileをネット上から拾ってきてほしい場合はアプローチが異なるかも。


#### fileで必要とするmoduleをaddEtraLibsする

多分だけどこれをしない限り、import文で何そのモジュールってエラー必ず出る。

https://github.com/satya164/monaco-editor-boilerplate/blob/master/src/workers/typings.worker.js

https://stackoverflow.com/questions/43058191/how-to-use-addextralib-in-monaco-with-an-external-type-definition

https://stackoverflow.com/questions/63310682/how-to-load-npm-module-type-definition-in-monaco-using-webpack-and-react-create/63349650#63349650

https://github.com/microsoft/monaco-editor/issues/667

```TypeScript
/**
* Add an additional source file to the language service. Use this
* for typescript (definition) files that won't be loaded as editor
* documents, like `jquery.d.ts`.
*
* @param content The file content
* @param filePath An optional file path
* @returns A disposable which will remove the file from the
* language service upon disposal.
*/
addExtraLib(content: string, filePath?: string): IDisposable;
```

ひとまず、

`react`と`react-dom`をネット上から取得する。

多分重たい処理なのでworkerに任せる。

`worker/FetchLibs.worker.ts`

多分丸っとここが参考になるかも？:

https://github.com/satya164/monaco-editor-boilerplate/blob/master/src/workers/typings.worker.js

#### 公式playgroundでテスト

```JavaScript
const files = {
    // TODO: 
};

for (const fileName in files) {
  const path = `file:///node_modules/@types/${fileName}`;

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    files[fileName],
    fakePath
  );
}

const model = monaco.editor.createModel(
  ``,   // TODO: テストしたいエディタに入力しておきたいコード
  "typescript",
  monaco.Uri.parse("file:///main.tsx")
);

monaco.editor.create(document.getElementById("container"), { model });
```
```HTML
<div id="container" style="height: 100%"></div>
```


#### 参考repoのtyping.workerを分析

というか型付け。

`workers/FetchLibs.worker.ts`のこと。

どんな型にすればいいのかさっぱりなので、codesandboxで動かしながら確認する。

webworkerを動かせるテンプレート：

https://codesandbox.io/s/web-workers-e9runq

eslintを黙らせる奴:

https://stackoverflow.com/questions/44292520/unexpected-use-of-self-no-restricted-globals-react

とにかく動かすために少し修正したコード：


```JavaScript
/**
 * Worker to fetch typescript definitions for dependencies.
 * Credits to @CompuIves
 * https://github.com/CompuIves/codesandbox-client/blob/dcdb4169bcbe3e5aeaebae19ff1d45940c1af834/packages/app/src/app/components/CodeEditor/Monaco/workers/fetch-dependency-typings.js
 *
 * global ts
 * @flow
 */

import path from "path";
import { Store, set as setItem, get as getItem } from "idb-keyval";

/* eslint-disable-next-line no-restricted-globals */
self.importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/typescript/2.4.2/typescript.min.js"
);

const ROOT_URL = `https://cdn.jsdelivr.net/`;

const store = new Store("typescript-definitions-cache-v1");
const fetchCache = new Map();

const doFetch = (url) => {
  const cached = fetchCache.get(url);

  if (cached) {
    return cached;
  }

  const promise = fetch(url)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || response.status);

      return Promise.reject(error);
    })
    .then((response) => response.text());

  fetchCache.set(url, promise);

  return promise;
};

const fetchFromDefinitelyTyped = (dependency, version, fetchedPaths) =>
  doFetch(
    `${ROOT_URL}npm/@types/${dependency
      .replace("@", "")
      .replace(/\//g, "__")}/index.d.ts`
  ).then((typings) => {
    fetchedPaths[`node_modules/${dependency}/index.d.ts`] = typings;
  });

const getRequireStatements = (title, code) => {
  const requires = [];

  /* eslint-disable-next-line no-restricted-globals */
  const sourceFile = self.ts.createSourceFile(
    title,
    code,

    /* eslint-disable-next-line no-restricted-globals */
    self.ts.ScriptTarget.Latest,
    true,
    /* eslint-disable-next-line no-restricted-globals */
    self.ts.ScriptKind.TS
  );

  /* eslint-disable-next-line no-restricted-globals */
  self.ts.forEachChild(sourceFile, (node) => {
    switch (node.kind) {
      /* eslint-disable-next-line no-restricted-globals */
      case self.ts.SyntaxKind.ImportDeclaration: {
        requires.push(node.moduleSpecifier.text);
        break;
      }

      /* eslint-disable-next-line no-restricted-globals */
      case self.ts.SyntaxKind.ExportDeclaration: {
        // For syntax 'export ... from '...'''
        if (node.moduleSpecifier) {
          requires.push(node.moduleSpecifier.text);
        }
        break;
      }
      default: {
        /* */
      }
    }
  });

  return requires;
};

const tempTransformFiles = (files) => {
  const finalObj = {};

  files.forEach((d) => {
    finalObj[d.name] = d;
  });

  return finalObj;
};

const transformFiles = (dir) =>
  dir.files
    ? dir.files.reduce((prev, next) => {
        if (next.type === "file") {
          return { ...prev, [next.path]: next };
        }

        return { ...prev, ...transformFiles(next) };
      }, {})
    : {};

const getFileMetaData = (dependency, version, depPath) =>
  doFetch(
    `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`
  )
    .then((response) => JSON.parse(response))
    .then((response) =>
      response.files.filter((f) => f.name.startsWith(depPath))
    )
    .then(tempTransformFiles);

const resolveAppropiateFile = (fileMetaData, relativePath) => {
  const absolutePath = `/${relativePath}`;

  if (fileMetaData[`${absolutePath}.d.ts`]) return `${relativePath}.d.ts`;
  if (fileMetaData[`${absolutePath}.ts`]) return `${relativePath}.ts`;
  if (fileMetaData[absolutePath]) return relativePath;
  if (fileMetaData[`${absolutePath}/index.d.ts`])
    return `${relativePath}/index.d.ts`;

  return relativePath;
};

const getFileTypes = (
  depUrl,
  dependency,
  depPath,
  fetchedPaths,
  fileMetaData
) => {
  const virtualPath = path.join("node_modules", dependency, depPath);

  if (fetchedPaths[virtualPath]) return null;

  return doFetch(`${depUrl}/${depPath}`).then((typings) => {
    if (fetchedPaths[virtualPath]) return null;

    fetchedPaths[virtualPath] = typings;

    // Now find all require statements, so we can download those types too
    return Promise.all(
      getRequireStatements(depPath, typings)
        .filter(
          // Don't add global deps
          (dep) => dep.startsWith(".")
        )
        .map((relativePath) => path.join(path.dirname(depPath), relativePath))
        .map((relativePath) =>
          resolveAppropiateFile(fileMetaData, relativePath)
        )
        .map((nextDepPath) =>
          getFileTypes(
            depUrl,
            dependency,
            nextDepPath,
            fetchedPaths,
            fileMetaData
          )
        )
    );
  });
};

function fetchFromMeta(dependency, version, fetchedPaths) {
  const depUrl = `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`;

  return doFetch(depUrl)
    .then((response) => JSON.parse(response))
    .then((meta) => {
      const filterAndFlatten = (files, filter) =>
        files.reduce((paths, file) => {
          if (filter.test(file.name)) {
            paths.push(file.name);
          }
          return paths;
        }, []);

      let dtsFiles = filterAndFlatten(meta.files, /\.d\.ts$/);
      if (dtsFiles.length === 0) {
        // if no .d.ts files found, fallback to .ts files
        dtsFiles = filterAndFlatten(meta.files, /\.ts$/);
      }

      if (dtsFiles.length === 0) {
        throw new Error(`No inline typings found for ${dependency}@${version}`);
      }

      dtsFiles.forEach((file) => {
        doFetch(`https://cdn.jsdelivr.net/npm/${dependency}@${version}${file}`)
          .then((dtsFile) => {
            fetchedPaths[`node_modules/${dependency}${file}`] = dtsFile;
          })
          .catch(() => {});
      });
    });
}

function fetchFromTypings(dependency, version, fetchedPaths) {
  // DEBUG:
  cl("[fetchFromTypings]" + dependency + version + fetchedPaths);

  const depUrl = `${ROOT_URL}npm/${dependency}@${version}`;

  return doFetch(`${depUrl}/package.json`)
    .then((response) => JSON.parse(response))
    .then((packageJSON) => {
      const types = packageJSON.typings || packageJSON.types;
      if (types) {
        // Add package.json, since this defines where all types lie
        fetchedPaths[
          `node_modules/${dependency}/package.json`
        ] = JSON.stringify(packageJSON);

        // get all files in the specified directory
        return getFileMetaData(
          dependency,
          version,
          path.join("/", path.dirname(types))
        ).then((fileData) =>
          getFileTypes(
            depUrl,
            dependency,
            resolveAppropiateFile(fileData, types),
            fetchedPaths,
            fileData
          )
        );
      }

      throw new Error(
        `No typings field in package.json for ${dependency}@${version}`
      );
    });
}

function fetchDefinitions(name, version) {
  if (!version) {
    return Promise.reject(new Error(`No version specified for ${name}`));
  }

  // DEBUG:
  cl("[fetchDefinitions]" + name + version);

  // Query cache for the defintions
  const key = `${name}@${version}`;

  return getItem(key, store)
    .catch((e) => {
      console.error("An error occurred when getting definitions from cache", e);
    })
    .then((result) => {
      if (result) {
        return result;
      }

      // If result is empty, fetch from remote
      const fetchedPaths = {};

      return fetchFromTypings(name, version, fetchedPaths)
        .catch(() =>
          // not available in package.json, try checking meta for inline .d.ts files
          fetchFromMeta(name, version, fetchedPaths)
        )
        .catch(() =>
          // Not available in package.json or inline from meta, try checking in @types/
          fetchFromDefinitelyTyped(name, version, fetchedPaths)
        )
        .then(() => {
          if (Object.keys(fetchedPaths).length) {
            // Also cache the definitions
            setItem(key, fetchedPaths, store);

            return fetchedPaths;
          } else {
            throw new Error(`Type definitions are empty for ${key}`);
          }
        });
    });
}

// Only DEBUG purpose
const cl = (d) => {
  /* eslint-disable-next-line no-restricted-globals */
  self.postMessage(d);
};

/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("message", (event) => {
  const { name, version } = event.data;

  cl("onmessage" + name + version);

  fetchDefinitions(name, version).then(
    (result) =>
      /* eslint-disable-next-line no-restricted-globals */
      self.postMessage({
        name,
        version,
        typings: result
      }),
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  );
});

```
呼び出し側：

```JavaScript
const worker = new Worker("../public/worker.js");

// worker.postMessage({});

(function () {
  worker.onmessage = (e) => {
    console.log(e);
  };
  // Fetch some definitions
  const dependencies = {
    expo: "29.0.0",
    react: "16.3.1",
    "react-native": "0.55.4"
  };

  Object.keys(dependencies).forEach((name) =>
    worker.postMessage({
      name,
      version: dependencies[name]
    })
  );
})();


```

```bash
# 以下が3つ帰ってきた...
500000000067109000
```

あとworkerのコンテキストはコンソールにconsole.logが返ってこないから困る

# note: 分析 typings.worker

codesandbox vanillaで動かせるように修正したtypings.worker


```JavaScript
import "./styles.css";

import path from "path";
import { createStore, set as setItem, get as getItem } from "idb-keyval";
import ts from "typescript";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

// self.importScripts(
//   "https://cdnjs.cloudflare.com/ajax/libs/typescript/2.4.2/typescript.min.js"
// );

const ROOT_URL = `https://cdn.jsdelivr.net/`;

const store = createStore(
  "typescript-definitions-cache-v1",
  "typescript-definitions-cache-v1"
);
const fetchCache = new Map();

/****
 * 
 *  */
const doFetch = (url) => {
  const cached = fetchCache.get(url);

  if (cached) {
    return cached;
  }

  const promise = fetch(url)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || response.status);

      return Promise.reject(error);
    })
    .then((response) => response.text());

  fetchCache.set(url, promise);

  return promise;
};

/****
 * 
 *  */
const fetchFromDefinitelyTyped = (dependency, version, fetchedPaths) =>
{  
  // DEBUG:
  console.log(`[fetchFromDefinitleTyped] fetch ${ROOT_URL}npm/@types/${dependency
    .replace("@", "")
    .replace(/\//g, "__")}/index.d.ts`);

  return doFetch(
    `${ROOT_URL}npm/@types/${dependency
      .replace("@", "")
      .replace(/\//g, "__")}/index.d.ts`
  ).then((typings) => {
    fetchedPaths[`node_modules/${dependency}/index.d.ts`] = typings;
  });
};

/****
 * 
 *  */
const getRequireStatements = (title, code) => {
  const requires = [];

  const sourceFile = ts.createSourceFile(
    title,
    code,

    ts.ScriptTarget.Latest,
    true,

    ts.ScriptKind.TS
  );

  ts.forEachChild(sourceFile, (node) => {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        requires.push(node.moduleSpecifier.text);
        break;
      }

      case ts.SyntaxKind.ExportDeclaration: {
        // For syntax 'export ... from '...'''
        if (node.moduleSpecifier) {
          requires.push(node.moduleSpecifier.text);
        }
        break;
      }
      default: {
        /* */
      }
    }
  });

  return requires;
};

/****
 * 
 *  */
const tempTransformFiles = (files) => {
  const finalObj = {};

  files.forEach((d) => {
    finalObj[d.name] = d;
  });

  return finalObj;
};

/****
 * 
 *  */
const transformFiles = (dir) =>
  dir.files
    ? dir.files.reduce((prev, next) => {
        if (next.type === "file") {
          return { ...prev, [next.path]: next };
        }

        return { ...prev, ...transformFiles(next) };
      }, {})
    : {};

/****
 * 
 *  */
const getFileMetaData = (dependency, version, depPath) =>
  doFetch(
    `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`
  )
    .then((response) => JSON.parse(response))
    .then((response) =>
      response.files.filter((f) => f.name.startsWith(depPath))
    )
    .then(tempTransformFiles);

/****
 * 
 *  */
const resolveAppropiateFile = (fileMetaData, relativePath) => {
  const absolutePath = `/${relativePath}`;

  if (fileMetaData[`${absolutePath}.d.ts`]) return `${relativePath}.d.ts`;
  if (fileMetaData[`${absolutePath}.ts`]) return `${relativePath}.ts`;
  if (fileMetaData[absolutePath]) return relativePath;
  if (fileMetaData[`${absolutePath}/index.d.ts`])
    return `${relativePath}/index.d.ts`;

  return relativePath;
};

/****
 * 
 *  */
const getFileTypes = (
  depUrl,
  dependency,
  depPath,
  fetchedPaths,
  fileMetaData
) => {
  const virtualPath = path.join("node_modules", dependency, depPath);

  if (fetchedPaths[virtualPath]) return null;

  return doFetch(`${depUrl}/${depPath}`).then((typings) => {
    if (fetchedPaths[virtualPath]) return null;

    fetchedPaths[virtualPath] = typings;

    // Now find all require statements, so we can download those types too
    return Promise.all(
      getRequireStatements(depPath, typings)
        .filter(
          // Don't add global deps
          (dep) => dep.startsWith(".")
        )
        .map((relativePath) => path.join(path.dirname(depPath), relativePath))
        .map((relativePath) =>
          resolveAppropiateFile(fileMetaData, relativePath)
        )
        .map((nextDepPath) =>
          getFileTypes(
            depUrl,
            dependency,
            nextDepPath,
            fetchedPaths,
            fileMetaData
          )
        )
    );
  });
};

/****
 * 
 *  */
function fetchFromMeta(dependency, version, fetchedPaths) {
  const depUrl = `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`;

  // DEBUG:
  console.log(`[fetchFromMeta] fetch ${depUrl}`);

  return doFetch(depUrl)
    .then((response) => JSON.parse(response))
    .then((meta) => {
      
      // DEBUG:
      console.log(`[fetchFromMeta] meta:`);
      console.log(meta);

      const filterAndFlatten = (files, filter) =>
        files.reduce((paths, file) => {
          if (filter.test(file.name)) {
            paths.push(file.name);
          }
          return paths;
        }, []);

      let dtsFiles = filterAndFlatten(meta.files, /\.d\.ts$/);
      if (dtsFiles.length === 0) {
        // if no .d.ts files found, fallback to .ts files
        dtsFiles = filterAndFlatten(meta.files, /\.ts$/);
      }

      if (dtsFiles.length === 0) {
        throw new Error(`No inline typings found for ${dependency}@${version}`);
      }

      dtsFiles.forEach((file) => {
        doFetch(`https://cdn.jsdelivr.net/npm/${dependency}@${version}${file}`)
          .then((dtsFile) => {
            fetchedPaths[`node_modules/${dependency}${file}`] = dtsFile;
          })
          .catch(() => {});
      });
    });
}

/****
 * 
 *  */
function fetchFromTypings(dependency, version, fetchedPaths) {

  const depUrl = `${ROOT_URL}npm/${dependency}@${version}`;

  // DEBUG:
  console.log(`[fetchFromTypings] fetch ${depUrl}`);

  return doFetch(`${depUrl}/package.json`)
    .then((response) => JSON.parse(response))
    .then((packageJSON) => {
      // DEBUG:
      console.log("[fetchFromTypings] packageJSON: ");
      console.log(packageJSON);

      const types = packageJSON.typings || packageJSON.types;
      if (types) {
        // Add package.json, since this defines where all types lie
        fetchedPaths[
          `node_modules/${dependency}/package.json`
        ] = JSON.stringify(packageJSON);

        // get all files in the specified directory
        return getFileMetaData(
          dependency,
          version,
          path.join("/", path.dirname(types))
        ).then((fileData) =>
          getFileTypes(
            depUrl,
            dependency,
            resolveAppropiateFile(fileData, types),
            fetchedPaths,
            fileData
          )
        );
      }

      throw new Error(
        `No typings field in package.json for ${dependency}@${version}`
      );
    });
}

/****
 * 
 *  */ 
function fetchDefinitions(name, version) {
  if (!version) {
    return Promise.reject(new Error(`No version specified for ${name}`));
  }

  // DEBUG:
  console.log("[fetchDefinitions] " + name + "@ " + version);

  // Query cache for the defintions
  const key = `${name}@${version}`;

  return getItem(key, store)
    .catch((e) => {
      console.error("An error occurred when getting definitions from cache", e);
    })
    .then((result) => {
      if (result) {
        return result;
      }

      // If result is empty, fetch from remote
      const fetchedPaths = {};

      return fetchFromTypings(name, version, fetchedPaths)
        .catch(() =>
          // not available in package.json, try checking meta for inline .d.ts files
          fetchFromMeta(name, version, fetchedPaths)
        )
        .catch(() =>
          // Not available in package.json or inline from meta, try checking in @types/
          fetchFromDefinitelyTyped(name, version, fetchedPaths)
        )
        .then(() => {
          if (Object.keys(fetchedPaths).length) {
            // Also cache the definitions
            setItem(key, fetchedPaths, store);

            return fetchedPaths;
          } else {
            throw new Error(`Type definitions are empty for ${key}`);
          }
        });
    });
}

// self.addEventListener("message", (event) => {
//   const { name, version } = event.data;

//   cl("onmessage" + name + version);

//   fetchDefinitions(name, version).then(
//     (result) =>
//
//       self.postMessage({
//         name,
//         version,
//         typings: result
//       }),
//     (error) => {
//       if (process.env.NODE_ENV !== "production") {
//         console.error(error);
//       }
//     }
//   );
// });

const _worker = (e) => {
  const { name, version } = e;

  console.log(`[_worker] ${name} ${version}`);

  return fetchDefinitions(name, version).then(
    (result) => {
      return { name, version, typings: result };
    },
    (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
    }
  );
};

function mainthread() {
  console.log("Hell?");

  const results = [];

  // Fetch some definitions
  const dependencies = {
    expo: "29.0.0",
    react: "16.3.1",
    "react-native": "0.55.4"
  };

  Object.keys(dependencies).forEach((name) =>
    _worker({
      name,
      version: dependencies[name]
    })
      .then((r) => {
        console.log("solved:");
        return console.log(r);
      })
      .catch((e) => {
        console.log("Unsolved:");
        return console.error(e);
      })
  );

  console.log(results);
};

mainthread();
```

出力結果:

```bash

[_worker] expo 29.0.0 
[fetchDefinitions] expo@ 29.0.0 
[_worker] react 16.3.1 
[fetchDefinitions] react@ 16.3.1 
[_worker] react-native 0.55.4 
[fetchDefinitions] react-native@ 0.55.4 
[]
An error occurred when getting definitions from cache 
Error {}
An error occurred when getting definitions from cache 
Error {}
An error occurred when getting definitions from cache 
Error {}
[fetchFromTypings] fetch https://cdn.jsdelivr.net/npm/expo@29.0.0 
[fetchFromTypings] fetch https://cdn.jsdelivr.net/npm/react@16.3.1 
[fetchFromTypings] fetch https://cdn.jsdelivr.net/npm/react-native@0.55.4 
[fetchFromTypings] packageJSON:  
{name: "expo", version: "29.0.0", description: "The Expo SDK", main: "src/Expo.js", bin: Object…}
name: "expo"
version: "29.0.0"
description: "The Expo SDK"
main: "src/Expo.js"
bin: Object
files: Array(5)
scripts: Object
jest: Object
eslintConfig: Object
repository: Object
keywords: Array(1)
author: "Expo"
license: "MIT"
bugs: Object
homepage: "https://github.com/expo/expo-sdk"
dependencies: Object
devDependencies: Object
[fetchFromMeta] fetch https://data.jsdelivr.com/v1/package/npm/expo@29.0.0/flat 
[fetchFromTypings] packageJSON:  
{name: "react", description: "React is a JavaScript library for building user interfaces.", keywords: Array(1), version: "16.3.1", homepage: "https://reactjs.org/"…}
[fetchFromMeta] fetch https://data.jsdelivr.com/v1/package/npm/react@16.3.1/flat 
[fetchFromTypings] packageJSON:  
{name: "react-native", version: "0.55.4", description: "A framework for building native apps using React", license: "MIT", repository: Object…}
[fetchFromMeta] fetch https://data.jsdelivr.com/v1/package/npm/react-native@0.55.4/flat 
[fetchFromMeta] meta: 
{default: "/src/Expo.min.js", files: Array(133)}
[fetchFromDefinitleTyped] fetch https://cdn.jsdelivr.net/npm/@types/expo/index.d.ts 
[fetchFromMeta] meta: 
{default: "/index.min.js", files: Array(8)}
[fetchFromDefinitleTyped] fetch https://cdn.jsdelivr.net/npm/@types/react/index.d.ts 
[fetchFromMeta] meta: 
{default: "/Libraries/react-native/react-native-implementation.min.js", files: Array(2515)}
[fetchFromDefinitleTyped] fetch https://cdn.jsdelivr.net/npm/@types/react-native/index.d.ts 
solved: 
{name: "expo", version: "29.0.0", typings: Object}
solved: 
{name: "react", version: "16.3.1", typings: Object}
Could not get the stack frames of error: 
Error: The error you provided does not contain a stack trace.
Could not get the stack frames of error: 
Error: The error you provided does not contain a stack trace.
solved: 
{name: "react-native", version: "0.55.4", typings: Object}
Could not get the stack frames of error: 
Error: The error you provided does not contain a stack trace.
```

つまり...

例：`expor: "29.0.0`をfetchしたときの処理の流れ

```bash
[_worker] expo 29.0.0 
[fetchDefinitions] expo@ 29.0.0 
An error occurred when getting definitions from cache 
Error {}
[fetchFromTypings] fetch https://cdn.jsdelivr.net/npm/expo@29.0.0 
[fetchFromTypings] packageJSON:  
{name: "expo", version: "29.0.0", description: "The Expo SDK", main: "src/Expo.js", bin: Object…}
    name: "expo"
    version: "29.0.0"
    description: "The Expo SDK"
    main: "src/Expo.js"
    bin: Object
    files: Array(5)
    scripts: Object
    jest: Object
    eslintConfig: Object
    repository: Object
    keywords: Array(1)
    author: "Expo"
    license: "MIT"
    bugs: Object
    homepage: "https://github.com/expo/expo-sdk"
    dependencies: Object
    devDependencies: Object
[fetchFromMeta] fetch https://data.jsdelivr.com/v1/package/npm/expo@29.0.0/flat 


[fetchFromMeta] meta: 
{default: "/src/Expo.min.js", files: Array(133)}
    files: Array(133)
        0: Object
        name: "/AppEntry.js"
        hash: "7NJ8v1GQDKfTFZUxwA3+/lcG3asp9Fki18zHMHFPVsw="
        time: "1985-10-26T08:15:00.000Z"
        size: 157
        1: Object
        name: "/bin/cli.js"
        hash: "cOp0LpwxvtVsjEdDVOdKUL87vAgebZecqIISztO1UV4="
        time: "1985-10-26T08:15:00.000Z"
        size: 1292
        2: Object
        name: "/package.json"
        hash: "UAdBZd9OZtfUJm1wuhI2KEwIAp8qHfz6LaQ/iyrsUd8="
        time: "1985-10-26T08:15:00.000Z"
        size: 2732
        # ...
        
[fetchFromDefinitleTyped] fetch https://cdn.jsdelivr.net/npm/@types/expo/index.d.ts 

solved: 
{name: "expo", version: "29.0.0", typings: Object}
solved: 
{name: "react", version: "16.3.1", typings: Object}
Could not get the stack frames of error: 
Error: The error you provided does not contain a stack trace.
Could not get the stack frames of error: 
Error: The error you provided does not contain a stack trace.
solved: 
{name: "react-native", version: "0.55.4", typings: Object}
Could not get the stack frames of error: 
Error: The error you provided does not contain a stack trace.

```

#### autocomplete suggestionsを出す
