import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './components/Monaco/MonacoEditor2';


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

const defaultValue = "import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);";


/***
 * IStandaloneEditorConstructionOptions: {
 *  model, value, language, theme, 
 * }
 * IEditorOptions: {
 *  isDiffEditor,
 *  tabIndex,
 *  lineNumbers,
 *  scrollbar,
 *  minimap,
 *  ...many props
 * }
 * 
 * */ 
const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: defaultValue,
	language: "typescript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
};



const App = () => {
    const [value, setValue] = useState<string>("");
    // Workers
    const esLinteWorker = useMemo(() => new Worker(new URL('/src/workers/ESLint.worker.ts', import.meta.url)), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('/src/workers/JSXHighlight.worker.ts', import.meta.url)), []);
    const fetchLibsWorker = useMemo(() => new Worker(new URL('/src/workers/FetchLibs.worker.ts', import.meta.url)), []);

    useEffect(() => {
        if(window.Worker) {
            esLinteWorker.addEventListener('message', _cbLinter, false);
            jsxHighlightWorker.addEventListener('message', _cbSyntaxHilighter, false);
            fetchLibsWorker.addEventListener('message', _cbAddLibs, false);
        }

        return () => {
            _onUnmount();
        }
    }, []);

    const onValueChange = (v: string) => {
        setValue(v);
    }
    

    const _onUnmount = () => {
        esLinteWorker.removeEventListener('message', _cbLinter, false);
        jsxHighlightWorker.removeEventListener('message', _cbSyntaxHilighter, false);
        fetchLibsWorker.removeEventListener('message', _cbAddLibs, false);
        esLinteWorker.terminate();
        jsxHighlightWorker.terminate();
        fetchLibsWorker.terminate();
    };

    const _cbLinter = () => {};
    const _cbSyntaxHilighter = () => {};
    const _cbAddLibs = () => {};

    return (
        <div className="app">
            <MonacoEditor 
                files={}
                path={}
                onWillMount={}
                onValueChange={onValueChange}
                onDidMount={}
                {...editorConstructOptions}
            />
        </div>
    );
};

export default App;