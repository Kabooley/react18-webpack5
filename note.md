# webpackを理解する

webpack + TypeScript

## 参考

webworkerに関してめっちゃ平易にまとめてくれている助かる投稿：

https://web.dev/workers-basics/

作るアプリケーションの参考にできるかも？トークンをwebworkerへ格納するアプリケーション：

https://engineering.mercari.com/en/blog/entry/20220930-building-secure-apps-using-web-workers/

[メルカリの投稿の件](#メルカリの投稿の件)

## 環境

```bash
# rootDirectory
  webpack-demo
  |- package.json
  |- package-lock.json
  |- tsconfig.json
  |- webpack.config.js
  |- /dist
    |- bundle.js    # Generate this file manually!
    |- index.html
  |- /src
    |- index.js
    |- index.ts
  |- /node_modules
```

https://webpack.js.org/guides/getting-started/

https://webpack.js.org/guides/typescript/

チュートリアルをやりながら何がなんなのかわかるようになろう。

## webpack.config.js

```JavaScript
const path = require('path');

module.exports = {
    // エントリ・ポイント
  entry: './src/index.ts',
  module: {
    rules: [
      {
        // ts-loaderを介して.ts, .tsxファイルをロードする
        test: /\.tsx?$/,
        use: 'ts-loader',
        // node_modulesディレクトリは無視する
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  //  出力ファイル
  output: {
    // バンドリング結果はすべてbundle.jsへ出力される
    filename: 'bundle.js',
    // bundle.jsは./dist/以下にあるという指定
    path: path.resolve(__dirname, 'dist'),
  },
};
```

## dist/index.html

`dist/index.html`からみてバンドリングの出力結果のjsファイルは
`dist/bundle.js`にあるので`src="bundle.js"`になる

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Getting Started</title>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

## Loader

TypeScriptファイルをwebpackに読み取らせるときに必須のパッケージである。

https://webpack.js.org/guides/typescript/#loader

ts-laoder: とにかくTypeScriptのファイルをwebpackに読み取らせたいときは必須である

## Source Map

https://webpack.js.org/guides/development/#using-source-maps

開発の時に便利な機能である。

> webpack がソース コードをバンドルすると、エラーや警告を元の場所まで追跡することが難しくなる場合があります。たとえば、3 つのソース ファイル (a.js、b.js、および c.js) を 1 つのバンドル (bundle.js) にバンドルし、ソース ファイルの 1 つにエラーが含まれている場合、スタック トレースは bundle.js を指します。 .エラーが発生したソースファイルを正確に知りたい場合があるため、これは常に役立つとは限りません。 エラーや警告を追跡しやすくするために、JavaScript はソース マップを提供します。これは、コンパイルされたコードを元のソース コードにマップします。エラーが b.js から発生した場合、ソース マップは正確にそれを示します。 ソース マップに関しては、さまざまなオプションを利用できます。必要に応じて構成できるように、必ずチェックしてください。 このガイドでは、説明目的に適した inline-source-map オプションを使用しましょう (本番用ではありません)。

ということで一つのファイルにバンドリングされるときでも、元のファイルのどこに該当するのかを探すことを可能とさせてくれる機能である。

公式の言うとおりにtsconfig.jsonとwepack.config.jsを更新する

## 非コードアセットを使用するために

非コードアセットとは`*.svg`ファイルなどのこと。

プロジェクトに手動で以下のファイルを追加する

```TypeScript
// rootDir/src/custom.d.ts
declare module '*.svg' {
  const content: any;
  export default content;
}
```

> ここでは、.svg で終わるすべてのインポートを指定し、モジュールのコンテンツを any として定義することによって、SVG の新しいモジュールを宣言します。タイプを文字列として定義することで、URL であることをより明確にすることができます。 CSS、SCSS、JSON などの他のアセットにも同じ概念が適用されます。

## バンドリング実行

```bash
# configファイルは自動で探してくれるので--configは別に必要ない
# 指定する場合
# npx webpack --config webpack.config.js
$ npx webpack
asset bundle.js 69.5 KiB [emitted] [minimized] (name: main) 1 related asset
runtime modules 1010 bytes 5 modules
cacheable modules 532 KiB
  ./src/index.ts 219 bytes [built] [code generated]
  ./node_modules/lodash/lodash.js 531 KiB [built] [code generated]

WARNING in configuration
The 'mode' option has not been set, webpack will fallback to 'production' for this value.
Set 'mode' option to 'development' or 'production' to enable defaults for each environment.
You can also set it to 'none' to disable any default behavior. Learn more: https://webpack.js.org/configuration/mode/

webpack 5.78.0 compiled with 1 warning in 13390 ms
```
bundle.js:

```JavaScript
/*! For license information please see bundle.js.LICENSE.txt */
(()=>{var n={486:function(n,t,r){var e;n=r.nmd(n),function(){var u,i="Expected a function",o="__lodash_hash_undefined__",f="__lodash_placeholder__",a=32,c=128,l=1/0,s=9007199254740991,h=NaN,p=4294967295,v=[["ary",c],["bind",1],["bindKey",2],["curry",8],["curryRight",16],["flip",512],["partial",a],["partialRight",64],["rearg",256]],_="[object Arguments]",g="[object Array]",y="[object Boolean]",d="[object Date]",b="[object Error]",w="[object Function]",m="[object GeneratorFunction]",x="[object Map]",j="[object Number]",A="[object Object]",k="[object Promise]",O="[object RegExp]",I="[object Set]",R="[object String]",E="[object Symbol]",z="[object WeakMap]",S="[object ArrayBuffer]",L="[object DataView]",W="[
    // 省略
```

## package.json

これで`npm run build`すればバンドリングしてくれる

```json
{
   "name": "webpack-demo",
   "version": "1.0.0",
   "description": "",
   "private": true,
   "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    // NOTE: 追加
    "build": "webpack"
   },
   "keywords": [],
   "author": "",
   "license": "ISC",
   "devDependencies": {
     "webpack": "^5.4.0",
     "webpack-cli": "^4.2.0"
   },
   "dependencies": {
     "lodash": "^4.17.20"
   }
 }
```

## Loading CSS

https://webpack.js.org/guides/asset-management/#loading-css

`style-loader`, `css-loader`が必要になる

```bash
$ yarn add style-loader css-laoder --dev
```
TODO: 別ノートに書いたことを張り付ける

## monaco-editorのサンプルを動かす件

webpack + TypeScript + monaco-editor esm webpack sample

教訓：サードパーティ製のモジュールを動かすときはwebpack.coonfig.jsやpackage.jsonをよく確認しよう

```bash
$ yarn add style-loader css-loader file-loader ts-laoder --dev
$ yarn add monaco-editor
$ yarn add 
```

#### TypeScriptを使っているのでts-loaderをwebpack.config.jsへ追加

```JavaScript
const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		app: './src/index.ts',
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
		'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
		'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
	},
  // NOTE: パス解決にtsx系拡張子の追加
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	  },
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
      // NOTE: ts-loaderの追加
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	}
};
```

#### `self`ってなんやねんの件

webpack.config.jsに定義されている模様

```JavaScript
const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
    // NOTE: 現環境はTypeScriptでサンプルと多少構成異なるしで少し修正
		app: './src/index.ts',
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
		'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
		'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
	},
	output: {
    // NOTE: これ！
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	}
};
```

```bash
$ npm run build
```
これでバンドリングの生成は完了できた！

#### webpack-dev-serverで生成されたアプリケーションをすぐに確認する

```JavaScript
const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		app: './src/index.ts',
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
		'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
		'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	  },
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	},
	// NOTE: 以下を公式の指南通りに追加
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
	},
	optimization: {
		runtimeChunk: 'single'
	}
};
```
package.jsonのscriptへ`"start": "webpack serve --open"`追加

ライブで確認できるようになった。

#### manaco-editorが生成されていない問題

ライブで確認できるようになったけれど、どうやら`div.container`のなかにmonaco-editorが生成されていない模様...

まぁサンプル動かすための前段階を会得したいだけだったのでそこはどうでもいいや

## JSX Highlightするために

https://github.com/cancerberoSgx/jsx-alone/blob/master/jsx-explorer/HOWTO_JSX_MONACO.md

https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf

上記を解読する

今のところ他に方法がない。

> 私はReact NativeアプリのオンラインコードエディタであるSnackに携わっています。以前、SnackのコードエディターはAce Editorを使用していましたが、現在はユーザーエクスペリエンスに優れたMonaco Editorに移行しています。Monacoは、公式ドキュメント以外のリソースが少ないため、操作方法を理解するのが大変で、苦労しています。

> その過程で学んだことを、自分自身のエディターを作ろうとしている人たちのために共有したいと思いました。これは決して全機能を網羅したガイドではありませんし、私がSnackで取り組んだことだけを取り上げていますが、良いきっかけになるはずです。

GitHubで頒布されているmonaco-editorは、結局のところwebpackを使用する必要がある

またエディタのパフォーマンスを向上させるためにいくつかのスクリプトをweb workerとしてロードする必要がある

`globalObject: 'gobal'`はwebpack4以降なら使える機能

著者は古いバージョンのwebpackを使わないといけない縛りがあったからマニュアルでバンドリングを実現するためのスクリプトを作成する必要があったが最新バージョンを使うならそれをする必要がない

`import * as editor from 'monaco-editor/esm/editor/editor.main'`するだけ

> また、SnackでJavaScriptバンドルを提供するためにCDNを使用しているため、コードの分割やワーカーが異なるドメインからのものであるため読み込みに問題が発生しました。回避策は、ワーカーをブロブURLとしてロードすることでした。理想的ではありませんが、今のところうまくいっています：

TODO: 続きを。

## React18 + TypeScript + webpack5 + webworker

4/14

参考：

https://medium.com/@tharinduit16/react-18-with-webpack-5-project-setup-steps-a93b4e1aaa3b

の環境を作成してアプリケーションにwebworkerを導入できるのか確かめる

現在の環境

```json
{
  "name": "webpack-playground",
  "version": "1.0.0",
  "description": "webpack + typescript playground",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "node ./node_modules/webpack/bin/webpack.js --progress",
    "start": "webpack serve --open"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/lodash": "^4.14.192",
    "css-loader": "^6.7.3",
    "file-loader": "^6.2.0",
    "lodash": "^4.17.21",
    "style-loader": "^3.3.2",
    "ts-loader": "^9.4.2",
    "typescript": "^5.0.4",
    "webpack": "^5.78.0",
    "webpack-cli": "^5.0.1",
    "webpack-dev-server": "^4.13.2"
  },
  "dependencies": {
    "monaco-editor": "^0.37.1",
    "monaco-editor-webpack-plugin": "^7.0.1"
  }
}
```

ということで、reactとreact-dom他を導入する

```bash
$ yarn add react react-dom --dev
$ yarn add @types/react @types/react-dom --dev
$ yarn add html-webpack-plugin
$ yarn add babel-loader @babel/core @babel/preset-env @babel/preset-react
```

結果：

```json
{
  "name": "webpack-playground",
  "version": "1.0.0",
  "description": "webpack + typescript playground",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "node ./node_modules/webpack/bin/webpack.js --progress",
    "start": "webpack serve --open"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/lodash": "^4.14.192",
    "css-loader": "^6.7.3",
    "file-loader": "^6.2.0",
    "html-webpack-plugin": "^5.5.0",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "style-loader": "^3.3.2",
    "ts-loader": "^9.4.2",
    "typescript": "^5.0.4",
    "webpack": "^5.78.0",
    "webpack-cli": "^5.0.1",
    "webpack-dev-server": "^4.13.2"
  },
  "dependencies": {
    "@babel/core": "^7.21.4",
    "@babel/preset-env": "^7.21.4",
    "@babel/preset-react": "^7.18.6",
    "babel-loader": "^9.1.2",
    "monaco-editor": "^0.37.1",
    "monaco-editor-webpack-plugin": "^7.0.1"
  }
}
```

React18, webpack5, typescript, monaco-editor揃った

#### 作るもの

ひとまずReact18 + webpack5 + TypeScriptでwebworkerが使えることが確認できれば良い

- React UIで何か操作をする
- 操作の指示がworkerへ伝わる
- workerがなんか重い処理をする
- その間UIはフリーであることを確認する
- workerが結果を返す
- UIに結果を表示させる

ができることを確認する


#### Standard React Root component looks like

https://stackoverflow.com/a/71668419

```TypeScript
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
```

<StrictMode>:

https://react.dev/reference/react/StrictMode

アプリケーションのルートコンポーネントを`StrictMode`でラッピングするだけで

ストリクトモードをアプリケーション全体に適用させることができる

`reportWebVitals`:

https://create-react-app.dev/docs/measuring-performance/

> この関数は、いずれかのメトリクスの最終値がページ上で計算を終了したときに発行されます。この関数を使用して、コンソールに結果を記録したり、特定のエンドポイントに送信したりすることができます。

> ウェブ・バイタル
> ウェブバイタルは、ウェブページのユーザーエクスペリエンスを把握することを目的とした、便利なメトリクスのセットです。Create React Appでは、これらのメトリクス（ウェブバイタル）を測定するためにサードパーティーのライブラリーが使用されます。

> メトリクス値が計算されたときに関数に返されるオブジェクトについて詳しく理解するには、ドキュメントを参照してください。また、「ブラウザサポート」では、どのブラウザがサポートされているかについても説明しています。

今回の趣旨とは外れるから実装はしない。

#### webworkerはimportしない。new Worker()で初めてとりこむのだ

```TypeScript
// こうはしない
import worker from './worker/index.ts';

// こうする
const worker: Worker = new Worker(new URL('./worker/index.ts'), import.meta.url);
```

まぁ考えてみればその通りなのだが。

workerにはexportするものはないし、

そもそもコンテキストが異なるから取りこむことできないしね

#### `import.meta.url`とは

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta

es2020で追加された機能の模様。

現状、

```TypeScript
  const worker: Worker = useMemo(() => new Worker(
      new URL(
          "./worker/index.ts", 
          import.meta.url     // Error
      )
  ), []);

  
// `The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', or 'nodenext'.`
```

というシンタックスエラーが発生する。

tsconfig.jsonで`"module": "ES2020"`に変更してみた。

解決。

参考：https://github.com/kulshekhar/ts-jest/issues/1174

#### webworkerスコープでは`self`を特に何か設定なしで使っても大丈夫なのか？

結論：そこがワーカースコープであるならば問題ない。

ワーカスコープでは`self`か`this`がグローバルスコープとして使うことができるが、

以下の説明の通り`window`を使うとエラーになる。

以下のようにコメントアウトしてもシンタックスエラーは出なかった。

TODO: 要確認：コンパイル時にどうなるか

wepack.config.js

```JavaScript
module.exports = {
	entry: {
		index: './src/index.tsx',
		// worker: './src/worker/index.ts'
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	  },
	output: {
		// globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true
	},
	// ...
};
```

https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api

> webworkerが実行される環境は現在の`window`(がグローバルであるスレッド）とは異なるworkerスレッドで実行される。

> workerコンテキストは(専用ワーカーの話なら)`DedicatedWorkerGlobaleScope`オブジェクトが表現するコンテキストである（windowオブジェクトと異なるということ）

https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#worker_global_contexts_and_functions

> ワーカーは、現在のウィンドウとは異なるグローバル コンテキストで実行されます!ワーカーは Window を直接利用できませんが、同じメソッドの多くが共有 mixin (WindowOrWorkerGlobalScope) で定義されており、WorkerGlobalScope から派生した独自のコンテキストを通じてワーカーが利用できるようになっています。

#### やりとりするメッセージはJSONにしないといかんのか？

結論：自由であるが、複雑なデータを扱うなら使うとよい。

https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#transferring_data_to_and_from_workers_further_details

やり取りするメッセージのデータは**コピーされる**

なので各々常に複製されたデータがやり取りされる。

https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#passing_data_examples

もしも複雑なデータをやりとりするならJSONデータにすることができるらしい。

#### Transferrable Objects

https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#transferring_data_to_and_from_workers_further_details

https://web.dev/workers-basics/#transferrable-objects

データはコピーされるので、

例えば巨大なデータをワーカとメインの間でやり取りすると果てしないオーバーヘッドが発生することになる。

そのため巨大データをやり取りするための方策が、transferrable objectsである

多分Node.jsのstreamのように、データを分割して送信する方法のことだと思う。




#### `self.onmessage`と`self.addEventListener()`どちらを使えばいいの？

https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event#examples

どっちでも同じことかと

`onmessage`は予約語でグローバルオブジェクトに備わっているメソッドであると考えられる。


#### Handling webworker errors

https://web.dev/workers-basics/#handling-errors


## メルカリの投稿の件

> トークンを Web ワーカーに保存すると、攻撃者はメイン スレッドでトークンにアクセスできなくなります。また、攻撃者はトークンを使用してサーバーへの API 呼び出しを行うようにワーカー スレッドに指示することはできません。これは、ドメインの検証に失敗するためです。この新しい設計により、クロス サイト スクリプティングの場合の爆発範囲が縮小されますが、完全な保護ではないことに注意してください。攻撃者は JavaScript を実行するためのアクセス権を持っているため、新しいワーカーを登録し、すべての初期化/アクセス トークン生成手順を再度実行できます。 Web Worker を導入することで、攻撃者にとってトークンを盗むプロセスが少し難しくなりました。

ということで防ぎきることはできないけれど抑制にはなるとのこと。

webworkerを使った認証プロセス

client <--> webworker <--> server

（書籍の方にも載っているかも）

具体的な実装は載っていないから自分で作るしかないねぇ


## 本家 monaco-editor + TypeScript + React + webpack

`monaco-editor/sample/monaco-esm-webpack-typescript`のビルドを試す。

結果：ちゃんと動いた！

依存関係：

```JSON
{
	"name": "monaco-esm-webpack-typescript",
	"scripts": {
		"start": "node ../node_modules/webpack-dev-server/bin/webpack-dev-server.js",
		"build": "NODE_ENV='production' node ../node_modules/webpack/bin/webpack.js --progress"
	},
	"dependencies": {},
	"devDependencies": {
		"@babel/core": "^7.17.0",
		"@babel/preset-env": "^7.16.11",
		"@babel/preset-react": "^7.16.7",
		"@babel/preset-typescript": "^7.16.7",  // 未install
		"@pmmmwh/react-refresh-webpack-plugin": "^0.5.4",  // 未install
		"@types/react": "^17.0.39",
		"@types/react-dom": "^17.0.11",
		"babel-loader": "^8.2.3",
		"react": "^17.0.2",
		"react-dom": "^17.0.2",
		"react-refresh": "^0.11.0"  // 未install
	}
}
```

現状のpackage.jsonを確認したところ、上記の依存関係が不足していたのでインストール


webpack.config.js:

まぁサンプルの通りにするわけだけど

省略

tsconfig.json:

```JSON
{
	"compilerOptions": {
		"sourceMap": true,
		"module": "commonjs",
		"moduleResolution": "node",
		"strict": true,
		"target": "ES6",
		"outDir": "./dist",
    // lib追加
		"lib": ["dom", "es5", "es2015.collection", "es2015.promise"],
		"types": [],
		"baseUrl": "./node_modules",
		"jsx": "preserve",
		"esModuleInterop": true,
    // 以下追加
		"typeRoots": ["node_modules/@types"]
	},
	"include": ["./src/**/*"],
	"exclude": ["node_modules"]
}
```

#### サンプルをいじって各種の設定を導入できるのか試す

