/***********************************************************
 * Wrapper of monaco-editor 
 * 
 * NOTE: monaco-editor settings ref: 
 * https://github.com/expo/snack/blob/main/website/src/client/components/Editor/MonacoEditor.tsx
 * *********************************************************/ 
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
import viewStateFiles from '../../data/viewStates';
import { getModelByPath } from '../../utils';
import type { File } from '../../data/files';

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
    files: File[];
    path: string;
    onValueChange: (v: string) => void;
    onWillMount: () => void;
    onDidMount: () => void;
};

interface iState {}

const defaultTheme = 'vs-dark';
monaco.editor.setTheme(defaultTheme);

// Store editor states such as cursor position, selection and scroll position for each model
const editorStates = new Map<string, monaco.editor.ICodeEditorViewState | undefined | null>();


/***
 * NOTE: To use webworker with React 18, class component is required.
 * 
 * fetchLibssworker will be placed this component.
 * 
 * 
 *  TODO: value changeが効いていない。MonacoContainer.state.valueで管理しても意味がないのでそのままdispatchした方がよい。
 *      TODO: それにともなって複数contextをclass componentで扱うために一旦複数contextを一つにまとめる必要がある
 *  TODO: tabsで表示タブ変更してもMonacoContainerのstate.currentFilePathは変更されていないかも。FilesContextでcurrentFilePathを扱った方がいいかも。
 * 
 * ...ということでMonacoContainerの修正
 * */ 
export class MonacoEditor_ extends React.Component<iProps, iState> {
    _typingsWorker: Worker | undefined;
    _refEditorNode = React.createRef<HTMLDivElement>();
    _refEditor: Monaco.editor.IStandaloneCodeEditor | null = null;
    _disposables: monaco.IDisposable[] = [];

    constructor(props: iProps){
        super(props);

        // NOTE: Bind method which pass `this` to any callbacks.
        this._handleEditFile = this._handleEditFile.bind(this);
    };

    /***
     * 
     * Create monaco editor instance.
     * Create models according to props.files. 
     * Set model to editor which is specified as props.path.
     * Set this._handleEditFile as listener of monaco.editor.onDidChangeModelContent
     * */ 
    componentDidMount() {
        this._typingsWorker = new Worker('', { type: 'module' });
        this._typingsWorker?.addEventListener('message', () => {});

        const {
            files, 
            path,
            onValueChange,
            onWillMount,
            onDidMount,
            ...options
        } = this.props;

        // Generate Editor instance.
        const editor = monaco.editor.create(
            this._refEditorNode.current as HTMLDivElement,
            options
        );
        this._refEditor = editor;

        // DEBUG:
        console.log("[MonacoEditor_] is editor created?");
        console.log(this._refEditor);

        this._disposables = [editor];
        // Subscribe onChange handler for current model content.
        // NOTE: This subscription service does not need to be cancelled if the model is changed.
        // Because `onDidChangeModelContent` always listens to current model.
        this._disposables.push(editor.onDidChangeModelContent(this._handleEditFile));

        // Set current path's model to editor.
        const currentFile = files.find(f => f.getPath() === path);
        if(currentFile === undefined) throw new Error("[MonacoEditor] the file does not exist in files.");
        // Set specified model to editor. 
        this._openFile(currentFile!, true);
        // Load all the files  so the editor can provide proper intelliscense
        files.forEach(f => this._initializeFile(f));

        
        this._refEditorNode.current && this._refEditorNode.current.addEventListener('resize', this._handleResize);
    };

    /***
     * 
     * 
     * */ 
    componentDidUpdate(prevProps: iProps, prevState: iState) {
        const {
            files, 
            path,
            onValueChange,
            onWillMount,
            onDidMount,
            ...options
        } = this.props;

        const selectedFile = files.find(f => f.getPath() === path);
        // const previousFile = prevProps.files.find(f => f.getPath() === prevProps.path);

        if (this._refEditor) {
            this._refEditor.updateOptions(options);
      
            const model = this._refEditor.getModel();
            const value = selectedFile?.getValue();

            // Change model and save view state if path is changed
            if (path == prevProps.path) {
              // Save the editor state for the previous file so we can restore it when it's re-opened
              editorStates.set(prevProps.path, this._refEditor.saveViewState());
      
              selectedFile && this._openFile(selectedFile, true);
            } 
            else if (model && value !== model.getValue()) {
              // @ts-ignore
              this._refEditor.executeEdits(null, [
                {
                  range: model.getFullModelRange(),
                  text: value!,
                },
              ]);
            }
        }
      
        // if (annotations !== prevProps.annotations || selectedFile !== prevProps.selectedFile) {
        // this._updateMarkers(annotations, selectedFile);
        // }
    
        // if (this.state.allDependencies !== prevState.allDependencies) {
        // this._fetchTypings();
        // }
    
        // if (mode !== prevProps.mode) {
        // this._toggleMode(mode);
        // }
    
        // if (theme !== prevProps.theme) {
        // // Update the global editor theme
        // // Monaco doesn't have a way to change theme locally
        // monaco.editor.setTheme(theme);
        // }
    
        // // Update all changed entries for updated intellisense
        // if (prevProps.files !== this.props.files) {
        //     for (const path in this.props.files) {
        //         const file = this.props.files[path];
        //         if (
        //         file.type === 'CODE' &&
        //         file.contents !== prevProps.files[path]?.contents &&
        //         path !== selectedFile
        //         ) {
        //         this._initializeFile(path, file.contents);
        //         }
        //     }
        // }
    };

