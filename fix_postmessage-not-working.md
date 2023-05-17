# Fix: messaging with worker is not working

git brahc: `feat_imple-monaco-class-component`用のnote.

原因追及用のブランチである。

## 問題

React <StrictMode>だとuseEffectが2度実行されるなどの仕様が存在する。

そういった仕様のせいなのか、

StrcitModeだとなぜかworkerとのメッセージのやり取りができなくなることが確認された。

StrictModeじゃないとこれは起こらない...

なのでwebpack-dev-serverのdisconnectedは関係ないことが分かった。

~'strict'だとthisがundefinedになることは関係あるかなぁ？~

関係なかった。


## StrictModeでのworkerのグローバルスコープ

次の方法で確認できる。

```JavaScript
// worker.ts
console.log("self:");
console.log(self);

// Reactコンポーネントは`<StrictMode>`でラップする。
```
```bash
# 1度目のuseEffect()
self:
Window
# 2度目のuseEffect()
self:
DedicatedWorkerGlobalScope
```

実行環境が異なるようである。

## onmessageもaddEventListenerもundefinedの可能性

worker側にはその可能性はなかった。

```JavaScript
// worker.ts
const listener = (e) => {
    // ...
};
self.onmessage = listener;

console.log("self:");
console.log(self.addEventListener);
console.log(self);

// Reactコンポーネントは`<StrictMode>`でラップする。
```
```bash
self:
f addEventListener([native code])
DedicatedWorkerGlobalScope
    onmessage: f listener()     // nullではなく登録した関数だった。
```
上記の通り期待通りに動作している。

Chrome DevToolsでも確認できる。

`"Elements" --> "EventListeners"`

どうもこの`DevTools::EventListeners`を見る限り、App.tsx側のeventlistenerが存在しなかったので、

Reactコンポーネント側の問題か？



## `globalThis`

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis

