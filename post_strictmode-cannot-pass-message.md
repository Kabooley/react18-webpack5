---- Original text

# React `StrictMode` does not allow message exchange between worker and React component.

I am currently developing an application using webpack5 and React18.

I created the following code to exchange messages with webworker and React component which uses monaco-editor.

I expected app runs like following.

- When button clicked, onSubmit() fires and send value to worker.

- Worker get message with value, bundle it and send bundledCode back.

```TypeScript
// React component
import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './Monaco/MonacoEditor';
import type { iMessageBundleWorker } from "../worker/types";

const MonacoContainer = (props) => {
    const [value, setValue] = useState<string>("");
    const bundleWorker = useMemo(
        () => new Worker(new URL('/src/worker/bundle.worker.ts', import.meta.url), { type: "module" }
        ), []
    );

    useEffect(() => {
        if(window.Worker) {
            bundleWorker.addEventListener('message', _cbBundledMessage, false);
        }

        return () => {
            _onUnmount();
        }
    }, []);

    const _onUnmount = () => {
        bundleWorker && bundleWorker.removeEventListener('message', _cbBundledMessage, false);
        bundleWorker && bundleWorker.terminate();
    };


    const _onSubmit = () => {

        console.log("Send code to worker");

        bundleWorker.postMessage({
            order: "bundle",
            code: value
        });
    };

    const _cbBundledMessage = (e: MessageEvent<iMessageBundleWorker>) => {

        console.log("Got message from worker");

        const { bundledCode, err } = e.data;
        if(err) throw err;

        bundledCode && console.log(bundledCode);
    };

    return (
        <div className="monaco-container">
            <MonacoEditor
              {/*...*/}
            />
            <button onClick={_onSubmit}>submit</button>
        </div>
    );
};
```

```TypeScript
// worker
const bundler = (code: string) => {
    // bundle code and return it.
};

self.addEventListener('message', (e:MessageEvent<iMessageBundleWorker>): void => {

    const { order, code } = e.data;


    console.log("[bundle.worker.ts] got message");

    if(order !== "bundle") return;

    console.log("[bundle.worker.ts] start bundle process...");

    if(code) {
        bundler(code)
        .then((result: iBuildResult) => {
            self.postMessage({
                bundledCode: result.code,
                err: null
            });
        })
        .catch((e) => {
            // handle error
        });
    }
}, false);


console.log("[bundle.worker] running...");
```

```TypeScript
// parent component
import React from 'react';

const App = () => {
    return (
        <div>
            <React.StrictMode>
                <MonacoContainer />
            </React.StrictMode>
        </div>
    )
}
```

When I run it, I can see that no messages are being exchanged.

However, if I remove `StrictMode`, it immediately exchanges message without problems.

But with `StrictMode`, it won't.

#### Here is what I have surveyed to solve.

- `StrictMode` causes `useEffect()` to be ran twice, so maybe not cleaning up properly has something to do with this problem?

Both `worker.terminate()` and `worker.removeEventListener('message')` are executed during cleanup.

- Is it because they have different origins?

Development is done locally, and I have confirmed that both are `http://localhost:8080`.
So it should not be cross-origin.

- You think I am missing the message because the React component and the worker have different timing for completion of mounting.

I don't think that is related to `StrictMode`, as it does not occur when app runs without `StrictMode`.

So I'm stuck.

Is there any limitation to communicate with a worker in React18 that cannot be done in development mode?

I am developing in `Strictmode` with React18, webpack5, but I wonder if there is any way to exchange messages with the worker without any problems.

My environment and settings.

Node.js version 16

```JSON
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2016",
    "lib": ["dom", "WebWorker", "es5", "es2015.collection", "es2015.promise"],
    "jsx": "react",
    "module": "ES2020",
    "moduleResolution": "node",
    "typeRoots": ["node_modules/@types"],
    "resolveJsonModule": true,
    "allowJs": true,
    "sourceMap": true,
    "outDir": "./dist/",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true
  },
  "include": ["./src/**/*"],
  "exclude": ["node_modules"]
}
```

```JavaScript
// webpack.config.js
const path = require('path');
const HtmlWebPackahePlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'producton';

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.tsx',
		'bundle.worker': './src/worker/bundle.worker.ts',

		// monaco-editor requirement:
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
		'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
		'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker'
	},
	resolve: {
		extensions: ['.*', '.js', '.jsx', '.tsx', '.ts'],
	  },
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: require.resolve('babel-loader'),
						options: {
							presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
							plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean)
						}
					}
				]
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
	plugins: [
		new HtmlWebPackahePlugin({
			title: 'Output Management',
			template: 'src/index.html'
		}),
		isDevelopment && new ReactRefreshWebpackPlugin()
	].filter(Boolean),
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		hot: true,
		port: 8080,
        headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': '*',
		}
	},
	optimization: {
		runtimeChunk: 'single'
	}
};
```

Thank you.

---- 原文

# StrictMode では worker と React コンポーネントとの間でメッセージのやり取りができません。

React コンポーネントで、Webworker とメッセージのやり取りを行いたいと以下のようなコードを作成しました。

```TypeScript
//（簡略化されたコードの挿入）
```

実行してみると、メッセージのやり取りが行われていないことが確認できます。

```bash
# 挿入：console.log()の出力内容など
```

しかし、`StrictMode`を外すと、たちまち問題なくメッセージのやり取りがおこなわれます。

```bash
# 挿入：console.log()
```

私が解決のために試したことは以下の通りです。

- `StrictMode`だと useEffect()が 2 度実行されるので、適切にクリーンアップしていないことが今回の問題に関係しているのでは？

worker.terminate()も worker.removeEventListener('message')もクリーンアップ時に実施しています。

- origin が異なるからでは？

開発はローカルで行っており、いずれも`http://localhost:8080`であることは確認済です。
そのため cross-origin になってはいないはずです。

- React コンポーネントと worker のマウント完了のタイミングが異なるからメッセージを逃しているのでは？

それは StrictMode だと発生しない現象なので関係ないと思います。
一番最後にマウントが完了するワーカーが、マウント完了時にメッセージを送信するようにしても
やはりメインスレッド側は受信しません。

React18 で worker とやり取りするのは、開発モードだとできない制限などあるのでしょうか。

React18, webpack5 で Strictmode で開発しているけど worker と問題なくメッセージをやり取りできる方法はないでしょうか。

以下は開発環境や設定です。

```JSON
// package.json
```

```JSON
// tsconfig.json
```

```JavaScript
// webpack.config.js
```

感謝。
