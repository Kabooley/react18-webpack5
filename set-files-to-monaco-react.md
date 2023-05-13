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

codesandbox vanillaで動かせるように修正したtypings.worker

JavaScript file ver: `./addtypings-js-sample.js`
TypeScript file ver: `./addtypings-ts-sample.ts`

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
# fetchDefinitions()
[fetchDefinitions] expo@ 29.0.0 
#   idb-keyval::getItem() returns error
#   Because the module is not cached yet.
An error occurred when getting definitions from cache 
Error {}
#   idb-keyval.catch().then()::fetchFromTypings()
# fetchFromTypings()
#   doFetch() returns response.text() (And cache url & promise pair)
[fetchFromTypings] fetch https://cdn.jsdelivr.net/npm/expo@29.0.0 
[fetchFromTypings] packageJSON:  
#   doFetch()がfetch(https://cdn.jsdelivr.net/npm/expo@29.0.0).text()した中身
#   expoのpackage.jsonを取得するらしい
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
#   このpackageJSONのオブジェクトの中に、
#   `typings`または`types`がない --> エラーを返す
#   ある --> getFileMetaData()を返す

# おそらくエラーが返された。次のcatch()へ移動し、fetchFromMeta()を呼び出した。
# 
# fetchFromMeta()
[fetchFromMeta] fetch https://data.jsdelivr.com/v1/package/npm/expo@29.0.0/flat 

#   doFetch()がfetch(https://data.jsdelivr.com/v1/package/npm/expo@29.0.0/flat).text()した中身
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
        
# filterAndFlatten()
# とにかくmeta.filesのなかから、.d.tsまたは.tsファイルを探す。
# なければエラーを返す
# あればそれらをdoFetch()で取得し、
# fetchedPathsへ格納する

# おそらくここでもエラーを返されたようなので、fetchFromDefinitleTyped()へ
# 
# fetchFromDefinitleTyped()
[fetchFromDefinitleTyped] fetch https://cdn.jsdelivr.net/npm/@types/expo/index.d.ts 

solved: 
# typeings: ObjectのObjectがfetchedPaths
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

```bash
[_worker] expo 29.0.0 
[fetchDefinitions] expo@ 29.0.0 
[]
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

# fetchFromMeta()
[fetchFromMeta] fetch https://data.jsdelivr.com/v1/package/npm/expo@29.0.0/flat 
[fetchFromMeta] meta: 
{default: "/src/Expo.min.js", files: Array(133)}
default: "/src/Expo.min.js"
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
3: Object
4: Object
5: Object
6: Object
7: Object
# ...

# fetchFromDefinitleTyped()
[fetchFromDefinitleTyped] fetch https://cdn.jsdelivr.net/npm/@types/expo/index.d.ts 

# mainthread()
solved: 
{name: "expo", version: "29.0.0", typings: Object}
name: "expo"
version: "29.0.0"
typings: Object
# typingsの中身：
node_modules/expo/index.d.ts: "// Type definitions for expo 32.0
// Project: https://github.com/expo/expo/tree/master/packages/expo
// Definitions by: Konstantin Kai <https://github.com/KonstantinKai>
//                 Martynas Kadiša <https://github.com/martynaskadisa>
//                 Jan Aagaard <https://github.com/janaagaard75>
//                 Sergio Sánchez <https://github.com/ssanchezmarc>
//                 Fernando Helwanger <https://github.com/fhelwanger>
//                 Umidbek Karimov <https://github.com/umidbekkarimov>
//                 Moshe Feuchtwanger <https://github.com/moshfeu>
//                 Michael Prokopchuk <https://github.com/prokopcm>
//                 Tina Roh <https://github.com/tinaroh>
//                 Nathan Phillip Brink <https://github.com/binki>
//                 Martin Olsson <https://github.com/mo>
//                 Levan Basharuli <https://github.com/levansuper>
//                 Pavel Ihm <https://github.com/ihmpavel>
//                 Bartosz Dotryw <https://github.com/burtek>
//                 Jason Killian <https://github.com/jkillian>
//                 Satyajit Sahoo <https://github.com/satya164>
//                 Vinit Sood <https://github.com/vinitsood>
//                 Mattias Sämskar <https://github.com/mattiassamskar>
//                 Julian Hundeloh <https://github.com/jaulz>
//                 Matevz Poljanc <https://github.com/matevzpoljanc>
//                 Romain Faust <https://github.com/romain-faust>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

export * from 'react-native-maps';
export { default as MapView } from 'react-native-maps';

import { EventSubscription } from 'fbemitter';
import { Component, ComponentClass, Ref, ComponentType } from 'react';
import {
    ColorPropType,
    ImageRequireSource,
    ImageURISource,
    LinkingStatic as ReactNativeLinkingStatic,
    NativeEventEmitter,
    ViewProps,
    ViewStyle,
    Permission,
    StyleProp
} from 'react-native';
// ...."
# ...
```

ということで、

`fetchedPaths`:

```TypeScript
/***
 * interface for `fetchedPaths`.
 * 
 * key [modulePath: string] - type definition path of the module 
 * value - definitions of the type definition file
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
interface iFetchedPaths {
  [modulePath: string]: string;
};
// 
```


#### 実装：moduleをaddExtraLibsする処理

- 依存関係を取得する(エディタ上のimportなど)
- 依存関係をworkerへpostする
- workerから戻ってきたデータを以下のように`_addTypings`へ渡す

今のところ、取得すべき依存関係はハードコーディングする。
TODO: 要実装：依存関係を取得するプロセス。

```TypeScript
// App.ts::defualtValueでimportしている依存関係
const dependencies = {
  react: "18.2.0",
  "react-dom": "18.2.0",
  bulma: "0.9.4"
};
```


```TypeScript
interface iTypings {
  path: string;
  definition: string;
};

  _addTypings = ({ typings }: iTypings ) => {
    Object.keys(typings).forEach(path => {
      let extraLib = extraLibs.get(path);

      extraLib && extraLib.dispose();
      extraLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(
        typings[path],
        path
      );

      extraLibs.set(path, extraLib);
    });
  };
```

TODO: 公式playgroundでテストしてみよう。

```JavaScript

// NOTE: definitionはiTypings.definitionのこと
monaco.languages.typescript.typescriptDefaults.addExtraLib(
    definition,
    "node_modules/react/index.d.ts"
);

const model = monaco.editor.createModel(
  "import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);",
  "typescript",
  monaco.Uri.parse("file:///main.tsx")
);

monaco.editor.create(document.getElementById("container"), { model });
```

#### 実装：依存関係を取得する仕組み

[実装：moduleをaddExtraLibsする処理](#実装：moduleをaddExtraLibsする処理)より。

onchangeイベント
--> value取得
--> valueをparseする
--> 依存関係を解決する

#### autocomplete suggestionsを出す

## JavaScript Tips

#### short circuit evaluation: `z = x || y`

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR

https://stackoverflow.com/questions/2100758/javascript-or-variable-assignment-explanation

> If x can be converted to true, returns x; else, returns y.

ということで次の通り。

```JavaScript
const y = 11;
const z = true || y;  // z: true
const x = false || y; // x: 11
```

つまりオペランドの左が真なら左の値を返し、偽なら右の値を返す。
