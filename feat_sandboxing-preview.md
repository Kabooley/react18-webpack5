# Note Sandboxing preview

iframeで囲ったpreviewへ如何にして安全にコードを送信し実行させるか

## タスク

TODO: EditorSection.tsxからPreviewSection.tsxへバンドル済のコードを渡す手段の模索



## 参考

[monaco-editor公式playgroundソースコード](https://github.com/microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js)


## 問題

- eval()じゃないと渡したコードを実行する手段がない
- [workerがStrcitModeだとうまくいかない件](#workerがStrcitModeだとうまくいかない件)


## iframe

#### バンドルコードを渡す

バンドリングコードを取得する流れ：

- （ひとまず用意した）submitボタンが押されたらeditorのコードを取得してbundleを行うワーカへ投げる
- workerがバンドリングして結果をメインスレッドへ返す
- バンドリングコードをiframeへ何とか渡す(TODO: おさらい)


#### 渡されたコードを実行させる


## 実装

## 実装：バンドリング

stephanのレポジトリの方のやつを移すだけなんだけどね。

esbuild-wasm, axios, localforage, 

```bash
$ yarn add esbuild-wasm axios localforage
$ yarn add @types/localforage 
```
生成：

src/worker/bundle.worker.ts
src/Bundle/index.ts
src/Bundle/plugins/fetchPlugin.ts
src/Bundle/plugins/unpkgPathPlugins.ts

```JavaScript
// webpack.config.js

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.tsx',
		'bundle.worker': './src/worker/bundle.worker.ts',
	},
    // ...
};
```

workerを有効にするので、

```JSON
// tsconfig.json
{
    "lib": [
      "WebWorker", "DOM"
      ],
}
```

```TypeScript
// 
```

## 他

#### workerがStrcitModeだとうまくいかない件

があるのでバンドリングプロセスはReactから直接呼出すようにするかも。

一旦workerでやってみてダメなら直接呼び出す方向に。

