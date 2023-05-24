# Note: Multiple editor

Note for `feat_multi-file` branch.

基本：

- fileごとにmonacoのmodelを生成する
- model毎に値などを保持しておく
- fileの切り替えごとにmodelをeditorInstance.setModel(model)すれば切り替わる

## 参考



https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

https://stackoverflow.com/questions/53900950/tabs-in-monaco-editor

## 実装

- マルチファイルエディタ
- 開いている最中のファイルのタブ
- saveViewState, restoreViewState


## 実装：file 

MonacoEditorコンポーネントは、props.pathに該当するファイルを表示するようにする。

- (ひとまず)親コンポーネント(MonacoContainer.tsx)はimportで`files`を取得して、filesのうち一つのfileのpathを子コンポーネントに渡す
- MonacoEditor.tsxはpathとfilesをpropsで取得する
- MonacoEditorはprops.filesを基にmodelを作成する
- MonacoEditorはprops.pathを基にmodelのなかから該当するmodelをsetModel()する
- props.path変更時に、editorに適用しているmodelの変更を行う
- model変更時は、saveViewState()で現在のviewStateを出力して`viewStateFiles`に保存
- model変更時は、restoreViewState()で適用するmodelのviewstateを`viewStateFiles`から取り出して保存する

#### とにかくつくってみる

NOTE: いまのところ、`MonacoEditor`は`files`を直接importしている。

MonacoEditor component:

- props.path: どのタブがまたはファイルが選択されたのかの情報を受け取る
- useEffect(, [props.currentModel])が、initializeFileとchangeModelを呼び出す
- initializeFileはmodelの生成、modelのキャッシュ

changeModel()は、
    saveViewStateで現在のmodelのviewstateを保存する
    setModelで新しいmodelをエディタに反映させる
    restoreViewStateで切り替わったmodelのstateを反映させる


```TypeScript
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';
import viewStateFiles from '../../data/viewStates';
import { getModelByPath } from '../../utils/getModelByPath';
import type { iFile, iFiles } from '../../data/files';

interface iModel {
    model: monaco.editor.ITextModel;
    state: monaco.editor.ICodeEditorViewState;
};

interface iModels {
    [language: string]: iModel
};

interface iProps 
    extends Monaco.editor.IStandaloneEditorConstructionOptions {
    files: iFiles;
    path: string;
    onValueChange: (v: string) => void;
    onWillMount: () => void;
    onDidMount: () => void;
};

/**
 * 
 * */ 
const MonacoEditor = (props: iProps): JSX.Element => {
    const _refEditorNode = useRef<HTMLDivElement>(null);
    const _refEditor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    // Ref to ITextModel.onDidChangeContent
    const _subOnDidChangeContent = useRef<Monaco.IDisposable>();
    const _subOnDidChangeModel = useRef<Monaco.IDisposable>();

    /***
     * componentDidMount
     * 
     * - monaco.editor.create()
     * - createModel() according to files
     * - editor.setModel()
     * - reset subscription
     * - set unmount process
     * */ 
    useEffect(() => {
        if(!_refEditorNode.current) throw new Error("Error: monaco-editor dom is not exist.");

        const { 
            files, path, onDidMount, onWillMount, onValueChange, 
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
        Object.keys(files).forEach(path => {
            _initializeFiles(files[path]);
        });

        // Apply file to editor according to path and value
        _applyFile(path);

        // componentWillUnmount
        return () => {
            _onUnmount();
        }
    }, []);

    /**
	 * props.pathに基づきmodelの変更を適用させる
	 * 
	 * 
	 * */ 
    useEffect(() => {

        const { path, files } = props;

        // Get key which matches its path property
        const key = Object.keys(files).find(k => files[k].path === path);

		// props.pathのモデルを生成させる
        key && _initializeFiles(files[key]);
		// props.pathのモデルを適用させる
        _modelChange(path);
    }, [props.path]);

	/**
	 * 
	 * */ 
    const _initializeFiles = (file: iFile) => {
        const { path, language, value } = file;
        let model = getModelByPath(monaco, path);
        if(model) {
            // TODO: apply latest state to the model
        }
        else {
            model = monaco.editor.createModel(
                value, language, 
                new monaco.Uri().with({ path })
            );
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
     * */
    /***
     * Save previous model viewState.
     * Set selected model to editor.
     * Set selected model's viewState to editor.
     * 
     * @param {string} newModelUriPath - Selected model's uri path.
     * 
     * */ 
    const _modelChange = (newModelUriPath: string) => {
        // 切り替える前のeditorのviewstateヲ取り出して
        const currentState = _refEditor.current!.saveViewState();

        // 切り替える前のmodelのstateを保存しておく
        var currentModel = _refEditor.current!.getModel();
        
        if(!currentModel) throw new Error("No model was set on Editor");

        // Generating {[uripath: string]: monaco.editor.ICodeEditorViewState}
        const s = Object.defineProperty({}, currentModel.uri.path, currentState!) as {
            [uri: string]: monaco.editor.ICodeEditorViewState;
        };
        viewStateFiles.set(s);


        // 適用modelの切り替え
        const model = getModelByPath(monaco, newModelUriPath);
        model && _refEditor.current!.setModel(model);
        _refEditor.current!.restoreViewState(viewStateFiles.get(newModelUriPath));
        _refEditor.current!.focus();
    }; 

    return (
		// ...
    );
};

export default MonacoEditor;
```