    componentWillUnmount() {
        this._refEditorNode.current && this._refEditorNode.current.removeEventListener('resize', this._handleResize);
        this._disposables.forEach(d => d.dispose());
        monaco.editor.getModels().forEach(m => m.dispose());
        this._typingsWorker?.terminate();
    };

    _initializeFile = (file: File) => {
        const path = file.getPath();
        const language = file.getLanguage();
        const value = file.getValue();

        let model = getModelByPath(path);
        
        if(model && !model.isDisposed()) {
            // @ts-ignore
            model.pushEditOperations(
                [],
                [
                {
                    range: model.getFullModelRange(),
                    text: value,
                },
                ]
            );
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

    // _openFile = (path: string, value: string, focus?: boolean) => {
    _openFile = (file: File, focus?: boolean) => {
        this._initializeFile(file);
    
        const model = getModelByPath(file.getPath());
    
        if (this._refEditor && model) {
          this._refEditor.setModel(model);
    
          // Restore the editor state for the file
          const editorState = editorStates.get(file.getPath());
    
          if (editorState) {
            this._refEditor.restoreViewState(editorState);
          }
    
          if (focus) {
            this._refEditor.focus();
          }
        }
    };

    // onChange handler for current model content.
    _handleEditFile(e: monaco.editor.IModelContentChangedEvent): void {
        const model = this._refEditor?.getModel();
        if(model) {
            const value = model.getValue();
            if (value !== this.props.files.find(f => f.getPath() === this.props.path)?.getValue()) {
                this.props.onValueChange(value);
            }
        }
    };

    _handleResize = () => {
        return this._refEditor && this._refEditor.layout();
    };

    render() {
        return (
            <>
                <div 
                    className="monaco-editor" 
                    ref={this._refEditorNode}
                ></div>
            </>
        );
    }
};


// /**
//  * 
//  * */ 
// const MonacoEditor = (props: iProps): JSX.Element => {
//     const _refEditorNode = useRef<HTMLDivElement>(null);
//     const _refEditor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
//     // Ref to ITextModel.onDidChangeContent
//     const _subOnDidChangeContent = useRef<Monaco.IDisposable>();
//     const _subOnDidChangeModel = useRef<Monaco.IDisposable>();

//     /***
//      * componentDidMount
//      * 
//      * - monaco.editor.create()
//      * - createModel() according to files
//      * - editor.setModel()
//      * - reset subscription
//      * - set unmount process
//      * */ 
//     useEffect(() => {
//         if(!_refEditorNode.current) throw new Error("Error: monaco-editor dom is not exist.");

//         const { 
//             files, path, onDidMount, onWillMount, onValueChange, 
//             ...options 
//         } = props;

//         _refEditor.current = monaco.editor.create(
//             _refEditorNode.current, 
//             options
//         );

//         _subOnDidChangeModel.current = _refEditor.current.onDidChangeModel(
//             _onDidChangeModel
//         );

//         // Generate models according to files prop
//         files.forEach(file => {
//             _initializeFiles(file);
//         });

//         // Apply file to editor according to path and value
//         _applyFile(path);

//         _refEditorNode.current.addEventListener('resize', _onResize);

//         return () => {
//             _onUnmount();
//         }
//     }, []);

//     // 
//     useEffect(() => {
//         // DEBUG:
//         console.log("[MonacoEditor] useEffect(, [props.path])");

//         const { path, files } = props;

//         console.log(`path: ${path}`);
//         console.log(files);

//         // Get key which matches its path property
//         // const key = Object.keys(files).find(k => files[k].path === path);
//         const selectedFile = files.find(file => file.getPath() === path);

//         selectedFile && _initializeFiles(selectedFile);
//         _modelChange(path);
//     }, [props.path]);

//     // componentDidUpdate
//     useEffect(() => {
//         // DEBUG:
//         console.log("[MonacoEditor] on did update.");
//     });

//     /**
//      * fileが追加されたりするたびに呼び出されたりする
//      * 生成されたmodelはmonaco-editor固有のstateに保存される
//      * （取り出しはmonaco.editor.getModels()で生成済を取り出すことができる）
//      * */
//     const _initializeFiles = (file: File) => {
//         const path = file.getPath();
//         const language = file.getLanguage();
//         const value = file.getValue();

//         let model = getModelByPath(path);
        
//         if(model) {
//             // TODO: apply latest state to the model
//         }
//         else {
//             model = monaco.editor.createModel(
//                 value, language, 
//                 new monaco.Uri().with({ path })
//             );
//             // TODO: ここで適用すべきオプションとは？
//             model.updateOptions({
//                 tabSize: 2,
//                 insertSpaces: true,        
//             });
//         }
//     };

//     /**
//      * Apply file to editor according to props.path and props.value
//      * */
//     const _applyFile = (path: string) => {
//         if(!_refEditor.current) return;
//         const model = monaco.editor.getModels()?.find(
//             m => m.uri.path === path
//         );
//         model && _refEditor.current.setModel(model);
//     };

//     /**
//      * Handler of event fires when model changed.
//      * */
//     const _onDidChangeModel = ({ newModelUrl, oldModelUrl }: Monaco.editor.IModelChangedEvent) => {
//         _resetSubscriptions();
//         // TODO: call something that triggers re-render.
//     };

//     /**
//      * Reset subscriptions
//      * */ 
//     const _resetSubscriptions = () => {
//         _subOnDidChangeContent.current && _subOnDidChangeContent.current.dispose();
//         _refEditor.current?.getModel()?.onDidChangeContent(() => {
//             const value = _refEditor.current?.getModel()?.getValue();
//             props.onValueChange(value ? value : "");
//         });
//     };
    

//     /***
//      * 参考：
//      * https://github.com/Microsoft/monaco-editor/blob/bad3c34056624dca34ac8be5028ae3454172125c/website/playground/playground.js#L108
//      * 
//      * https://github.com/satya164/monaco-editor-boilerplate/blob/master/src/Editor.js
//      * 
//      * */
//     /***
//      * Save previous model viewState.
//      * Set selected model to editor.
//      * Set selected model's viewState to editor.
//      * 
//      * @param {string} newModelUriPath - Selected model's uri path.
//      * 
//      * TODO: modelをuri.pathから引っ張ってくる
//      * */ 
//     const _modelChange = (newModelUriPath: string) => {
//         // 切り替える前のeditorのviewstateヲ取り出して
//         const currentState = _refEditor.current!.saveViewState();

//         // 切り替える前のmodelのstateを保存しておく
//         var currentModel = _refEditor.current!.getModel();
        
//         if(!currentModel) throw new Error("No model was set on Editor");

//         // Generating {[uripath: string]: monaco.editor.ICodeEditorViewState}
//         const s = Object.defineProperty({}, currentModel.uri.path, currentState!) as {
//             [uri: string]: monaco.editor.ICodeEditorViewState;
//         };
//         viewStateFiles.set(s);


//         // 適用modelの切り替え
//         const model = getModelByPath(newModelUriPath);
//         model && _refEditor.current!.setModel(model);
//         _refEditor.current!.restoreViewState(viewStateFiles.get(newModelUriPath));
//         _refEditor.current!.focus();
//     }; 

//     const _onResize = () => {
//         return _refEditor.current!.layout();
//     };

//     /**
//      * - dispose monaco instances
//      * - terminate workers
//      * - remove event listeners
//      * */ 
//     const _onUnmount = () => {
//         _subOnDidChangeModel.current && _subOnDidChangeModel.current.dispose();
//         _subOnDidChangeContent.current && _subOnDidChangeContent.current.dispose();

//         // NOTE: fixed error 
//         monaco.editor.getModels().forEach(m => m.dispose());

//         _refEditor.current && _refEditor.current.dispose();

//         _refEditorNode.current && _refEditorNode.current.removeEventListener('resize', _onResize);
//     };  

//     return (
//         <>
//             <div 
//                 className="monaco-editor" 
//                 ref={_refEditorNode}
//             ></div>
//         </>
//     );
// };

// export default MonacoEditor;