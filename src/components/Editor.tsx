import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { TypeScriptWorker } from '../tsWorker';

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
    },
};

const isJSLang = false;

// https://microsoft.github.io/monaco-editor/docs.html#functions/languages.typescript.getTypeScriptWorker.html
// https://microsoft.github.io/monaco-editor/docs.html#interfaces/languages.typescript.TypeScriptWorker.html
//
// `getTypeScriptWorker` returns Promise<TypeScriptWorker>
const getWorker = isJSLang
    ? monaco.languages.typescript.getJavaScriptWorker
    : monaco.languages.typescript.getTypeScriptWorker;

const defaultCode = `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`;


// TODO: 一旦モデルを生成してからsetModel()して！
export const Editor: React.FC = () => {
    const [compiled, setCompiled] = useState<string>();
    const divEl = useRef<HTMLDivElement>(null);
    let editor: monaco.editor.IStandaloneCodeEditor;
    useEffect(() => {
        if (divEl.current) {
            editor = monaco.editor.create(divEl.current, {
                value: [defaultCode].join('\n'),
                language: 'typescript',
            });
        }
        return () => {
            editor.dispose();
            const client = getWorker();
        };
    }, []);

    const getWorkerProcess = async (): Promise<TypeScriptWorker> => {
        const worker = await getWorker();
        // @ts-ignore
        return await worker(model.uri);
    };

    const onClick = async () => {
        // DEBUG:
        console.log('[Editor] onClick');

        const model = editor.getModel()!;
        const client = await getWorkerProcess();

        // DEBUG:
        console.log(client);

        const result = await client.getEmitOutput(model.uri.toString());
        const firstJS = result.outputFiles.find(
            (o: any) => o.name.endsWith('.js') || o.name.endsWith('.jsx')
        );
        setCompiled((firstJS && firstJS.text) || '');
    };

    return (
        <div>
            <div className="Editor" ref={divEl}></div>
            {compiled}
            <button onClick={onClick}>COMPILE</button>
        </div>
    );
};
