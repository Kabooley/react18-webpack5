/***********************************************************
 * 以下を参考にmonaco-editorをReactコンポーネント化して
 * @monaco-editor/reactなしで使えるようにしてみる
 * 
 * https://github.com/satya164/monaco-editor-boilerplate
 * 
 * クラスコンポーネント内部で頻繁にeditorの
 * インスタンス(monaco.editor.create()した生成物)は
 * componentDidMount()で生成していた
 * で、
 * このインスタンスはクラスコンポーネントのフィールドで保持しているようだ
 * 
 * この、クラスのフィールドで変数を保持する方法は問題ないのか？
 * 
 * まぁ使ってみて問題だったらで
 * 
 * TODO: MonacoEditorのコンポーネント化
 * - いや関数コンポーネントにできない？
 * - editorインスタンスの保持の仕方はclass filedで問題ないのか？
 * - あらゆるeditorの設定更新はcomponentWillMount()やcomponentDidMount()等を使う
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

interface iMonacoEditorProps extends monaco.editor.IStandaloneEditorConstructionOptions {};


/****
 * workerのインスタンスの保持方法：useMemoでやってみる
 * 
 * */ 
const MonacoEditor = (props: iMonacoEditorProps) => {
    let _editor: monaco.editor.IStandaloneCodeEditor;
    const refEditor = useRef<HTMLDivElement>(null);
    
    const ESLintWorker: Worker = useMemo(() => new Worker(
        new URL(
            "./worker/ESlint.worker.ts", 
            import.meta.url
        )
    ), []);

    const JSXHighlightWorker: Worker = useMemo(() => new Worker(
        new URL(
            "./worker/JSXHighlight.worker.ts", 
            import.meta.url
        )
    ), []);

    // Initialize Editor
    /**
     * TODO: マウント時も親コンポーネントからのオプションを反映させるようにする
     * */ 
    useEffect(() => {
        if(refEditor.current) {
            _editor = monaco.editor.create(refEditor.current, monacoEditorOptions);
        }

        if(window.Worker) {
            ESLintWorker.onmessage = ({ data }) => {
                _lintCode(data);
            };
            
            JSXHighlightWorker.onmessage = ({ data }) => {
                // TODO: define what to do
            };
        }

        return () => {
            _editor.dispose();
            ESLintWorker.terminate();
            JSXHighlightWorker.terminate();
        }
    }, []);

    /***
     * Run every rerender
     * 
     * - 親コンポーネントからのオプション変更を反映させる
     * TODO: 実行タイミングは適切か確認
     * */
    useEffect(() => {
        const { path, value, language, onValueChange, ...options } = props;
        _editor.updateOptions(options);
        const model = _editor.getModel();
  
        if(model) {
            if (value !== model.getValue()) {
            model.pushEditOperations(
                [],
                [
                    {
                        range: model.getFullModelRange(),
                        text: value,
                    },
                ]
            );}
        }

    });

    /**
     * 
     * - 親コンポーネントからエディタのオプションの変更などを受け取って反映させる
     * - workerを依存関係にしているけれどマウント時に必要な呼出は完了している...はず
     * */ 
    useEffect(() => {
        //
    }, [ESLintWorker, JSXHighlightWorker]);

    // Apply lint to the model
    const _lintCode = (code: string) => {
        const model = _editor.getModel();

        if(model) {
            monaco.editor.setModelMarkers(model, 'eslint', []);
            ESLintWorker.postMessage({
                /* TODO: define message data interface */ 
                code,
                version: model.getVersionId()
            });
        }
    };

    // Apply JSX Highlgiht to the model
    const _jsxHighlight = () => {

    };

    // Update markers
    const _updateMarkers = () => {

    };

    return (
        <div id="Editor" ref={refEditor} ></div>
    );
};

export default MonacoEditor;