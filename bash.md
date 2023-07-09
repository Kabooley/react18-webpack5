# Note: Today I Learned about Bash

## Move files at once using find.

https://unix.stackexchange.com/questions/154818/how-to-integrate-mv-command-after-find-command

https://qiita.com/kjm_nuco/items/6a4faf4d026d130e7db1#-find-%E6%A4%9C%E7%B4%A2%E5%85%88--exec-%E5%AE%9F%E8%A1%8C%E3%81%97%E3%81%9F%E3%81%84%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89-

```bash
# カレントディレクトリから、`feat_*.md`という条件に一致するファイルをすべて
# ./Dev-Notes以下へ移動せよというコマンド
$ find . -name "feat_*.md" -exec mv -t ./Dev-Notes {} +;
```

> {}には、findで探してきたファイルやディレクトリが入るイメージ。
;は、-execの実行するコマンドの終わりはセミコロンで区切るというルールに基づきます。
\でエスケープしているのは、;は通常、「複数コマンドを続けて実行」する意味があるからです。