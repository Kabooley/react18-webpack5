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
    value: "// First line\nfunction hello(): void {\n\talert('Hello world!');\n}\n// Last line",
	language: "typescript",

	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
    
};

/**
 * Set formatting rules.
 * 
 * */ 
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

/***JSX Highlight setup
 * 
 * https://github.com/cancerberoSgx/jsx-alone/blob/master/jsx-explorer/HOWTO_JSX_MONACO.md
 * 
 * これとmonaco.editor.createの組み合わせ
 * */ 
const setJSXHighlighting = (m: typeof monaco) => {
    m.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: m.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        moduleResolution: m.languages.typescript.ModuleResolutionKind.NodeJs,
        module: m.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ["node_modules/@types"],
        jsx: m.languages.typescript.JsxEmit.React,
        jsxFactory: 'JSXAlone.createElement',
      })
      
    //   editor = m.editor.create(containerEl, {
    //     model: m.editor.createModel(code, "typescript", m.Uri.parse("file:///main.tsx")),
    //     language: 'typescript',
    //   })
      
    //   m.editor.createModel(jsxDefinitionsCode, "typescript", m.Uri.parse("file:///index.d.ts"))
};


const App = () => {
    // const [value, setValue] = useState<string>("");
    const _monacoRef = useRef<typeof monaco>();

    const beforeMount: beforeMount = (m) => {
        // format setting
        // DEBUG:
        console.log("[App] Before Mount:");
        setFormatter(m);
        // add condition if language is typescript or not.
        setJSXHighlighting(m);
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