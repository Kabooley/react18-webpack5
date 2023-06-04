const path = require('path');
const HtmlWebPackahePlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'producton';

module.exports = {
	mode: 'development',
	entry: {
		index: './src/index.tsx',
		// ESLintWorker: './src/workers/ESLint.worker.ts',
		// JSXHighlightWorker: './src/workers/JSXHighlight.worker.ts',
		// FetcLibsWorker: './src/workers/FetchLibs.worker.ts',
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
	/**
	 * https://webpack.js.org/guides/output-management/#setting-up-htmlwebpackplugin
	 * 
	 * */ 
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
		allowedHosts: 'auto',
		// DEBUG:
		// Only for development mode
		headers: {
			'Access-Control-Allow-Origin': '*',		// unpkg.com
			// 'Access-Control-Allow-Origin': 'unpkg.com',		// unpkg.com
			'Access-Control-Allow-Headers': '*',	// GET
			'Access-Control-Allow-Methods': '*',
		}
	},
	/**
	 * https://webpack.js.org/guides/code-splitting/#splitchunksplugin
	 * */ 
	optimization: {
		runtimeChunk: 'single'
	}
};
