/**************************************************************
 * NOTE: Disable all on `feat_multi-file` branch.
 * ************************************************************/ 
import path from 'path-browserify';
import type * as TypeScriptType from "typescript";
import { createStore, set as setItem, get as getItem } from "idb-keyval";
import type { iMessageFetchLibs } from "./types";


declare const ts: typeof TypeScriptType;

/***
 * interface for `fetchedPaths`.
 *
 * key [modulePath: string] - path of the module type definition. 
 * value - type definitions of the module. 
 *
 * この組み合わせは、最終的に、
 * monaco.language.typescript.typescriptDefaults.addExtraLIibs()へ
 * 渡す引数である。
 *
 * modulePath is like ...
 * `node_modules/${dependency}/index.d.ts`,
 * path.join("node_modules", dependency, depPath),
 * or
 * `node_modules/${dependency}/package.json`
 *
 * つまり、
 *
 * .d.ts, .tsファイルか、もしくは`types`または`typings`を含むpackage.jsonの
 * pathである。
 *
 * */

export interface iFetchedPaths {
  [modulePath: string]: string;
};

const ROOT_URL = `https://cdn.jsdelivr.net/`;
const fetchCache = new Map<string, Promise<string>>();


/***
 * Worker runs twice!
 * 
 * Check `importScripts` 
 * https://stackoverflow.com/a/28620642
 * */ 
if(typeof self.importScripts === 'function') {
    self.importScripts(
      "https://cdnjs.cloudflare.com/ajax/libs/typescript/5.0.4/typescript.min.js"
    );
    
  // // DEBUG:
  // console.log("[FetchLibs] imported typescript.min.js");

  // // Notify mainthread that worker is ready.
  // self.postMessage({
  //   order: "ready",
  // });
}

const store = createStore(
  "typescript-definitions-cache-v1-db",
  "typescript-definitions-cache-v1-store"
);


/****
 *
 *  */
const doFetch = (url: string): Promise<string> => {
  const cached = fetchCache.get(url);

  if (cached) {
    return cached;
  }

  const promise = fetch(url)
    .then((response: Response) => {
      if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
      }

      const error = new Error(response.statusText || String(response.status));

      return Promise.reject(error);
    })
    .then((response) => response.text());

  fetchCache.set(url, promise);

  return promise;
};

/****
 *
 *  */
const fetchFromDefinitelyTyped = (
  dependency: string,
  version: string,
  fetchedPaths: iFetchedPaths
): Promise<void> => {
  // DEBUG:
  console.log(
    `[fetchFromDefinitleTyped] fetch ${ROOT_URL}npm/@types/${dependency
      .replace("@", "")
      .replace(/\//g, "__")}/index.d.ts`
  );

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
 * */
const getRequireStatements = (title: string, code: string): string[] => {
  const requires: string[] = [];

  const sourceFile: TypeScriptType.SourceFile = ts.createSourceFile(
    title,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  // node might have its type as ImportDeclaration or ExportDeclaration. 
  // Inherritance:   
  // ts.Node <-- ts.Statement < -- ts.ImportDeclaration  
  // ts.Node <-- ts.Statement < -- ts.ExportDeclaration  
  // 
  ts.forEachChild(sourceFile, (
    node: TypeScriptType.ImportDeclaration | TypeScriptType.ExportDeclaration | TypeScriptType.Node
  ) => {


    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        // ts.Node.getText()
        requires.push((<TypeScriptType.ImportDeclaration>node).moduleSpecifier.getText());
        break;
      }

      case ts.SyntaxKind.ExportDeclaration: {
        const n: TypeScriptType.ExportDeclaration = node as TypeScriptType.ExportDeclaration;
        // For syntax 'export ... from '...'''
        if (n.moduleSpecifier) {
          requires.push(n.moduleSpecifier.getText());
        }
        break;
      }
      default: {
        /* */
      }
    };
  });

  return requires;
};

/****
 *
 * {
      "name": "/cjs/react.development.js",
      "hash": "RExoLmiwhFhFg/8AijehFwbixo0UpP6014HMOZqtw8c=",
      "time": "1985-10-26T08:15:00.000Z",
      "size": 46528
    }
    こうする
    {
      "/cjs/react.development.js": {
        "name": "/cjs/react.development.js",
        "hash": "RExoLmiwhFhFg/8AijehFwbixo0UpP6014HMOZqtw8c=",
        "time": "1985-10-26T08:15:00.000Z",
        "size": 46528
      }
    }
    
  *  */
