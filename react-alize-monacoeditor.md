# Make monaco-editor a React Component

## 参考

https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf

https://github.com/satya164/monaco-editor-boilerplate

webworker + React:



## React化するにあたって

monaco-editor標準機能の`monaco.editor.onDidChange()`などのイベントリスは使わない

Reactの機能と衝突する可能性があるため。

基本的にuseEffect()とuseRef()とインスタンス変数保持で対応する

## ReactとuseEffect()しか使わないコンポーネントの連携

https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf/Using the editor as a React Component

propsの更新があったときにエディタのコンテンツも更新する必要がある



## 実装：ESLint

## 実装：