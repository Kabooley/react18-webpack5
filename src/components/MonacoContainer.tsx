/*****************************************
 * 
 * ***************************************/
import React from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './Monaco/MonacoEditor';
import Tabs from './Tabs';
import willMountMonacoProcess from "./Monaco/monacoWillMountProcess";
import { files } from "../data/files";
import type { iMessageBundleWorker, iMessageFetchLibs, iFetchedPaths } from "../worker/types";
import './index.css';

interface iProps {
    onBundled: (bundledCode: string) => void;
};


// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};


const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
	language: "typescript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
    automaticLayout: true       // これ設定しておかないとリサイズ時に壊れる
};

// TODO: 毎レンダリング時に初期化されちゃわないか？確認
/**
 * 
 * */ 
const extraLibs = new Map<string, monaco.IDisposable>();
willMountMonacoProcess();


/***
 * NOTE: Component must be class component to treat with workers.
 * 
 * 
 * */ 
class MonacoContainer extends React.Component<iProps> {
    state = {
        value: "",
        currentFilePath: files['react-typescript'].path
    };
    bundleWorker: Worker | undefined;
    fetchLibsWorker: Worker | undefined;

    componentDidMount = (): void => {
        // DEBUG:
        console.log("[MonacoContainer] on did mount");

        if(window.Worker) {
            this.bundleWorker = new Worker(
                new URL('/src/worker/bundle.worker.ts', import.meta.url), 
                { type: "module" }
            );
            this.fetchLibsWorker = new Worker(
                new URL('/src/worker/fetchLibs.worker.ts', import.meta.url)
            );
            this.bundleWorker.addEventListener('message', this._cbBundledMessage, false);
            this.fetchLibsWorker.addEventListener('message', this._cbFetchLibs, false);

            // NOTE: ひとまずハードコーディングで依存関係を呼び出す
            this._orderFetchLibs();
        }
    };

    componentDidUpdate = (): void => {};

    componentWillUnmount(): void {
        // DEBUG:
        console.log("[MonacoContainer] onUnmount():");

        this.bundleWorker && this.bundleWorker.removeEventListener('message', this._cbBundledMessage, false);
        this.fetchLibsWorker && this.fetchLibsWorker.removeEventListener('message', this._cbFetchLibs, false);
        this.bundleWorker && this.bundleWorker.terminate();
        this.fetchLibsWorker && this.fetchLibsWorker.terminate();
    }

    
    onWillMount = () => {
        // DEBUG:
        console.log("[MonacoContainer] Will mount.");
    };
    
    onDidMount = () => {
        // DEBUG:
        console.log("[MonacoContainer] Did mount.");
    };

    onValueChange = (v: string) => {
        // DEBUG:
        console.log("[MonacoContainer] On value change.");

        this.setState({value: v})
    };

    
    onChangeFile = (path: string) => {
        // DEBUG:
        console.log(`[MonacoContainer] onChangeFile: change to ${path}`);

        this.setState({currentFilePath: path});
    };

    /**
     * Send code to bundler.
     * */ 
    _onSubmit = () => {
        // DEBUG:
        console.log("[MonacoContainer] submit");

        this.bundleWorker && this.bundleWorker.postMessage({
            order: "bundle",
            code: this.state.value
        });
    };

    _cbBundledMessage = (e: MessageEvent<iMessageBundleWorker>) => {

        // DEBUG:
        console.log("[MonacoContainer] got bundled code");

        const { bundledCode, err } = e.data;
        if(err) throw err;
        bundledCode && this.props.onBundled(bundledCode);
    };

    _cbFetchLibs = (e: MessageEvent<iMessageFetchLibs>) => {
        const { typings, err } = e.data;
        if(err) throw err;
        typings && this._addTypings(typings);
    };

    _addTypings = (typings: iFetchedPaths) => {
        // DEBUG: 
        console.log("[App] _addTypings:");
        console.log(typings);

        Object.keys(typings).forEach(path => {
          let extraLib = extraLibs.get(path);
    
          extraLib && extraLib.dispose();
          extraLib = monaco.languages.typescript.javascriptDefaults.addExtraLib(
            typings[path],
            path
          );
    
          extraLibs.set(path, extraLib);
        });
    };

    _orderFetchLibs = () => {
        const dependencies: { [key: string]: string } = {
            react: "18.0.4",
            "react-dom": "18.0.4"
        };

        Object.keys(dependencies).forEach(key => {
            this.fetchLibsWorker && this.fetchLibsWorker.postMessage({
                order: "fetch-libs",
                name: key,
                version: dependencies[key]
            });
            // DEBUG:
            console.log(`[App] sent dependency: ${key}@${dependencies[key]}`);
        });
    };

    render() {
        return (
            <div className="monaco-container">
                <Tabs path={this.state.currentFilePath} onChangeFile={this.onChangeFile}/>
                <MonacoEditor 
                    files={files}
                    // 'react-typescript' as default path
                    path={this.state.currentFilePath}   
                    onWillMount={this.onWillMount}
                    onValueChange={this.onValueChange}
                    onDidMount={this.onDidMount}
                    {...editorConstructOptions}
                />
                <button onClick={this._onSubmit}>submit</button>
            </div>
        );
    }

};

export default MonacoContainer;