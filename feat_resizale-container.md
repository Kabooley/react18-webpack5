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



## どれにラップする？

```JavaScript
const Layout = (): JSX.Element => {
  return (
    <div>
      <Header />
      <MainContainer>
        <Resizable direction={"horizontal"} >
          <EditorSection />
        </Resizable>
        <PreviewSection />
      </MainContainer>
    </div>
  );
};

```

いまんところだいぶ上の方でラッピングしているので間に挟んでいるｺﾝﾎﾟｰﾈﾝﾄ分リサイズがずれる

MainContainer
  Resizable
    EditorSection
      MonacoContainer
          div.monaco-container
            Tabs
            MonacoEditor
    PreviewSection

```HTML
<body>
		<div id="root">
      <div>
        <div class="header-section">HEADER</div>
        <div class="main-container">
          <div class="resize-horizontal react-resizable" style="width: 684px;">
            <div class="editor-section">
              <div class="monaco-container">
                <div class="tab-area">
                  <!-- tabs -->
                </div>
                <!-- ここからがmonaco-editorが独自に挿入する部分であり -->
                <!-- MonacoEditorコンポーネントでもある -->
                <section style="width: 100%; height: 90vh;">
                  <div class="monaco-editor" style="width: 100%; height: 100%; --vscode-editorCodeLens-lineHeight: 16px; --vscode-editorCodeLens-fontSize: 12px; --vscode-editorCodeLens-fontFeatureSettings: &quot;liga&quot; off, &quot;calt&quot; off; --code-editorInlayHintsFontFamily: Consolas, 'Courier New', monospace;" data-keybinding-context="2" data-mode-id="typescript"><div class="monaco-editor no-user-select  showUnused showDeprecated vs-dark" role="code" data-uri="file:///main.tsx" style="width: 684px; height: 180px;"><div data-mprt="3" class="overflow-guard" style="width: 684px; height: 180px;"><div class="margin" role="presentation" aria-hidden="true" style="position: absolute; transform: translate3d(0px, 0px, 0px); contain: strict; top: 0px; height: 266px; width: 26px;">
                    <div class="glyph-margin" style="left: 0px; width: 0px; height: 266px;"></div><div class="margin-view-zones" role="presentation" aria-hidden="true" style="position: absolute;"></div><div class="margin-view-overlays" role="presentation" aria-hidden="true" style="position: absolute; font-family: Consolas, &quot;Courier New&quot;, monospace; font-weight: normal; font-size: 14px; font-feature-settings: &quot;liga&quot; 0, &quot;calt&quot; 0; font-variation-settings: normal; line-height: 19px; letter-spacing: 0px; width: 26px; height: 266px;">
                    <!-- .... -->
```

TODO: 親コンポーネントのリサイズに合わせてmonaco-editorはリサイズするかしないかの確認（layout()の呼び出すタイミングにもよると思うけども）
TODO: responsibleにする方法
TODO: react-resizableを使う方法 [react-resizable codesandbox test](#react-resizable-codesandbox-test)


```TypeScript
useEffect(() => {
  window.addEventListener('resize', calElementRect);

  return () => {
    window.removeEventListener('resize', calElementRect);
  }
}, []);


const calcElementRect = () => {
  const elementList = [
    "div.main-container",
    "div.react-resizable",
    "div.monaco-container",
    "div.monaco-editor",
  ];
  elementList.forEach(l => {
    const width = document.querySelector(l).offsetWidth;
    const height = document.querySelector(l).offsetHeight;
    console.log(l);
    console.log(`width: ${width}`);
    console.log(`height: ${height}`);
    console.log(document.querySelector(l).getBoundingClientRect());
    console.log("-------");
  });
};
```

getBoundingClientRect(): css変換された後の座標情報を返す。より厳密
offsetWidth(): 整数に丸めた要素の幅を返す


- 現状、resiable.tsxを付けているとなぜだかdiv.monaco-editorの高さが5pxになる


#### わかったこと


- ResizeObserver - loop limit exceededはひとまず無視していい
- automaticLayoutプロパティはtrueにしておかないとエディタはリサイズしてくれない
- react-resizableコンポーネントをつけているとなぜだかmonaco-editorの高さが変更できない

#### ResizeObserver - loop limit exceeded

https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded

https://github.com/WICG/resize-observer/issues/38

無視していいらしい。

## TEST react-resizable codesandbox 


`devworkes/temporary`