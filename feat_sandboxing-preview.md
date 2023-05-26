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

#### 参考：公式playgroundの解析

functiion doRun(): load new iframe
	onload: runIframe.contentWindow.load()

	iframe.src = 'playground/playground-runner.html';

https://github.com/microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground-runner.html

	結局eval()してましたわ。
	eval()でいいわ。


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

ひとまずworkerの利用はやめてメインスレッドから直接fetchするようにした。

workerがうまくいかない件の検証

- self.onmessage(), worker.onmessage()が全く役に立たない件。各スコープで確かにonmessageが指定した関数であることが確認できるがメッセージを受け取らない。
- self.addEventListener()は動いている模様。monaco-editorのworkerからのメッセージを受け取ることはできているのが確認できる。メインスレッドと自前のワーカーとの間の通信だけできていない。
- メインスレッドでのworker.addEventListener('message', )はなぜかついていない。これはDevTools::Elements::EventListenersから確認できた。
- CORS制限なのでは？：`devServer: {headers: {'Access-Control-Allow-Origin': '*'}}`にしていても通信できない。なので関係ないことが確認できる。


StrictModeを外してから動かしてみたらわかったこと：

- 上記以外のエラーはなかった。つまりStrictModeじゃなければメッセージのやり取りはできている。


- StrictModeを外したときでもworker.addEventListener()は確認できるか？: 確認できない。そういうものなんだと思って。

- StrictModeを外したときでもself.onmessage()は呼ばれていないか？：addEventListenerもonmessageも両方ちゃんと呼ばれている。なのでonmessageがなぜか使われていないというのは勘違いな模様。

- メインスレッドとワーカの間のメッセージのoriginが空文字列である。

```JavaScript
MessageEvent {isTrusted: true, data: {…}, origin: '', lastEventId: '', source: null, …}
isTrusted: true
bubbles: false
cancelBubble: false
cancelable: false
composed: false
currentTarget: DedicatedWorkerGlobalScope {name: '', onmessageerror: null, onmessage: ƒ, cancelAnimationFrame: ƒ, close: ƒ, …}
data: {order: 'bundle', code: "import { createRoot } from 'react-dom/client';\r\nim…getElementById('root'));\r\nroot.render(<App />);\r\n"}
defaultPrevented: false
eventPhase: 0
lastEventId: ""
origin: ""
ports: []
returnValue: true
source: null
srcElement: DedicatedWorkerGlobalScope {name: '', onmessageerror: null, onmessage: ƒ, cancelAnimationFrame: ƒ, close: ƒ, …}
target: DedicatedWorkerGlobalScope {name: '', onmessageerror: null, onmessage: ƒ, cancelAnimationFrame: ƒ, close: ƒ, …}
timeStamp: 0
type: "message"
userActivation: null
```

crossoriginisolated?
globalThis?

TODO: とにかく投稿しよう

#### CORS error

fetchしたらcross-originのエラー出た。

```bash
Access to fetch at 'https://unpkg.com/esbuild-wasm@0.17.16/esbuild.wasm' (redirected from 'http://unpkg.com/esbuild-wasm@0.17.16/esbuild.wasm') from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

そういえばworkerへのpostmessageはいつもなぜかoriginが空だから、

それではじかれていたのかも？エラー表示してほしいけどね。

参考： [webpack cross origin](#webpack-cross-origin)

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
			'Access-Control-Allow-Origin': 'unpkg.com',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': '*',
		}
	},

```


- Access-Control-Allow-Origin: 'unpkg.com'：いまのところここにしか用がないので。確認したところ設定は問題ない。
- TODO: 'Access-Control-Allow-Headers' を絞り込む
- TODO: 'Access-Control-Allow-Methods' を絞り込む


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