const tempTransformFiles = (files: iMetaFile[]): { [path: string]: iMetaFile } => {
  const finalObj: { [path: string]: iMetaFile } = {};

  files.forEach((d) => {
    finalObj[d.name] = d;
  });

  return finalObj;
};

/****
 *
 *  */
const getFileMetaData = (
  dependency: string,
  version: string,
  depPath: string
) =>
  doFetch(
    `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`
  )
    .then((response: string) => JSON.parse(response))
    .then((response: iMeta) => 
      response.files.filter((f) => f.name.startsWith(depPath))
    )
    .then(tempTransformFiles);

/****
 * Invoked from getFileTypes(),fetchFromTypings().
 *
 * Returns appropriate relative path of '.d.ts' or '.ts' file.
 *  */
const resolveAppropiateFile = (fileMetaData: { [path: string]: iMetaFile }, relativePath: string): string => {
  const absolutePath = `/${relativePath}`;

  if (fileMetaData[`${absolutePath}.d.ts`]) return `${relativePath}.d.ts`;
  if (fileMetaData[`${absolutePath}.ts`]) return `${relativePath}.ts`;
  if (fileMetaData[absolutePath]) return relativePath;
  if (fileMetaData[`${absolutePath}/index.d.ts`])
    return `${relativePath}/index.d.ts`;

  return relativePath;
};

/****
 * Invoked from fetchFromTypings()
 * 
 * Return type is unseen so pass it as any.
 *  */
