# addExtraLib()でmonaco-editorにライブラリを追加させる機能の実装

## タスク

TODO: addExtraLibs()にかかわる一連の処理の実装

ひとまずできたけど、本当に反映できているのか不明。確認したい。

TODO: monacoWillMountProcess.tsをマウント時に一度だけ実行するようにする。

## 実装

## 実装：addExtraLibs関連

componentDidMount

- 依存関係取得の依頼をfetchlibs.workerへ出す
- workerが依存関係を取得して呼び出し元へ帰す
- 呼出もとは返事が届き次第addExtraLibsする


TODO: 処理内容をまとめて記録




