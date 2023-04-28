import React, { useState, useRef } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './components/MonacoEditor';
import type { beforeMount, onMount, onChange, onValidate } from "./components/MonacoEditor";
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

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

const setFormatter = (m: typeof monaco): void => {
    // DEBUG:
    console.log("[App] setFormatter");

    m.languages.registerDocumentFormattingEditProvider(
		"javascript",　
		{
			async provideDocumentFormattingEdits(
                model, options, token) {
				const formatted = await prettier.format(
					model.getValue(), 
					{
						parser: 'babel',
						plugins: [parser],
						useTabs: false,
						semi: true,
						singleQuote: true,
                        tabWidth: 2
					})
					.replace(/\n$/, '');

                    // DEBUG:
                    console.log(formatted);

				return [{
					range: model.getFullModelRange(),
					text: formatted,
				}];
			}
		})
};

const App = () => {
    // const [value, setValue] = useState<string>("");
    const _monacoRef = useRef<typeof monaco>();

    const beforeMount: beforeMount = (m) => {
        // format setting
        // DEBUG:
        console.log("[App] Before Mount:");
        setFormatter(m);
    };

    const onDidMount: onMount = (e, m) => {
        // DEBUG:
        console.log("[App] Did Mount:");

        _monacoRef.current = m;
    };

    const onChange: onChange = (v) => {
        // DEBUG:
        console.log("[App] onChange:");
    };

    const onValidate: onValidate = (markers) => {
        // DEBUG:
        console.log("[App] onValidate:");
        console.log(markers);
    };

    return (
        <div className="app">
            <MonacoEditor 
                beforeMount={beforeMount}
                onMount={onDidMount}
                onChange={onChange}
                onValidate={onValidate}
                {...monacoEditorOptions}
            />
        </div>
    );
};

export default App;