# Note Resizable React Container

## 参考

- udmey stephan portfolio course
- codesandbox ui
なので

ウィンドウサイズ通常時水平方向へのリサイズを想定
窓スプリットするときは、エディタは上下方向へリサイズ

## 実装

#### 手順

- まずmonaco-editorのコンテナサイズを自動リサイズするようにする
- するとmonaco-editorは親コンポーネントのサイズを無視してサイズが変わるようになるので、親コンポーネントのサイズを守るようにさせる
- previewコンテナとサイズを同期させる

#### css

## monaco-editor 調査

## 調査：組み込みリサイズハンドラ

https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneCodeEditor.html#layout

editor.layou()



#### github issue

https://github.com/react-monaco-editor/react-monaco-editor/issues/53

上記で示されている方法をとる。

`handleResize = () => this.editor.layout();`をwindow.onresizeで呼び出せばよい

#### Mediumの記事より

https://berezuzu.medium.com/resizable-monaco-editor-3e922ad54e4

automatic layoutなるオプションを使えとのこと

#### Satyajitのリポジトリより

```JavaScript

    componentDidMount() {
        // ...
        (container-dom-that-will-be-stored-monaco-editor).addEventListener('resize', _handleResize);
    }

  _handleResize = debounce(() => this._editor.layout(), 100, {
    leading: true,
    trailing: true,
  });
```

