# task list

## summary

Major Problems:
TODO: Passing message between worker and React in StrictMode.
Now asking to Stackoverflow.
TODO: Complete implementing bundling process.
TODO: Complete implementing adding libraries process.
TODO: Complete implementing jsx-highlighting process.
TODO: Implement installing dependencies process.



functionality:
TODO: Allow files to be added to or removed from App.

- ファイルを追加・削除可能にする
- paneにファイルを

view:
TODO: Show all files according to `files` data
TODO: Open related model on editor when filename on pane clicked.
TODO: Let pane to openable and closable.
TODO: Rename-able filename on pane.

## bugs

## performance

- too much component update when resize editor-section.

多分`MonacoEditor.tsx`の`_refEditorNode.current.addEventListener('resize', _onResize);`が原因でしょう。

リサイズしないという選択肢はないから、ondragdrop時にリサイズするか、setTimeoutでdebounceする。

