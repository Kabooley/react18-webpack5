/***********************************************************
 * Wrapper of monaco-editor 
 * *********************************************************/ 
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';

import willMountMonacoProcess from './monacoWillMountProcess';
import type { iFile, iFiles } from './files';

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
        _initializeFiles(path, file.value, file.language);

        // Apply file to editor according to path and value
        _applyFile(path);

        // set window resize handlerなど...

        // componentWillUnmount
        return () => {
            _onUnmount();
        }
    }, []);

    // componentDidUpdate
    useEffect(() => {
        // DEBUG:
        console.log("[MonacoEditor] on did update.");
    });

    /**
     * 
     * */
    const _initializeFiles = (path: string, value: string, language: string) => {
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

/***
 * Temporary Memo
 * 
 * Error ModelService: Cannot add model because it already exists!
 * 
 *  https://stackoverflow.com/a/62466612
 *  
 *  
 * 
 * */ 