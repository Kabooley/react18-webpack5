/***********************************************************
 * @monaco-editor/reactのソースを参考に
 * webworkerと連携するReactコンポーネントを作る。
 * 
 * monaco-editorをラッピングしてReactコンポーネント化する。
 * 
 * TODO:
 * - onChangeの実装
 * - onValidateの実装
 * - beforeMountの実装
 * - onDidMountの実装
 * - webworkerとReactコンポーネントの連動
 * *********************************************************/ 
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import { type editor, type IDisposable } from 'monaco-editor';

// TODO: Change to get these options from parent component
const monacoEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
	language: "javascript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
};

interface iParamsMonacoEditor extends editor.IStandaloneEditorConstructionOptions {
    onValueChange: (value: string) => void; // @monaco-editor/reactのOnChangeのようなもの
    onValidate: (value: string) => void;
    // TODO: 型呼出の改善
    beforeMount: (monaco: monaco) => void;
};

const MonacoEditor = ({
    onValueChange, 
    onValidate,
    beforeMount,
    ...options
}: iParamsMonacoEditor) => {
    const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
    const _editor = useRef<editor.IStandaloneCodeEditor | null>(null);
    const _subscription = useRef<IDisposable>();
    const _refEditorContainer = useRef<HTMLDivElement>(null);
    const _beforeMount = useRef(beforeMount);
    const esLinteWorker = useMemo(() => new Worker(new URL('../workers/ESLint.worker.ts')), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('../workers/jsxHighlight.worker.ts')), []);

    /**
     * 
     * - Create editor and pass instance to _editor.current
     * - Run beforeMount.current() before editor generated
     * */ 
    const _createEditor = useCallback(() => {
        if(!_refEditorContainer.current) return;

        // Run beforeMount()
        if(_beforeMount.current) _beforeMount.current(monaco);

        _editor.current = monaco.editor.create(
            _refEditorContainer.current, 
            // TODO: monacoEditorOptionsはpropsで受け取るように修正
            options
            // overrideSerivces
        );

        // 
        // saveViewState && _editor.current.restoreViewState(viewStates.get(autoCreatedModelPath));

        // TODO: define theme.
        // monaco.editor.setTheme(theme);

        setIsEditorReady(true);
    }, [
        // TODO: 何を依存関係にすべきかはさっぱり。動かしてみてから決めるべき
        // editorインスタンスの生成にかかわるオプションなどは含めるべきかと
        // 
        options, 
        // overrideServices, 
        // theme
    ]);
    

    /**
     * Generate editor and pass it ref.
     * */ 
    useEffect(() => {
        !isEditorReady && _createEditor();
    }, [isEditorReady, _createEditor]);

    /**
     * Component did mount
     * - Set listeners to each worker
     * - Set cleaner runs when unmount
     * */ 
    useEffect(() => {
        if(window.Worker) {
            esLinteWorker.addEventListener('message', (e) => {
                // Invoke updater
            }, false);
            jsxHighlightWorker.addEventListener('message', (e) => {
                // Invoke updater
            }, false);

            // TODO: Send message to workers if needed.
        }

        return () => {
            _cleanUp();
        }
    }, []);

    /**
     * On Value Change:
     * 
     * Initialize and reset on value change listener to _subscription.
     * */ 
    useEffect(() => {
        if(isEditorReady && onValueChange !== undefined) {
            _subscription.current!.dispose();
            _subscription.current = _editor.current?.onDidChangeModelContent(() => {
                const value = _editor.current?.getValue();
                onValueChange(value === undefined ? "" : value);
                // TODO: ESLintworkerへ値を送るのもここで
            });
        }
    }, [onValueChange, isEditorReady]);

    /***
     * On Validate:
     * 
     * Update marker
     * */
    useEffect(() => {
        if(isEditorReady) {
            // TODO: makerに関しては何をするのか理解
        }

    }, [onValidate, isEditorReady]);

    // Clean up code
    const _cleanUp = (): void => {
        _editor.current!.dispose();
        _subscription.current!.dispose();
        esLinteWorker.terminate();
        jsxHighlightWorker.terminate();
    };


    return (
        <div className="" ref={_refEditorContainer}></div>
    );
};

export default MonacoEditor;