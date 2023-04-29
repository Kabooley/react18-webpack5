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
export type onMount = (editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => void;
// TODO: change eventも渡すように
export type onChange = (value: string) => void;
export type onValidate = (markers: monaco.editor.IMarker[]) => void;


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
    // Refs each handler
    const _beforeMount = useRef(beforeMount);
    // Flag that expresses beforeMount is already invoked.
    const _preventBeforeMount = useRef<boolean>(false);
    const _isMounted = useRef<boolean>(false);

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
        // if _preventBeforeMount.current is false
        if(!_preventBeforeMount.current) _beforeMount.current(monaco);

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
        _preventBeforeMount.current = true;
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
     * 
     * Invoke _createEditor() when isEditor returns false.
     * */ 
    useEffect(() => {
        
        // DEBUG:
        console.log("[CodeEditor] Generate editor?:" + isEditorReady);
        // console.log("isEditorReady:" + isEditorReady);
        // console.log("_preventBeforeMount.current:" + _preventBeforeMount.current);

        !isEditorReady && _createEditor();
    }, [isEditorReady, _createEditor]);

    /**
     * Component did mount
     * - Set listeners to each worker
     * - Set cleaner runs when unmount
     * */ 
    useEffect(() => {
        // DEBUG:
        console.log("[CodeEditor] component did mount:(Not about Monaco-Editor)");

        return () => {
            _cleanUp();
        }
    }, []);

    /***
     * Run onMount()
     * 
     * */
    useEffect(() => {
        if(!_isMounted.current && isEditorReady && _editor.current) {
            // DEBUG: 
            console.log("[MonacoEditor] On Mount");

            onMount(_editor.current, monaco);
            _isMounted.current = true;
        }
        // refは依存関係に含める必要がない
    }, [isEditorReady]); 

    /**
     * On Value Change:
     * 
     * Initialize and reset on value change listener to _subscription.
     * */ 
    useEffect(() => {
        // DEBUG:
        console.log("[CodeEditor] onChange useEffect:");

        if(isEditorReady && onChange !== undefined) {

            // DEBUG:
            console.log("[CodeEditor] reset _subscription");
            // console.log("isEditorReady:" + isEditorReady);
            // console.log("_preventBeforeMount.current:" + _preventBeforeMount.current);

            if(_subscription.current) _subscription.current.dispose();
            _subscription.current = _editor.current?.onDidChangeModelContent(() => {

                // DEBUG:
                console.log("[CodeEditor] _subscription callback:");
                
                const value = _editor.current?.getValue();
                onChange(value === undefined ? "" : value);
                // TODO: ESLintworkerへ値を送るのもここで
            });
        }
    }, [onChange, isEditorReady]);

    /***
     * On Validate: 
     * 
     * modelに対してmarkerが変更されたらonValidate()を実行する
     * 
     * - リスナの生成
     * - リスナのクリーンアップコードの登録
     * 
     * たとえば、
     * monaco.editor.setModelMarkers()でmodelに対してmarkerをリセットしたら、
     * そのリセットが発生したuriをonValidateへ伝える。
     * */
    useEffect(() => {
        if(isEditorReady) {
            const didChangeMarkerListener = monaco.editor.onDidChangeMarkers(
                (uris) => {
                    const editorUri = _editor.current!.getModel()?.uri;

                    if(editorUri !== undefined) {
                        const currentEditorHasMarkerChanges = uris.find((uri) => uri.path === editorUri.path);
                        if (currentEditorHasMarkerChanges) {
                          const markers = monaco.editor.getModelMarkers({
                            resource: editorUri,
                          });
                          onValidate(markers);
                        }
                    }
                }
            );

            return () => {
                didChangeMarkerListener?.dispose();
            }
        }

    }, [onValidate, isEditorReady]);

    // DEBUG:
    useEffect(() => {
        console.log("[MonacoEditor] component did update");
        // console.log("isEditorReady:" + isEditorReady);
        // console.log("_preventBeforeMount.current:" + _preventBeforeMount.current);
    });

    // Clean up code
    const _cleanUp = (): void => {
        // DEBUG:
        console.log("[CodeEditor] _cleanup()");

        if(_editor.current) _editor.current.dispose();
        if(_subscription.current) _subscription.current.dispose();
    };

    return (
        <section style={{width: "100%", height: "90vh"}}>
            <div 
                className="monaco-container" 
                ref={_refEditorContainer}
                style={{width: "100%", height: "100%"}}
            ></div>
        </section>
    );
};

export default MonacoEditor;