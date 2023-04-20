import React, { useState, useEffect, useRef, 
    // useMemo 
} from "react";
import * as monaco from 'monaco-editor';

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


/***
 * sample:
 * https://github.com/microsoft/monaco-editor/tree/main/samples/browser-esm-webpack-typescript-react
 * */ 
const App = () => {
    const count = useState<number>(0);
    const refMonacoDiv = useRef<HTMLDivElement>(null);
    let editor: monaco.editor.IStandaloneCodeEditor;
    
    // const worker: Worker = useMemo(() => new Worker(
    //     new URL(
    //         "./worker/index.ts", 
    //         import.meta.url
    //     )
    // ), []);

    // // Only post message
    // useEffect(() => {
    //     if(window.Worker) {
    //         const request = {

    //         };

    //         worker.postMessage(request);
    //     }
    // }, [worker]);

    // // Only receive message
    // useEffect(() => {
    //     if(window.Worker) {
    //         worker.onmessage = (e) => {

    //         };
    //     }
    // }, [worker]);

    useEffect(() => {
        if (refMonacoDiv.current) {
			editor = monaco.editor.create(refMonacoDiv.current, {
				value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
				language: 'typescript'
			});
		}
		return () => {
			editor.dispose();
		};
    }, [])

    return (<div className="Editor" ref={refMonacoDiv} ></div>);
};

export default App;