これでpathにもとづいてmodelの変更が可能になった。


## 実装：Tabs

- props.pathで現在選択中のファイルのpathを取得する
- props.onChangeFileでタブが切り替わったことを親コンポーネントへ伝達する
- 動的に増減するタブへのDOMポインタを動的ref生成でまかなう

#### 参考

editorで現在開いている最中のファイルのタブ

https://github.com/Microsoft/monaco-editor/issues/604#issuecomment-344214706

https://github.com/Microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js#L108

https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneCodeEditor.html#restoreViewState

https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneCodeEditor.html#saveViewState


#### つくってみた

```TypeScript
// Tabs.tsx
import React, { useRef, useState } from 'react';
import { files } from '../data/files';
import type { iFile } from '../data/files';
import './Tabs.css';

// NOTE: 無理やり型を合わせている。
// 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
// 回避している
interface iJSXNode extends Node {
    className?: string;
};

interface iProps {
    path: string;
    onChangeFile: (path: string) => void;
}

const Tabs = ({ path, onChangeFile }: iProps) => {
    const _refTabArea = useRef<HTMLDivElement>(null);
	// 動的ref生成装置
    const _refTabs = useRef(
        Object.keys(files).map(() => React.createRef<HTMLSpanElement>())
    );

    const changeTab = (selectedTabNode: HTMLSpanElement, desiredFilePath: string) => {
        // 一旦すべてのtabのclassNameを'tab'にする
        for (var i = 0; i < _refTabArea.current!.childNodes.length; i++) {

            var child: iJSXNode = _refTabArea.current!.childNodes[i];
            if (/tab/.test(child.className!)) {
                child.className = 'tab';
            }
        }
        // 選択されたtabのみclassName='tab active'にする
        selectedTabNode.className = 'tab active';
        onChangeFile(desiredFilePath);
    };


    return (
        <div className="tab-area" ref={_refTabArea}>
            {
                Object.keys(files).map((key, index) => {
                    const file: iFile = files[key];
                        return (
                            <span 
                                className={file.path === path ? "tab active": "tab"}
                                ref={_refTabs.current[index]}
                                onClick={() => changeTab(_refTabs.current[index].current!, file.path)}
                            >
                                {file.path}
                            </span>
                        );
                })
            }
        </div>
    );
};

export default Tabs;
```

```css
/* Tabs.css */
.tab-area {
    position: absolute;
    box-sizing: border-box;
    top: 0;
    left: 0;
	height: 20px;
	box-sizing: border-box;
	border-bottom: 1px solid #999;
}

.tab {
	height: 20px;
	line-height: 20px;
	box-sizing: border-box;
	color: #999;
	padding: 0 8px;
	border: 1px solid #999;
	border-bottom: 0;
	cursor: pointer;
	float: left;
}

.tab.active {
	color: black;
	border-bottom: 1px solid white;
    background-color: violet;
}
```

#### 動的ref生成

TODO: stackoverflowの記事を貼る。

どのタブに切り替わったのか、classNameを変更するためにどうしてもDOM情報が必要なので、

動的に生成されるタブに対応するため動的なref生成が必要になった。



## 他

#### webpack: 無視するディレクトリの指定の仕方

TODO: evacuationを指定すること

#### iframeでのコードの埋め込み方

Microsoftのやりかたがここに載っていた～

https://github.com/microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js

