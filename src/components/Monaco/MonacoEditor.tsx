/***********************************************************
 * Wrapper of monaco-editor 
 * *********************************************************/ 
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import viewStateFiles from '../../data/viewStates';
import { getModelByPath } from '../../utils';
import type { iFile } from '../../data/types';
import type { File } from '../../data/files';
// 使いたくない
import willMountMonacoProcess from './monacoWillMountProcess';


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


// NOTE: monaco-editor settings ref: 
// https://github.com/expo/snack/blob/main/website/src/client/components/Editor/MonacoEditor.tsx

// いまのとろこ独自テーマを設ける予定はない...
// monaco.editor.defineTheme('light', light);
// monaco.editor.defineTheme('dark', dark);

/**
 * Disable typescript's diagnostics for JavaScript files.
 * This suppresses errors when using Flow syntax.
 * It's also unnecessary since we use ESLint for error checking.
 */
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: true,
  noSyntaxValidation: true,
});

/**
 * Use prettier to format code.
 * This will replace the default formatter.
 */
const documentFormattingProvider: monaco.languages.DocumentFormattingEditProvider = {
  async provideDocumentFormattingEdits(model) {
    const text = await prettier.format(
        model.getValue(), 
        {
            parser: 'babel',
            plugins: [parser],
            useTabs: false,
            semi: true,
            singleQuote: true,
            tabWidth: 2
        })
        .replace(/\n$/, '');

    return [
      {
        range: model.getFullModelRange(),
        text,
      },
    ];
  },
};

monaco.languages.registerDocumentFormattingEditProvider('javascript', documentFormattingProvider);
monaco.languages.registerDocumentFormattingEditProvider('typescript', documentFormattingProvider);
monaco.languages.registerDocumentFormattingEditProvider('markdown', documentFormattingProvider);

/**
 * Sync all the models to the worker eagerly.
 * This enables intelliSense for all files without needing an `addExtraLib` call.
 */
monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

/**
 * Configure the typescript compiler to detect JSX and load type definitions
 */
const compilerOptions: monaco.languages.typescript.CompilerOptions = {
  allowJs: true,
  allowSyntheticDefaultImports: true,
  alwaysStrict: true,
  esModuleInterop: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
  module: monaco.languages.typescript.ModuleKind.ESNext,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  noEmit: true,
  resolveJsonModule: true,
  strict: true,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
//   paths: {
//     '*': ['*', '*.native', '*.ios', '*.android'],
//   },
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);




/**
 * - file information
 * - Monaco.editor.IStandaloneEditorConstructionOptions
 * - handlers from parent
 * 
 * */ 
interface iProps 
    extends Monaco.editor.IStandaloneEditorConstructionOptions {
    // files: iFile[];
    files: File[];
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
        files.forEach(file => {
            _initializeFiles(file);
        });

        // Apply file to editor according to path and value
        _applyFile(path);

        _refEditorNode.current.addEventListener('resize', _onResize);

        return () => {
            _onUnmount();
        }
    }, []);

    // 
    useEffect(() => {
        // DEBUG:
        console.log("[MonacoEditor] useEffect(, [props.path])");

        const { path, files } = props;

        console.log(`path: ${path}`);
        console.log(files);

        // Get key which matches its path property
        // const key = Object.keys(files).find(k => files[k].path === path);
        const selectedFile = files.find(file => file.getPath() === path);

        selectedFile && _initializeFiles(selectedFile);
        _modelChange(path);
    }, [props.path]);

    // componentDidUpdate
    useEffect(() => {
        // DEBUG:
        console.log("[MonacoEditor] on did update.");
    });

    /**
     * fileが追加されたりするたびに呼び出されたりする
     * 生成されたmodelはmonaco-editor固有のstateに保存される
     * （取り出しはmonaco.editor.getModels()で生成済を取り出すことができる）
     * */
    const _initializeFiles = (file: File) => {
        const path = file.getPath();
        const language = file.getLanguage();
        const value = file.getValue();

        let model = getModelByPath(path);
        
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
     * */
    /***
     * Save previous model viewState.
     * Set selected model to editor.
     * Set selected model's viewState to editor.
     * 
     * @param {string} newModelUriPath - Selected model's uri path.
     * 
     * TODO: modelをuri.pathから引っ張ってくる
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
        const model = getModelByPath(newModelUriPath);
        model && _refEditor.current!.setModel(model);
        _refEditor.current!.restoreViewState(viewStateFiles.get(newModelUriPath));
        _refEditor.current!.focus();
    }; 

    const _onResize = () => {
        return _refEditor.current!.layout();
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

        _refEditorNode.current && _refEditorNode.current.removeEventListener('resize', _onResize);
    };  

    return (
        <>
            <div 
                className="monaco-editor" 
                ref={_refEditorNode}
            ></div>
        </>
    );
};

export default MonacoEditor;