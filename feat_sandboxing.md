# Note Sandboxing preview

iframeで囲ったpreviewへ如何にして安全にコードを送信し実行させるか


## タスク

TODO: EditorSection.tsxからPreviewSection.tsxへバンドル済のコードを渡す手段の模索

別件：TODO: マウントされたらstate.codeを更新すること。いったんeditorを編集しないとどこかのコンポーネントのstate.codeが空のままでバンドルするコードが空のままになってしまう。

TODO: `postMessage(, "http://localhost:8080")`にすると`ailed to execute 'postMessage' on 'DOMWindow': The target origin provided ('http://localhost:8080') does not match the recipient window's origin ('null').`エラーが起きる件。

## 参考

[monaco-editor公式playgroundソースコード](https://github.com/microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js)


## 問題

- [eval()でいいのか？](#eval()でいいのか？)
- [workerがStrcitModeだとうまくいかない件](#workerがStrcitModeだとうまくいかない件)

## eval()でいいのか？

#### 参考：公式playgroundの解析

functiion doRun(): load new iframe
	onload: runIframe.contentWindow.load()

	iframe.src = 'playground/playground-runner.html';

https://github.com/microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground-runner.html

	結局eval()してましたわ。
	eval()でいいわ。
	まぁたいそうなもの作りたいわけはないし...



## workerがStrcitModeだとうまくいかない件

解決：[わかったこと](#わかったこと)

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



#### わかったこと

NOTE: 原因：useMemo()が一度terminateされたworkerを保持し続けているからかも。
解決策：workerとやりとりするコンポーネントはclassコンポーネントにして、field変数としてworkerを保持することで回避できる。

- monaco-editorとかサードパーティのライブラリは関係なく、strictmode且つ現状のコードだとworkerと通信できない

最小コードで走らせてみたところ確認できたのでこのとおり。

- useMemo()が、useEffect()の2度実行にまたがってworkerを保持している可能性がある。そのために、一度目のuseEffect()の実行時にworker.terminateされるが、useMemo()に依存関係がないためにterminateされたままのworkerを保持しているのである。

NOTE: 憶測の域である。確認できないため。

となるとuseMemo()で保持しない方がいいというのが解になるが...

そうなるとclass化するのがいいのでは？となるなぁ

#### 検証：class component化

結論：解決。workerを扱うコンポーネントはクラスにするべき。

workerの方はそのまま。

なぜclass化が有効だと思ったのか？

useMemo()はレンダリングにまたがって変数を保持するから、terminate()済のworkerを保持し続けてしまう。

一方class fieldとして保持する場合、new worker() --> terminate --> new worker()で再生成されたworkerをちゃんと取得できるから。

```TypeScript
import React from 'react';
import type { iMessageBundleWorker } from './worker/temp.worker';

interface iProps {};

class Test extends React.Component<iProps> {
    public tempWorker: Worker | undefined;

    constructor(props: iProps) {
        super(props);
    }


    componentDidMount = () => {
        // DEBUG:
        console.log("[Test.tsx] on did mount");

        this.tempWorker = new Worker(
            new URL('/src/worker/temp.worker.ts', import.meta.url), 
            { type: "module" }
        );
        this.tempWorker.addEventListener('message', this._cbMessageHandler, false);
        this.tempWorker.postMessage({
            order: "order",
            message: "test.tsx is ready"
        });

        console.log(this.tempWorker);
    };

    componentWillUnmount = () => {
        // DEBUG:
        console.log("[Test.tsx] on will unmount");

        this.tempWorker && this.tempWorker.removeEventListener('message', this._cbMessageHandler, false);
        this.tempWorker && this.tempWorker.terminate();
    };

    _cbMessageHandler = (e: MessageEvent<iMessageBundleWorker>) => {
        const { order, ...rest } = e.data;

        
        if(order !== "order") return;

        // DEBUG:
        console.log('[test.tsx] got message');
        console.log(rest);
    };

    onClickHandler = () => {
        // DEBUG:
        console.log('[test.tsx] clicked');
        console.log(this.tempWorker);

        this.tempWorker && this.tempWorker.postMessage({
            order: "order",
            message: "button clicked"
        });
    };

    render() {
        return (
            <div className="test">
                TEST
                <button onClick={this.onClickHandler}>send message</button>
            </div>
        );
    }
};

export default Test;
```
```bash
reportWebVitals.ts:6 [reportWebVitals]
temp.worker.ts:6 [worker] running...
temp.worker.ts:7 Window
TestClass.tsx:16 [Test.tsx] on did mount
TestClass.tsx:28 Worker
TestClass.tsx:33 [Test.tsx] on will unmount
TestClass.tsx:16 [Test.tsx] on did mount
TestClass.tsx:28 Worker
temp.worker.ts:15 [worker] got message
temp.worker.ts:16 Object
temp.worker.ts:6 [worker] running...
temp.worker.ts:7 DedicatedWorkerGlobalScope
TestClass.tsx:46 [test.tsx] got message
TestClass.tsx:47 Object
temp.worker.ts:15 [worker] got message
temp.worker.ts:16 Object
TestClass.tsx:52 [test.tsx] clicked
TestClass.tsx:53 Worker {onmessage: null, onerror: null}
temp.worker.ts:15 [worker] got message
temp.worker.ts:16 {message: 'button clicked'}
```

見たところ、

componentDidMount --> componentWillUnmount --> componentDidMountで、

useEffect()の場合と同じく2度実行されているが、

workerと通信がちゃんとできている！

となると、

やはり問題の原因はuseMemo()がterminateしたworkerを保持し続けている可能性があることである。


#### test環境

```TypeScript
// NOTE: class化する前の関数コンポーネント
import React, { useEffect, useMemo, useRef } from 'react';
import type { iMessageBundleWorker } from './worker/temp.worker';

const Test = () => {
    const tempWorker = useMemo(
        () => new Worker(new URL('/src/worker/temp.worker.ts', import.meta.url), { type: "module" }
    ), []);

    useEffect(() => {
        
        
        // DEBUG:
        console.log("[test.tsx] on did mount");

        if(window.Worker) {
            // DEBUG:
            console.log("[test.tsx] setup worker");

            tempWorker.addEventListener('message', _cbMessageHandler, false);
            tempWorker.postMessage({
                order: "order",
                message: "test.tsx is ready"
            });
        }

        return () => _unmount();
    }, []);

    const _unmount = () => {
        // DEBUG:
        console.log("[test.tsx] on unmount");

        tempWorker && tempWorker.removeEventListener('message', _cbMessageHandler, false);
        tempWorker && tempWorker.terminate();
    };

    const _cbMessageHandler = (e: MessageEvent<iMessageBundleWorker>) => {
        const { order, ...rest } = e.data;

        
        if(order !== "order") return;

        // DEBUG:
        console.log('[test.tsx] got message');
        console.log(rest);
    };

    
    return (
        <div className="test">
            TEST
        </div>
    );
};

export default Test;
```

```TypeScript
export interface iMessageBundleWorker {
    order: "order";
    err: Error;
};

console.log("[worker] running...");
console.log(self);

self.addEventListener('message', (e: MessageEvent<iMessageBundleWorker>) => {
    const { order, ...rest } = e.data;

    if(order !== "order") return;

    // DEBUG:
    console.log('[worker] got message');
    console.log(rest);
});

self.postMessage({
    order: "order",
    message: "worker is ready"
});
```

```TypeScript
import React from "react";
import ReactDOM from "react-dom/client";
import Test from "./Test";
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Test />
  </React.StrictMode>
);

reportWebVitals();
```


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

#### bundledcodeをpreviewへ渡す

NOTE: どうせreduxを使ってディスパッチするので、ひとまずなわけだけど。

まぁ難しいことは考える必要なし。

バケツリレーする場合の流れ：

worker --> MonacoContainer.tsx --> EditorSection.tsx
--> Layout/index.tsx --> PreviewSection.tsx --> Preview.tsx

```bash
# component nest
Layout/index.tsx
    MainContainer
        SplitPane
            EditorSection
                MonacoContainer     # have bundledCode
            PreviewSection          # pass here!
```

ひとまず番d載るコードを渡すことはできている。

なんだか怪しいけれど。

#### test: エディタを編集して別内容にしたらちゃんとバンドルされたコードに更新出来るか？

```JavaScript
// エディタ内に貼り付ける別コード
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const products = [
  { title: 'Cabbage', isFruit: false, id: 1 },
  { title: 'Garlic', isFruit: false, id: 2 },
  { title: 'Apple', isFruit: true, id: 3 },
];

function ShoppingList() {
  const listItems = products.map(product =>
    <li
      key={product.id}
      style={{
        color: product.isFruit ? 'magenta' : 'darkgreen'
      }}
    >
      {product.title}
    </li>
  );

  return (
    <ul>{listItems}</ul>
  );
}


const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ShoppingList />
  </StrictMode>
);
```