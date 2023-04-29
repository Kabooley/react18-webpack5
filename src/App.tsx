import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './components/MonacoEditor';
import type { beforeMount, onMount, onChange, onValidate } from "./components/MonacoEditor";
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

interface iClassification {
    // IRange:
    startColumn: number;
    endColumn: number;
    startLineNumber: number;
    endLineNumber: number;
    
    // Related to IModelDecorationOptions:
    type: string;   // わからんけどinline classnameあるかどうかみたいな？
    kind: string;   // わからんけどclassNameの命名規則かも
    parentKind: string;     // わからんけどわからん
};

interface iWorkerMessageData {
    version: number;
    classifications: iClassification[];
};

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


const App = () => {
    // const [value, setValue] = useState<string>("");
    const _monacoRef = useRef<typeof monaco>();
    const _editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    // Workers
    const esLinteWorker = useMemo(() => new Worker(new URL('/src/workers/ESLint.worker.ts', import.meta.url)), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('/src/workers/JSXHighlight.worker.ts', import.meta.url)), []);

    useEffect(() => {
        if(window.Worker) {
            esLinteWorker.addEventListener('message', (e) => {}, false);

            jsxHighlightWorker.addEventListener(
                'message', 
                ({ data }: { data: iWorkerMessageData }) => {
                const { classifications, version } = data;
                const model = _editorRef.current?.getModel();

                if(model && model.getVersionId() !== version) return;

                const decorations: monaco.editor.IModelDeltaDecoration[] = classifications.map(classification => {
                    return {
                        range: new monaco.Range(
                            classification.startColumn,
                            classification.startLineNumber,
                            classification.endColumn,
                            classification.endLineNumber,
                        ),
                        options: {
                            inlineClassName: classification.type
                            ? `${classification.kind} ${classification.type}-of-${
                                classification.parentKind}`
                            : classification.kind
                        }
                    }
                });

                _editorRef.current?.createDecorationsCollection(
                    // model.decorations || [],
                    decorations
                );
            }, false);
        }


        return () => {
            _cleanUp();
        }
    }, []);
    

    const beforeMount: beforeMount = (m) => {
        // format setting
        // DEBUG:
        console.log("[App] Before Mount:");
        setFormatter(m);
    };

    const onDidMount: onMount = (e, m) => {
        // DEBUG:
        console.log("[App] Did Mount:");

        _editorRef.current = e;
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

    const _cleanUp = () => {
        esLinteWorker.terminate();
        jsxHighlightWorker.terminate();
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