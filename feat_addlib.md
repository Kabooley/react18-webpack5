# addExtraLib()でmonaco-editorにライブラリを追加させる機能の実装

## 参考 

https://github.com/microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js

## タスク

TODO: addExtraLibs()にかかわる一連の処理の実装

ひとまずできたけど、本当に反映できているのか不明。確認したい。

TODO: monacoWillMountProcess.tsをマウント時に一度だけ実行するようにする。

addExtraLibsにライブラリをついかするとぐたいてきにどうなるの？



## 実装

## 実装：addExtraLibs関連

componentDidMount

- 依存関係取得の依頼をfetchlibs.workerへ出す
- workerが依存関係を取得して呼び出し元へ帰す
- 呼出もとは返事が届き次第addExtraLibsする


TODO: 処理内容をまとめて記録


## `addExtraLib`

https://microsoft.github.io/monaco-editor/docs.html#interfaces/languages.typescript.LanguageServiceDefaults.html#addExtraLib



実際にどうなるのかを、公式のplaygroundをいじって確かめてみる。

どんな設定をあらかじめ設定しておかなければならないかも確かめる。


#### 情報収集

- https://microsoft.github.io/monaco-editor/playground.html?source=v0.38.0#example-extending-language-services-configure-javascript-defaults

> 定義と参照を解決するとき、エディターは作成されたモデルを使おうとします。
ライブラリのモデルを作成することで、"peek definition/references "コマンドがライブラリと連動するようになります。

つまり、addExtraLibするだけじゃなく、

その追加したライブラリのmodelも作っておけということなのかしら。

- https://stackoverflow.com/a/43080286/22007575

> 少し遊んでみたところ、解決策が見つかりました。基本的には、createModelを使用して、ファイルのURLを明示的に指定してファイルを読み込む必要があります。そうすれば、node_module/@typesの相対ファイルパスが機能します。これが、プレイグラウンドで使用できる私の解決策です：

もしかしたらライブラリのパスの解決ができていないのかも。

```TypeScript
const defaultCompilerOptions: Monaco.languages.typescript.CompilerOptions = {
  // ...
    typeRoots: ["node_modules/@types"],
};
```

上記のようにコンパイラオプションを定義したけれど、

今のところアプリケーションが引っ張ってくるライブラリのパスは

`node_modules/react/index.d.ts`で登録される。

しかし、これは多分最終的に次の場所を参照されるはず

`node_modules/@types/react/index.d.ts`

多分この食い違いが参照できない理由かも？

なので登録されるパスを

`node_modules/react/index.d.ts`ではなく

`node_modules/@types/react/index.d.ts`になるように変更すればいいのかも

いや、

コンパイラオプションの方を

```TypeScript
typeRoots: ["node_modules/"],
```

に変更すればいいかも？

いややっぱり@typesはついていた方がパス解決速度上がるからつける方向で。

```TypeScript
// 現在のmodelは何があるのかの確認

```

- 取得したファイルがinvalidの可能性？

- https://github.com/Microsoft/monaco-editor/issues/1415

```TypeScript
  _addTypings = (typings: iFetchedPaths) => {
    const MONACO_LIB_PREFIX = 'file:///';

      Object.keys(typings).forEach(path => {
        const _path = `${MONACO_LIB_PREFIX}${path}`;
        let extraLib = extraLibs.get(_path);
  
        extraLib && extraLib.dispose();
        extraLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(
          typings[path],
          _path
        );
        monaco.editor.createModel(typings[path], "typescript", new monaco.Uri().with({_path}));
      
        extraLibs.set(_path, extraLib);
      });
  };

```
```TypeScript
// to makesure model is generated propery
const _subModelChange = useRef<monaco.IDisposable>();

_subModelChange.current = monaco.editor.nDidCreateModel((m) => console.log(m));
```