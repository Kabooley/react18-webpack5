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
#### autocomplete suggestionsを出す