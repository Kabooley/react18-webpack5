/**********************************************************
 * Monaco Editor that enables Multiple files.
 * 
 * NOTE:
 * - Temporary disable workers to implement only multi-file functionality.
 *  Back up has saved @ evacuation/App.tsx.backupyyyymmdd
 * ********************************************************/ 
import React, { useState, useRef, useMemo, useEffect } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './Monaco/MonacoEditor';
import Tabs from './Tabs';
import { files } from "../data/files";
import './index.css';


// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};


/***
 * IStandaloneEditorConstructionOptions: {
 *  model, value, language, theme, 
 * }
 * IEditorOptions: {
 *  isDiffEditor,
 *  tabIndex,
 *  lineNumbers,
 *  scrollbar,
 *  minimap,
 *  ...many props
 * }
 * 
 * */ 
const editorConstructOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
	language: "typescript",
	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
};


const MonacoContainer = () => {
    const [value, setValue] = useState<string>("");
    const [currentFilePath, setCurrentFilePath] = useState<string>(files['react-typescript'].path);

    useEffect(() => {
        // DEBUG:
        console.log("[App] on did mount");

        return () => {
            _onUnmount();
        }
    }, []);

    
    const onWillMount = () => {
        // DEBUG:
        console.log("[App] Will mount.");
    };
    
    const onDidMount = () => {
        // DEBUG:
        console.log("[App] Did mount.");
    };

    const onValueChange = (v: string) => {
        // DEBUG:
        console.log("[App] On value change.");

        setValue(v);
    };


    const _onUnmount = () => {
        // DEBUG:
        console.log("[App] onUnmount():");
    };

    
    const onChangeFile = (path: string) => {
        // DEBUG:
        console.log(`[MonacoContainer] onChangeFile: change to ${path}`);

        setCurrentFilePath(path);
    }

    return (
        <div className="monaco-container">
            <Tabs path={currentFilePath} onChangeFile={onChangeFile}/>
            <MonacoEditor 
                files={files}
                // 'react-typescript' as default path
                path={currentFilePath}   
                onWillMount={onWillMount}
                onValueChange={onValueChange}
                onDidMount={onDidMount}
                {...editorConstructOptions}
            />
        </div>
    );
};

export default MonacoContainer;