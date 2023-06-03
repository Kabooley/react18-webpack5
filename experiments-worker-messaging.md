# 実験記録：worker通信の正常化

TODO: このブランチに於いてこのnoteだけ元のブランチ(feat_sandboxing-...)へマージさせること
TODO: stackoverflowへの返信。

## わかったこと

NOTE: 原因：useMemo()が一度terminateされたworkerを保持し続けているからかも。
解決策：workerとやりとりするコンポーネントはclassコンポーネントにして、field変数としてworkerを保持することで回避できる。

- monaco-editorとかサードパーティのライブラリは関係なく、strictmode且つ現状のコードだとworkerと通信できない

最小コードで走らせてみたところ確認できたのでこのとおり。

- useMemo()が、useEffect()の2度実行にまたがってworkerを保持している可能性がある。そのために、一度目のuseEffect()の実行時にworker.terminateされるが、useMemo()に依存関係がないためにterminateされたままのworkerを保持しているのである。

NOTE: 憶測の域である。確認できないため。

となるとuseMemo()で保持しない方がいいというのが解になるが...

そうなるとclass化するのがいいのでは？となるなぁ

## ためしてみること

- [class component化](#class-component化)
- [サードパーティライブラリを使う](#サードパーティライブラリを使う)

####  class component化

workerの方はそのまま。

なぜclass化が有効だと思ったのか？

- useMemo()と違う方法で？毎レンダリングにまたがってworkerを保持してくれるから。
- （これは別に期待していないことなんだけど）StrictModeではcomponentDidMount()は2度実行されないから。2度実行されるのはuseEffect()である。


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


#### サードパーティライブラリを使う

comlinkとか？

classコンポーネント化が成功ならここは無視。


## test環境

```TypeScript
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

## 別件

#### Git 別ブランチの特定のファイルだけマージしたいとき

https://stackoverflow.com/questions/449541/how-can-i-selectively-merge-or-pick-changes-from-another-branch-in-git


案１：

https://jasonrudolph.com/blog/2009/02/25/git-tip-how-to-merge-specific-files-from-another-branch/

```bash
$ git checkout source_branch -- path/to/file
# Resolve conflicts if any
$ git commit -am "..."
```

要約すると、

特定のファイルのみgit checkoutできるから、

その切ったブランチをマージするだけ、みたいな。

```bash
$ git branch
  development
  feat_imple-monaco-class-component
  feat_multi-file
  feat_resizable-container
  feat_sandboxing-preview
  main
* temp_makesure_worker

$ git switch feat_sandboxing-preview
$ git branch
* feat_sandboxing-preview
$ git checkout temp_makesure_worker -- experiments-worker-messaging.md
```