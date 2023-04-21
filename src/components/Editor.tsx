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


/****
 * workerのインスタンスの保持方法：useMemoでやってみる
 * 
 * */ 
const MonacoEditor = () => {
    let _editor: monaco.editor.IStandaloneCodeEditor;
    const refEditor = useRef<HTMLDivElement>(null);
    
    const worker: Worker = useMemo(() => new Worker(
        new URL(
            "./worker/index.ts", 
            import.meta.url
        )
    ), []);

    // Initialize Editor
    useEffect(() => {
        if(refEditor.current) {
            _editor = monaco.editor.create(refEditor.current, monacoEditorOptions);

            _editor.onDidChangeModelContent((e) => {
                console.log("[onDidChangeModelContent]");
                console.log(e);
            });

            // エディタの入力内容が変更されても反応はしない
            _editor.onDidChangeModel((e) => {
                console.log("[onDidChangeModel]");
                console.log(e);
            });
        }

        return () => {
            _editor.dispose();
        }

    }, []);

    // Did Update
    useEffect(() => {

    }, [])

    return (
        <div id="Editor" ref={refEditor} ></div>
    );
}