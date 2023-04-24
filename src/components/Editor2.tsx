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
import type * as Monaco from 'monaco-editor';

export type beforeMount = (monaco: typeof Monaco) => void;
export type onMount = (editor: typeof Monaco.editor, monaco: typeof Monaco) => void;
// TODO: change eventも渡すように
export type onChange = (value: string) => void;
export type onValidate = (value: string) => void;


interface iParamsMonacoEditor extends Monaco.editor.IStandaloneEditorConstructionOptions {
    beforeMount: beforeMount;
    onMount: onMount;
    onChange: onChange; 
    onValidate: onValidate;
};


const MonacoEditor = ({
    beforeMount,
    onMount,
    onChange, 
    onValidate,
    ...options
}: iParamsMonacoEditor) => {
    const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
    const _editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const _subscription = useRef<Monaco.IDisposable>();
    const _refEditorContainer = useRef<HTMLDivElement>(null);
    const _beforeMount = useRef(beforeMount);

    // 絶対パスを渡してもダメ。
    const esLinteWorker = useMemo(() => new Worker(new URL('/src/workers/ESLint.worker.ts', import.meta.url)), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('/src/workers/JSXHighlight.worker.ts', import.meta.url)), []);

    /**
     * 
     * - Create editor and pass instance to _editor.current
     * - Run beforeMount.current() before editor generated
     * */ 
    const _createEditor = useCallback(() => {
        
        // DEBUG:
        console.log("[CodeEditor] _createEditor:");
        
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
        
        // DEBUG:
        console.log("[CodeEditor] Generate editor:");

        !isEditorReady && _createEditor();
    }, [isEditorReady, _createEditor]);

    /**
     * Component did mount
     * - Set listeners to each worker
     * - Set cleaner runs when unmount
     * */ 
    useEffect(() => {
        // DEBUG:
        console.log("[CodeEditor] component did mount:");
        
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
        // DEBUG:
        console.log("[CodeEditor] onChange useEffect:");

        if(isEditorReady && onChange !== undefined) {
            if(_subscription.current) _subscription.current.dispose();
            _subscription.current = _editor.current?.onDidChangeModelContent(() => {
                const value = _editor.current?.getValue();
                onChange(value === undefined ? "" : value);
                // TODO: ESLintworkerへ値を送るのもここで
            });
        }
    }, [onChange, isEditorReady]);

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
        // DEBUG:
        console.log("[CodeEditor] _cleanup()");

        if(_editor.current) _editor.current.dispose();
        if(_subscription.current) _subscription.current.dispose();
        esLinteWorker.terminate();
        jsxHighlightWorker.terminate();
    };


    return (
        <div className="" ref={_refEditorContainer}></div>
    );
};

export default MonacoEditor;