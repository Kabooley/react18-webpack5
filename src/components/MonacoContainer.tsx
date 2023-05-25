/**********************************************************
 * Monaco Editor that enables Multiple files.
 * 
 * NOTE:
 * - Temporary disable workers to implement only multi-file functionality.
 *  Back up has saved @ evacuation/App.tsx.backupyyyymmdd
 * NOTE: added bundle.worker and enable worker.
 * ********************************************************/ 
import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './Monaco/MonacoEditor';
import Tabs from './Tabs';
import { files } from "../data/files";
import './index.css';
// // NOTE: added:
// import type { iMessageBundleWorker } from "../worker/types";

import bundler from '../Bundle';

interface iProps {
    onBundled: (bundledCode: string) => void;
}


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
};


const MonacoContainer = ({
    onBundled
}: iProps) => {
    const [value, setValue] = useState<string>("");
    const [currentFilePath, setCurrentFilePath] = useState<string>(files['react-typescript'].path);
    // // NOTE: added bundle worker
    // const bundleWorker = useMemo(
    //     () => new Worker(new URL('/src/worker/bundle.worker.ts', import.meta.url), { type: "module" }
    //     ), []);

    useEffect(() => {
        // DEBUG:
        console.log("[App] on did mount");

        // if(window.Worker) {
        //     bundleWorker.addEventListener('message', _cbBundledMessage, false);
        // }

        return () => {
            _onUnmount();
        }
    }, []);

    
    const onWillMount = () => {
        // DEBUG:
        console.log("[App] Will mount.");
    };
    
    const onDidMount = () => {
        // DEBUG:
        console.log("[App] Did mount.");
    };

    const onValueChange = (v: string) => {
        // DEBUG:
        console.log("[App] On value change.");

        setValue(v);
    };


    const _onUnmount = () => {
        // DEBUG:
        console.log("[App] onUnmount():");
        // bundleWorker && bundleWorker.removeEventListener('message', _cbBundledMessage, false);
        // bundleWorker && bundleWorker.terminate();
    };

    
    const onChangeFile = (path: string) => {
        // DEBUG:
        console.log(`[MonacoContainer] onChangeFile: change to ${path}`);

        setCurrentFilePath(path);
    };

    /**
     * Send code to bundler.
     * 
     * */ 
    const _onSubmit = () => {
        // DEBUG:
        console.log("[MonacoContainer] submit");

        // bundleWorker.postMessage({
        //     order: "bundle",
        //     code: value
        // });

        bundler(value)
        .then(({ code, err }) => {
            if(err) throw err;
            console.log(code);
        })
        .catch(e => console.error(e.message));
    };

    // const _cbBundledMessage = (e: MessageEvent<iMessageBundleWorker>) => {

    //     // DEBUG:
    //     console.log("[MonacoContainer] got bundled code");

    //     const { bundledCode, err } = e.data;
    //     if(err) throw err;
    //     // DEBUG:
    //     console.log(bundledCode);

    //     bundledCode && onBundled(bundledCode);
    // };

    return (
        <div className="monaco-container">
            <Tabs path={currentFilePath} onChangeFile={onChangeFile}/>
            <MonacoEditor 
                files={files}
                // 'react-typescript' as default path
                path={currentFilePath}   
                onWillMount={onWillMount}
                onValueChange={onValueChange}
                onDidMount={onDidMount}
                {...editorConstructOptions}
            />
            <button onClick={_onSubmit}>submit</button>
        </div>
    );
};

export default MonacoContainer;