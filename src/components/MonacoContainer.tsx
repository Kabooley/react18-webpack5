/*****************************************
 * 
 * ***************************************/
import React from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './Monaco/MonacoEditor';
import Tabs from './Tabs';
import { filesProxy } from "../data/files";
import type { iMessageBundleWorker } from "../worker/types";


interface iProps {
    onBundled: (bundledCode: string) => void;
};


const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
	language: "typescript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
    dragAndDrop: false,
    automaticLayout: true       // これ設定しておかないとリサイズ時に壊れる
};

const defaultFilePath = 'src/index.tsx';


/***
 * NOTE: Component must be class component to treat with workers.
 * 
 * 
 * */ 
class MonacoContainer extends React.Component<iProps> {
    state = {
        value: "",
        currentFilePath: filesProxy.getFile(defaultFilePath).path
    };
    bundleWorker: Worker | undefined;

    componentDidMount = (): void => {
        // DEBUG:
        console.log("[MonacoContainer] on did mount");

        if(window.Worker) {
            this.bundleWorker = new Worker(
                new URL('/src/worker/bundle.worker.ts', import.meta.url), 
                { type: "module" }
            );
            this.bundleWorker.addEventListener('message', this._cbBundledMessage, false);
        }

        console.log(`[MonacoContainer] currentFilePath: ${this.state.currentFilePath}`);
    };

    componentDidUpdate = (): void => {};

    componentWillUnmount(): void {
        // DEBUG:
        console.log("[MonacoContainer] onUnmount():");

        this.bundleWorker && this.bundleWorker.removeEventListener('message', this._cbBundledMessage, false);
        this.bundleWorker && this.bundleWorker.terminate();
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
        // DEBUG:
        console.log(bundledCode);

        bundledCode && this.props.onBundled(bundledCode);
    };

    render() {
        return (
            <div className="monaco-container">
                <Tabs path={this.state.currentFilePath!} onChangeFile={this.onChangeFile}/>
                <MonacoEditor 
                    files={filesProxy.getFiles()}
                    // 'react-typescript' as default path
                    path={this.state.currentFilePath!}   
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