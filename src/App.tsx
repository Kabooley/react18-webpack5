import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './components/Monaco/MonacoEditor';
import { files } from "./components/Monaco/files";
import type { iFetchedPaths } from './workers/FetchLibs.worker';
import { iOrderFetchLibs } from "./workers/types";
import { isIndexSignatureDeclaration } from "typescript";

// import type { iFiles, iFile } from "./components/Monaco/files";


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


// Store details about typings we have loaded
const extraLibs = new Map<string, monaco.IDisposable>();


const App = () => {
    const [value, setValue] = useState<string>("");
    // Workers
    const esLinteWorker = useMemo(() => new Worker(new URL('/src/workers/ESLint.worker.ts', import.meta.url)), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('/src/workers/JSXHighlight.worker.ts', import.meta.url)), []);
    const fetchLibsWorker = useMemo(() => new Worker(new URL('/src/workers/FetchLibs.worker.ts', import.meta.url)), []);

    useEffect(() => {
        // DEBUG:
        console.log("[App] on did mount");

        if(window.Worker) {
            console.log("[App] worker set up.");
            
            esLinteWorker.addEventListener('message', _cbLinter, false);
            jsxHighlightWorker.addEventListener('message', _cbSyntaxHilighter, false);
            fetchLibsWorker.addEventListener('message', _cbAddLibs, false);

            const dependencies: { [key: string]: string } = {
                react: "18.0.4",
                "react-dom": "18.0.4"
            };

            setTimeout(() => {
                Object.keys(dependencies).forEach(key => {
                    fetchLibsWorker.postMessage({
                        order: "fetch-libs",
                        name: key,
                        version: dependencies[key]
                    });
                    // DEBUG:
                    console.log(`[App] sent dependency: ${key}@${dependencies[key]}`);
                });
            }, 10000);

        }

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

    
    /**
     * 
     * extraLibs
     * */ 
    const _addTypings = (typings: iFetchedPaths) => {
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


    const _onUnmount = () => {
        // DEBUG:
        console.log("[App] onUnmount():");

        esLinteWorker.removeEventListener('message', _cbLinter, false);
        jsxHighlightWorker.removeEventListener('message', _cbSyntaxHilighter, false);
        fetchLibsWorker.removeEventListener('message', _cbAddLibs, false);
        esLinteWorker.terminate();
        jsxHighlightWorker.terminate();
        fetchLibsWorker.terminate();
    };

    const _cbLinter = () => {};
    const _cbSyntaxHilighter = () => {};
    const _cbAddLibs = (e: MessageEvent<iOrderFetchLibs>) => {

        const { typings, err } = e.data;

        if(err) console.error(err);
        typings && _addTypings(typings);
    };

    return (
        <div className="app">
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

export default App;