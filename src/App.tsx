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

const monacoEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
	language: "javascript",

	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
};

const model = monaco.editor.createModel(
    "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line","javascript"
);


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

    const validate = () => {

    }

    useEffect(() => {
        if (refMonacoDiv.current) {
			editor = monaco.editor.create(refMonacoDiv.current, monacoEditorOptions);

            // 今テキトーにここに空ら伊豆突っ込んだけど
            // ここに入れても意味ないなぁ初回マウント時にしか使われんから
            // monaco.editor.colorizeElement(refMonacoDiv.current, {});

            editor.onDidChangeModelContent((e) => {
                console.log("[onDidChangeModelContent]");
                console.log(e);
            });

            // エディタの入力内容が変更されても反応はしない
            editor.onDidChangeModel((e) => {
                console.log("[onDidChangeModel]");
                console.log(e);
            });

		}
		return () => {
			editor.dispose();
		};
    }, []);

    useEffect(() => {
        console.log("[useEffect() all]");
    });

    return (<div className="Editor" ref={refMonacoDiv} ></div>);
};

export default App;