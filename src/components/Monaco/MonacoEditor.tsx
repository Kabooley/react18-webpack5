/***********************************************************
 * Wrapper of monaco-editor 
 * *********************************************************/ 
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';

import willMountMonacoProcess from './monacoWillMountProcess';
import type { iFile } from '../../data/files';

interface iModel {
    model: monaco.editor.ITextModel;
    state: monaco.editor.ICodeEditorViewState;
};

interface iModels {
    [language: string]: iModel
};

/**
 * iProps contains...
 * - file information
 * - Monaco.editor.IStandaloneEditorConstructionOptions
 * - handlers from parent
 * 
 * */ 
interface iProps 
    extends Monaco.editor.IStandaloneEditorConstructionOptions {
    file: iFile;
    path: string;
    desiredModel: iModel;       // 選択されたmodel
    onValueChange: (v: string) => void;
    onWillMount: () => void;
    onDidMount: () => void;
};


// Preprocess before mount monaco editor.
willMountMonacoProcess();


/**
 * 
 * */ 
const MonacoEditor = (props: iProps): JSX.Element => {
    const _refEditorNode = useRef<HTMLDivElement>(null);
    const _refEditor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    // Ref to ITextModel.onDidChangeContent
    const _subOnDidChangeContent = useRef<Monaco.IDisposable>();
    const _subOnDidChangeModel = useRef<Monaco.IDisposable>();

    // componentDidMount
    /***
     * 
     * - monaco.editor.create()
     * - createModel() according to files
     * - editor.setModel()
     * - reset subscription
     * - set unmount process
     * */ 
    useEffect(() => {
        if(!_refEditorNode.current) throw new Error("Error: monaco-container dom is not exist.");

        const { 
            file, path, onDidMount, onWillMount, onValueChange, 
            ...options 
        } = props;

        _refEditor.current = monaco.editor.create(
            _refEditorNode.current, 
            options
        );

        _subOnDidChangeModel.current = _refEditor.current.onDidChangeModel(
            _onDidChangeModel
        );

        // Generate models according to files prop
        // Object.keys(files).forEach(path => {
        //     _initializeFiles(path, files[path], files.language);
        // });
        _initializeFiles(path, file);

        // Apply file to editor according to path and value
        _applyFile(path);

        // set window resize handlerなど...

        // componentWillUnmount
        return () => {
            _onUnmount();
        }
    }, []);

    // 
    useEffect(() => {
        const { desiredModel } = props;
        _initializeFiles();
        _modelChange(desiredModel);
    }, [props.desiredModel]);

    // componentDidUpdate
    useEffect(() => {
        // DEBUG:
        console.log("[MonacoEditor] on did update.");
    });

    /**
     * fileが追加されたりするたびに呼び出されたりする
     * 生成されたmodelはmonaco-editor固有のstateに保存される
     * （取り出しはmonaco.editor.getModels()で生成済を取り出すことができる）
     * TODO: `data`の更新
     * TODO: applyFileと役割かぶっている
     * */
    // const _initializeFiles = (path: string, value: string, language: string) => {
    const _initializeFiles = (path: string, file: iFile) => {
        const { language, value } = file;
        let model = monaco.editor.getModels()?.find(m => m.uri.path === path);
        if(model) {
            // TODO: apply latest state to the model
        }
        else {
            model = monaco.editor.createModel(
                value, language, 
                new monaco.Uri().with({ path })
            );
            // TODO: ここで適用すべきオプションとは？
            model.updateOptions({
                tabSize: 2,
                insertSpaces: true,        
            });
        }
    };

    /**
     * Apply file to editor according to props.path and props.value
     * */
    const _applyFile = (path: string) => {
        if(!_refEditor.current) return;
        const model = monaco.editor.getModels()?.find(
            m => m.uri.path === path
        );
        model && _refEditor.current.setModel(model);
    };

    /**
     * Handler of event fires when model changed.
     * */
    const _onDidChangeModel = ({ newModelUrl, oldModelUrl }: Monaco.editor.IModelChangedEvent) => {
        _resetSubscriptions();
        // TODO: call something that triggers re-render.
    };

    /**
     * Reset subscriptions
     * */ 
    const _resetSubscriptions = () => {
        _subOnDidChangeContent.current && _subOnDidChangeContent.current.dispose();
        _refEditor.current?.getModel()?.onDidChangeContent(() => {
            const value = _refEditor.current?.getModel()?.getValue();
            props.onValueChange(value ? value : "");
        });
    };
    

    /***
     * 参考：
     * https://github.com/Microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js#L108
     * 
     * https://github.com/satya164/monaco-editor-boilerplate/blob/master/src/Editor.js
     * 
     * satyajitの方はfile: {path: string, value: content}
     * playgroundの方はdata: {
     *  'language': {
     *      model: monaco.editor.ITextModel;
     *      state: monaco.editor.ICodeEditorViewState;
     *   }
     * }
     * 
     * つまり、fileはcreatemodelに必要な材料で
     * dataは出来上がったものである
     * 
     * TODO: `data`をどこに保存しておくか
     * 
     * modelとviewstateの保存
     * */
    const _modelChange = (newModelId: string) => {
        // 切り替える前のeditorのviewstateヲ取り出して
        const currentState = _refEditor.current!.saveViewState();

        // 切り替える前のmodelのstateを保存しておく
        var currentModel = _refEditor.current!.getModel();
        if (currentModel === data.js.model) {
            data.js.state = currentState;
        } else if (currentModel === data.css.model) {
            data.css.state = currentState;
        } else if (currentModel === data.html.model) {
            data.html.state = currentState;
        }

        // modelを切り替えて...
        _refEditor.current!.setModel(data[newModelId].model);
        // 切り替わったmodelのstateを適用する
        _refEditor.current!.restoreViewState(data[newModelId].state);
        _refEditor.current!.focus();
    }; 


    /**
     * - dispose monaco instances
     * - terminate workers
     * - remove event listeners
     * */ 
    const _onUnmount = () => {
        _subOnDidChangeModel.current && _subOnDidChangeModel.current.dispose();
        _subOnDidChangeContent.current && _subOnDidChangeContent.current.dispose();

        // NOTE: fixed error 
        monaco.editor.getModels().forEach(m => m.dispose());

        _refEditor.current && _refEditor.current.dispose();
    };

    return (
        <section style={{width: "100%", height: "90vh"}}>
            <div 
                className="monaco-container" 
                ref={_refEditorNode}
                style={{width: "100%", height: "100%"}}
            ></div>
        </section>
    );
};

export default MonacoEditor;

/****
 * multiple fileの実現のために
 * 
 * MonacoEditor:
 * - 親コンポーネントからprops.file: iFileを取得
 * - props.fileをもとにcreateModel()を実行し、modelを生成しておく
 * （modelは保存する必要がない。monaco.editor.getModels().find()で生成済を取得できる
 * - props.pathをもとに、editorインスタンスへ適用するmodelを選択する
 * - useEffect(, [path])でファイル変更を監視する
 * - useEffect(, [file])は必要ないかなぁ
 * - ファイル変更の手順：saveViewState()して戻り値を保存して(TODO:fileオブジェクト関連へ保存して)、valueも保存して(TODO: 必要性があるか確認)、
 *   setModelして、restoerViewState()で適用モデルの保存しておいたviewstateを適用させる
 * 
 * data: {
 *   // Related to each model
 *  ['uri': string]: viewState: ICodeEditorViewState;    // viewstate of the model related to the uri.
 * }
 * 
 * dataを保存しておく方法：
 * 案１：reactコンポーネントでない関数を定義してimportでとりこみuseEffectで使う
 * 案２：useMemo()を使う
 * */ 
