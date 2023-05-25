# Note Sandboxing preview

iframeで囲ったpreviewへ如何にして安全にコードを送信し実行させるか

NOTE: やっぱりなぜかwokrerが使えないのでfetchすることにする

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

#### CORS error

fetchしたらcross-originのエラー出た。

```bash
Access to fetch at 'https://unpkg.com/esbuild-wasm@0.17.16/esbuild.wasm' (redirected from 'http://unpkg.com/esbuild-wasm@0.17.16/esbuild.wasm') from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

そういえばworkerへのpostmessageはいつもなぜかoriginが空だから、

それではじかれていたのかも？

エラー表示してほしいけどね。


cross-originする方法の模索

[webpack cross origin](#webpack-cross-origin)

```JavaScript
// webpack.config.js
	devServer: {
		static: './dist',
		hot: true,
		port: 8080,
		allowedHosts: 'auto',
		// DEBUG:
		// Only for development mode
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': '*',
		}
	},

```

NOTE: 開発中だけ...としたいところだけどどう考えても危険なので絞り込むよう検証しなくてはならない

unpkg.comとworkerを許可しなくてはならない

TODO: workerが使えるようになったか確認
TODO: 'Access-Control-Allow-Origin' を絞り込む
TODO: 'Access-Control-Allow-Headers' を絞り込む
TODO: 'Access-Control-Allow-Methods' を絞り込む


## cross origin

https://fetch.spec.whatwg.org/#access-control-allow-headers-response-header

https://fetch.spec.whatwg.org/#access-control-allow-methods-response-header

https://fetch.spec.whatwg.org/#access-control-allow-origin-response-header

#### webpack cross origin

https://stackoverflow.com/questions/31602697/webpack-dev-server-cors-issue

#### webpack dev server

https://webpack.js.org/configuration/dev-server/#devserver-headers-

`devServer.allowedHosts`: dev serverへアクセスするのを許されるホストのリストを指定できる

`all`とするのは非推奨である。

`autp`とすると常に`localhost`, `host`, `client.webSocketURL.hostname:`が許可される。



## esbuild

#### esbuild.BuildOptions

entryPoints:

https://esbuild.github.io/api/#entry-points

出力されるファイルのこと。そのエントリーポイント。
