import * as monaco from 'monaco-editor';
import type * as Monaco from 'monaco-editor';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';


// editor.api.d.ts::BuiltinTheme
const defaultTheme = 'vs-dark';
const defaultCompilerOptions: Monaco.languages.typescript.CompilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    alwaysStrict: true,
    jsxFactory: 'React.createElement',
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    typeRoots: ["node_modules/@types"],
};


const setFormatter = (): void => {
    monaco.languages.registerDocumentFormattingEditProvider(
		"javascript",
		{
			async provideDocumentFormattingEdits(
                model, options, token) {
				const formatted = await prettier.format(
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

				return [{
					range: model.getFullModelRange(),
					text: formatted,
				}];
			}
		});
};

/**
 * monaco.language.typescript.typescriptDefault.addExtraLibs()
 * 
 * */ 
const files = {
    'react': ``,
    'react-dom': ``,
}

// const addExtraLibraries = () => {
//     monaco.languages.typescript.typescriptDefaults.addExtraLib();
// };

/***
 * willMountMonacoProcess will be invoked before monaco is mounted.
 * */ 
const willMountMonacoProcess = () => {
    // set theme. va-dark as default.
    monaco.editor.setTheme(defaultTheme);

    // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    //     noSemanticValidation: true,
    //     noSyntaxValidation: true,
    // });

    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);


    // set compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
        defaultCompilerOptions
    );
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
        defaultCompilerOptions
    );
    // set formatter
    setFormatter();
};

export default willMountMonacoProcess;