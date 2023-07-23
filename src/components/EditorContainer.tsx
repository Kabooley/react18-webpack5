/*****************************************
 * 選択ファイルの同期の実装：選択ファイルが切り替わったら、
 * state.currentFilePathとstate.currentCodeを選択中ファイルのものに切り替える。
 *
 *
 * fileが切り替わったことを知る手段：files.find(f => f.isSelected())
 *
 * ***************************************/
import React from 'react';
import * as monaco from 'monaco-editor';
import Tabs from './Tabs';
import type { iOrderBundleResult } from '../worker/types';
import type { File } from '../data/files';
import type { iFilesActions } from '../context/FilesContext';
import type { iBundledCodeActions } from '../context/BundleContext';
import { Types as bundledContextTypes } from '../context/BundleContext';
import { Types as filesContextTypes } from '../context/FilesContext';
import { OrderTypes } from '../worker/types';

// import MonacoEditor from './Monaco/MonacoEditor';
import MonacoEditor from './Monaco/MonacoEditor';

interface iProps {
    files: File[];
    dispatchFiles: React.Dispatch<iFilesActions>;
    dispatchBundledCode: React.Dispatch<iBundledCodeActions>;
}

interface iState {
    currentFilePath: string;
    currentCode: string;
}

const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions =
    {
        language: 'typescript',
        lineNumbers: 'off',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        theme: 'vs-dark',
        dragAndDrop: false,
        automaticLayout: true, // これ設定しておかないとリサイズ時に壊れる
    };

class EditorContainer extends React.Component<iProps, iState> {
    state = {
        currentFilePath: '',
        // NOTE: temporary
        currentCode: '',
    };
    _bundleWorker: Worker | undefined;

    constructor(props: iProps) {
        super(props);

        // Bind methods which will be sent as props.
        this._onEditorContentChange = this._onEditorContentChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onChangeSelectedTab = this._onChangeSelectedTab.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onDidChangeModel = this._onDidChangeModel.bind(this);
    }

    componentDidMount() {
        const { files } = this.props;

        const selectedFile = files.find((f) => f.isSelected());
        selectedFile &&
            this.setState({
                currentFilePath: selectedFile.getPath(),
                currentCode: selectedFile.getValue(),
            });

        if (window.Worker) {
            this._bundleWorker = new Worker(
                new URL('/src/worker/bundle.worker.ts', import.meta.url),
                { type: 'module' }
            );
            this._bundleWorker.addEventListener(
                'message',
                this._onMessage,
                false
            );
        }
    }

    componentDidUpdate(prevProp: iProps, prevState: iState) {
        const { files } = this.props;

        const selectedFile = files.find((f) => f.isSelected());
        if (prevState.currentFilePath !== selectedFile?.getPath()) {
            selectedFile &&
                this.setState({
                    currentFilePath: selectedFile.getPath(),
                    currentCode: selectedFile.getValue(),
                });
        }
    }

    componentWillUnmount() {
        this._bundleWorker &&
            this._bundleWorker.addEventListener(
                'message',
                this._onMessage,
                false
            );
        this._bundleWorker && this._bundleWorker.terminate();
    }

    _onEditorContentChange(code: string, path: string) {
        // DEBUG:
        console.log('[EditorContainer] _onEditorcontentChange:');
        console.log(this.state.currentCode);
        console.log(code);

        this.setState({ currentCode: code });
        this.props.dispatchFiles({
            type: filesContextTypes.Change,
            payload: {
                // targetFilePath: this.state.currentFilePath,
                targetFilePath: path,
                changeProp: {
                    newValue: code,
                },
            },
        });
    }

    // NOTE: Temporary method.
    _onSubmit() {
        this._bundleWorker &&
            this._bundleWorker.postMessage({
                order: OrderTypes.Bundle,
                rawCode: this.state.currentCode,
            });
    }

    _onMessage(e: MessageEvent<iOrderBundleResult>) {
        const { bundledCode, err } = e.data;

        bundledCode &&
            this.props.dispatchBundledCode({
                type: bundledContextTypes.Update,
                payload: {
                    bundledCode: bundledCode,
                    error: err,
                },
            });
    }

    // Save previous model value
    _onDidChangeModel(path: string, value: string) {
        // this.props.dispatchFiles({
        //     type: filesContextTypes.Change,
        //     payload: {
        //         targetFilePath: path,
        //         changeProp: {
        //             newValue: value,
        //         },
        //     },
        // });
    }

    _onChangeSelectedTab(selected: string) {
        this.props.dispatchFiles({
            type: filesContextTypes.ChangeSelectedFile,
            payload: { selectedFilePath: selected },
        });
    }

    render() {
        return (
            // TODO: Rename "monaco-container" to "editor-container"
            <div className="monaco-container">
                <Tabs
                    path={this.state.currentFilePath}
                    onChangeSelectedTab={this._onChangeSelectedTab}
                />
                <MonacoEditor
                    files={this.props.files}
                    path={this.state.currentFilePath!}
                    onEditorContentChange={this._onEditorContentChange}
                    onDidChangeModel={this._onDidChangeModel}
                    {...editorConstructOptions}
                />
                <button onClick={this._onSubmit}>submit</button>
            </div>
        );
    }
}

export default EditorContainer;
