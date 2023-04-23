// /***********************************************************
//  * 以下を参考にmonaco-editorをReactコンポーネント化して
//  * @monaco-editor/reactなしで使えるようにしてみる
//  * 
//  * https://github.com/satya164/monaco-editor-boilerplate
//  * 
//  * TODO:
//  * - install ESLint and apply them.
//  * - learn how to use eslint in typescript
//  * - Define message type.
//  * - Get options from parent component and apply them to editor.
//  * *********************************************************/ 
// import React, { useEffect, useRef, useMemo } from 'react';
// import * as monaco from 'monaco-editor';

// const monacoEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
//     value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
// 	language: "javascript",

// 	lineNumbers: "off",
// 	roundedSelection: false,
// 	scrollBeyondLastLine: false,
// 	readOnly: false,
// 	theme: "vs-dark",
// };

// /**
//  * Type of props for MonacoEditor component parameter.
//  * */ 
// interface iMonacoEditorProps extends monaco.editor.IStandaloneEditorConstructionOptions {
//     onValueChange: (code: string) => void;
// };

// interface iParamUpdateMarkers {
//     markers: any; /* TODO: specify type. typeof value returned from ESLint.verify() */
//     version: number;
// };


// const MonacoEditor = (props: iMonacoEditorProps) => {
//     let _editor: monaco.editor.IStandaloneCodeEditor;
//     let _subscription: monaco.IDisposable;
//     const refEditor = useRef<HTMLDivElement>(null);
    
//     const ESLintWorker: Worker = useMemo(() => new Worker(
//         new URL(
//             "./workers/ESlint.worker.ts", 
//             import.meta.url
//         )
//     ), []);

//     const JSXHighlightWorker: Worker = useMemo(() => new Worker(
//         new URL(
//             "./workers/JSXHighlight.worker.ts", 
//             import.meta.url
//         )
//     ), []);

//     // Initialize Editor
//     /**
//      * TODO: マウント時も親コンポーネントからのオプションを反映させるようにする
//      * */ 
//     useEffect(() => {
//         if(refEditor.current) {
//             _editor = monaco.editor.create(refEditor.current, monacoEditorOptions);
//         }

//         if(window.Worker) {
//             ESLintWorker.onmessage = ({ data }) => {

//                 // DEBUG:
//                 console.log("[MonacoEditor] get message from ESLintworker:");

//                 _updateMarkers(data);
//             };
            
//             JSXHighlightWorker.onmessage = ({ data }) => {
                                
//                 // DEBUG:
//                 console.log("[MonacoEditor] get message from JSXHighlightworker:");

//             };
//         }

//         return () => {
//             _editor.dispose();
//             _subscription.dispose();
//             ESLintWorker.terminate();
//             JSXHighlightWorker.terminate();
//         }
//     }, []);

//     /**
//      * Component did update
//      * */ 
//     useEffect(() => {
//         _updater();
//     });

//     /**
//      * - reset _subscription
//      * - tell change of editor content to parent and let react re-render
//      * - pass latest code to eslint worker
//      * */ 
//     const _updater = () => {

//         // DEBUG:
//         console.log("[MonacoEditor] _updater()");

//         _subscription && _subscription.dispose();
//         _subscription = _editor.getModel()!.onDidChangeContent(() => {
//             const value = _editor.getModel()!.getValue();
//             if(value !== undefined) {
//                 props.onValueChange(value);
//                 _lintCode(value);
//             }
//         })
//     };

//     // Pass code to ESlint worker
//     const _lintCode = (code: string) => {
        
//         // DEBUG:
//         console.log("[MonacoEditor] _lintCode()");

//         const model = _editor.getModel();

//         if(model) {
//             monaco.editor.setModelMarkers(model, 'eslint', []);
//             ESLintWorker.postMessage({
//                 code,
//                 version: model.getVersionId()
//             });
//         }
//     };

//     // Apply JSX Highlgiht to the model
//     const _jsxHighlight = () => {

//     };

//     // Update markers
//     const _updateMarkers = ({ markers, version}: iParamUpdateMarkers) => {
        
//         // DEBUG:
//         console.log("[MonacoEditor] _updateMarkers()");

//         // 
//         // requestAnimationFrame()
//         // 
//         const model = _editor.getModel();
//         if(model && model.getVersionId() === version) {
//             monaco.editor.setModelMarkers(model, 'eslint', markers);
//         }
//     };

//     return (
//         <div id="Editor" ref={refEditor} ></div>
//     );
// };

// export default MonacoEditor;