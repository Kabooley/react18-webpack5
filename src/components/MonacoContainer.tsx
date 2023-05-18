/**********************************************************
 * Monaco Editor that enables Multiple files.
 * 
 * NOTE:
 * - Temporary disable workers to implement only multi-file functionality.
 *  Back up has saved @ evacuation/App.tsx.backupyyyymmdd
 * ********************************************************/ 
import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './Monaco/MonacoEditor';
import { files } from "../data/files";


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

// const defaultValue = "import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);";


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
    // value: defaultValue,
	language: "typescript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
};


const MonacoContainer = () => {
    const [value, setValue] = useState<string>("");

    useEffect(() => {
        // DEBUG:
        console.log("[App] on did mount");

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
    };

    return (
        <div className="monaco-container">
            <MonacoEditor 
                file={files['react-typescript']}
                path={files['react-typescript'].path}
                onWillMount={onWillMount}
                onValueChange={onValueChange}
                onDidMount={onDidMount}
                {...editorConstructOptions}
            />
        </div>
    );
};

export default MonacoContainer;