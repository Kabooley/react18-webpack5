/***********************************************************
 * 
 * *********************************************************/ 
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as monaco from 'monaco-editor';

const monacoEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
	language: "javascript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
};

interface iParamsMonacoEditor extends monaco.editor.IStandaloneEditorConstructionOptions {
    onValueChange: (value: string) => void; // @monaco-editor/reactのOnChangeのようなもの
    onValidate: (value: string) => void;
};

const MonacoEditor = ({
    onValueChange, 
    onValidate,
    ...options
}: iParamsMonacoEditor) => {
    const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
    const _editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const _subscription = useRef<monaco.IDisposable | null>(null);
    const _refEditorContainer = useRef<HTMLDivElement>(null);
    const esLinteWorker = useMemo(() => new Worker(new URL('../workers/ESLint.worker.ts')), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('../workers/jsxHighlight.worker.ts')), []);


    /**
     * Component did mount
     * 
     * - initialize monaco.editor instance and pass it _editor
     * - set worker listener
     * - set code cleaner
     * */ 
    useEffect(() => {
        if(_refEditorContainer.current && !_editor.current) {
            _editor.current = monaco.editor.create(_refEditorContainer.current, monacoEditorOptions);
            setIsEditorReady(true);
        }

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
        // TODO: xxx && foo()って何か確認
        if(isEditorReady && onValueChange !== undefined) {
            _subscription.current!.dispose();
            // dispose()するとundefinedになっちゃうの？
            _subscription.current = _editor.current?.getModel()?.onDidChangeContent(() => {
                const value = _editor.current?.getModel()?.getValue();
                onValueChange(value);
                // TODO: ESLintworkerへ値を送るのもここで
            });

            // 参考：
            // subscriptionRef.current = editorRef.current?.onDidChangeModelContent((event) => {
            //     if (!preventTriggerChangeEvent.current) {
            //       onChange(editorRef.current!.getValue(), event);
            //     }
            //   });
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