const getFileTypes = (
  depUrl: string,
  dependency: string,
  depPath: string,
  fetchedPaths: iFetchedPaths,
  fileMetaData: { [path: string]: iMetaFile }
): any => {
  const virtualPath = path.join("node_modules", dependency, depPath);

  if (fetchedPaths[virtualPath]) return null;

  return doFetch(`${depUrl}/${depPath}`).then((typings) => {
    if (fetchedPaths[virtualPath]) return null;

    fetchedPaths[virtualPath] = typings;

    // Now find all require statements, so we can download those types too
    /***
     * 
     * */ 
    return Promise.all(
      // getRequireStatements() :string[]
      getRequireStatements(depPath, typings)
        .filter(
          // Don't add global deps
          (dep) => dep.startsWith(".")
        )
        .map((relativePath) => path.join(path.dirname(depPath), relativePath))
        .map((relativePath) =>
          // resolveAppropriateFile(): string[] 
          // string expresses .d.ts or .ts file path
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

interface iMetaFile {
  name: string;
  hash: string;
  time: string;
  size: number;
}

interface iMeta {
  defualt: string; // path
  files: iMetaFile[];
}

/****
 *
 *  */
function fetchFromMeta(
  dependency: string,
  version: string,
  fetchedPaths: iFetchedPaths
) {
  const depUrl = `https://data.jsdelivr.com/v1/package/npm/${dependency}@${version}/flat`;

  // DEBUG:
  console.log(`[fetchFromMeta] fetch ${depUrl}`);

  return doFetch(depUrl)
    .then((response) => JSON.parse(response))
    .then((meta: iMeta) => {
      // DEBUG:
      console.log(`[fetchFromMeta] meta:`);
      console.log(meta);

      /***
       * @files.reduce
       *  @param {} paths - previous value that concist of array contains file.name
       *  @param {} file - current file of files.
       * */

      const filterAndFlatten = (files: iMetaFile[], filter: RegExp) =>
        files.reduce((paths: string[], file: iMetaFile) => {
          if (filter.test(file.name)) {
            paths.push(file.name);
          }
          return paths;
        }, []);

      // Search for file which extensions is '.d.ts' or '.ts'
      let dtsFiles = filterAndFlatten(meta.files, /\.d\.ts$/);
      if (dtsFiles.length === 0) {
        // if no .d.ts files found, fallback to .ts files
        dtsFiles = filterAndFlatten(meta.files, /\.ts$/);
      }

      if (dtsFiles.length === 0) {
        throw new Error(`No inline typings found for ${dependency}@${version}`);
      }

      // Again fetch '.d.ts' or '.ts' and save them.
      dtsFiles.forEach((file) => {
        doFetch(`https://cdn.jsdelivr.net/npm/${dependency}@${version}${file}`)
          .then((dtsFile) => {
            fetchedPaths[`node_modules/${dependency}${file}`] = dtsFile;
          })
          .catch(() => {});
      });
    });
}

interface iPackageJson {
  name: string;
  version: string;
  description: string;
  main: string;
  bin: Object;
  files: any;
  scripts: Object;
  jest: Object;
  eslintConfig: Object;
  repository: Object;
  keywords: any;
  author: string;
  license: string;
  bugs: Object;
  homepage: string;
  dependencies: Object;
  devDependencies: Object;
  types?: string;
  typings?: string;
}

/****
 * dependencyのpackage.jsonから`types`または`typings`を探してそれらをfetchedPathsへ保存する。
 *  */
function fetchFromTypings(
  dependency: string,
  version: string,
  fetchedPaths: iFetchedPaths
) {
  const depUrl = `${ROOT_URL}npm/${dependency}@${version}`;

  // DEBUG:
  console.log(`[fetchFromTypings] fetch ${depUrl}`);

  return doFetch(`${depUrl}/package.json`)
    .then((response) => JSON.parse(response))
    .then((packageJSON: iPackageJson) => {
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
        ).then((fileData: { [path: string]: iMetaFile }) =>
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

function fetchDefinitions(name: string, version: string) {
  if (!version) {
    return Promise.reject(new Error(`No version specified for ${name}`));
  }

  // DEBUG:
  console.log("[fetchDefinitions] " + name + "@ " + version);

  // Query cache for the defintions
  const key: string = `${name}@${version}`;

  return (
    getItem(key, store)
      .catch((e) => {
        console.error(
          "An error occurred when getting definitions from cache",
          e
        );
      })
      .then((result: iFetchedPaths) => {
        if (result) {
          return result;
        }

        // If result is empty, fetch from remote
        const fetchedPaths: iFetchedPaths = {};

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
      })
  );
};

const listener = (event: MessageEvent<iMessageFetchLibs>) => {
  const { name, version, order } = event.data;

  // DEBUG:
  console.log(`[fetchLibs] order: ${order}`);
  console.log(event.data);

  if(order !== "fetch-libs") return;

  console.log(`[onmessage]: ${name}@${version}`);

  fetchDefinitions(name, version).then(
    (result: iFetchedPaths) =>

      self.postMessage({
        name,
        version,
        typings: result
      }),
    (err) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
      }
      else {
        self.postMessage({
          name, version, err
        });
      }
    }
  );
};

self.onmessage = listener;  
self.onmessageerror = (e) => {
  console.error(e);
};


// -----------------------
// TEST
// -----------------------
// Add this file with code below on Codesandbox.
// 
// const _worker = (e: { name: string; version: string }) => {
//   const { name, version } = e;

//   console.log(`[_worker] ${name} ${version}`);

//   return fetchDefinitions(name, version).then(
//     (result) => {
//       return { name, version, typings: result };
//     },
//     (error) => {
//       if (process.env.NODE_ENV !== "production") {
//         console.error(error);
//       }
//     }
//   );
// };

// function mainthread() {
//   // const results = [];

//   // Fetch some definitions
//   const dependencies: iObject = {
//     expo: "29.0.0"
//     // react: "16.3.1",
//     // "react-native": "0.55.4"
//   };

//   Object.keys(dependencies).forEach((name: string) =>
//     _worker({
//       name,
//       version: dependencies[name]
//     })
//       .then((r) => {
//         console.log("solved:");
//         return console.log(r);
//       })
//       .catch((e) => {
//         console.log("Unsolved:");
//         return console.error(e);
//       })
//   );

//   // console.log(results);
// }

// // mainthread();



/****
 * Comment out because this function is not be invoked from anywhere.
 *  */
// const transformFiles = (dir) =>
//   dir.files
//     ? dir.files.reduce((prev, next) => {
//         if (next.type === "file") {
//           return { ...prev, [next.path]: next };
//         }

//         return { ...prev, ...transformFiles(next) };
//       }, {})
//     : {};

