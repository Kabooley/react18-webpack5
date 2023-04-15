# 環境構築メモ webpack + typescript

https://webpack.js.org/guides/typescript/

https://www.typescriptlang.org/download

https://medium.com/@greg.doud/setting-up-a-development-environment-for-typescript-d2c3593af7c6

Node.jsプロジェクトの方のノートが詳しいよ！

```bash
$ cd project-dir
$ npm init
# define dir information
# On root dir
$ mkdir src/ dist/
$ yarn add webpack --dev
$ yarn add typescript ts-loader --dev
$ touch webpack.config.json
$ npx tsc --init
```