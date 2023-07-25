# ESBuild

## 確かめること

esbuildはブラウザ上のファイル情報を含めてバンドリングできるのか検証する。

# Bundle React + TypeScript by ESBuild wasm

## 実例から

## TypeScript Playground

https://github.com/microsoft/TypeScript-Website/tree/v2/packages/playground

web上でTypeScriptコードをコンパイルしてJSコードにしてサンドボックスへ出力しているので、

TypeScriptコードをブラウザ上でコンパイルすべを知る。

monaco-editor上のコードの、コンパイル時のコードの行方。

src/index.ts

```TypeScript
// src/index.ts
  const runButton = document.getElementById("run-button")
  if (runButton) {
    runButton.onclick = () => {
        // runはすでにコンパイル済のコード
      const run = sandbox.getRunnableJS()
      const runPlugin = plugins.find(p => p.id === "logs")!
      activatePlugin(runPlugin, getCurrentPlugin(), sandbox, tabBar, container)

        // ...
    }
  }
// ../packages/sandbox/src/index.ts
  /** Gets the JS  of compiling your editor's code */
  const getRunnableJS = async () => {
    // This isn't quite _right_ in theory, we can downlevel JS -> JS
    // but a browser is basically always esnext-y and setting allowJs and
    // checkJs does not actually give the downlevel'd .js file in the output
    // later down the line.
    if (isJSLang) {
      return getText()
    }
    const result = await getEmitResult()
    const firstJS = result.outputFiles.find((o: any) => o.name.endsWith(".js") || o.name.endsWith(".jsx"))
    return (firstJS && firstJS.text) || ""
  }

    /** Gets the results of compiling your editor's code */
  const getEmitResult = async () => {
    const model = editor.getModel()!
    const client = await getWorkerProcess()
    return await client.getEmitOutput(model.uri.toString())
  }

// `client`は以下のようにmonaco-editorがデフォで用意するworkerである。
  const getWorker = isJSLang
    ? monaco.languages.typescript.getJavaScriptWorker
    : monaco.languages.typescript.getTypeScriptWorker

// typeScript workerの型定義
export declare class TypeScriptWorker implements ts.LanguageServiceHost {
    private _ctx
    private _extraLibs
    private _languageService
    private _compilerOptions
    private _inlayHintsOptions?
    constructor(ctx: worker.IWorkerContext, createData: ICreateData)
    getCompilationSettings(): ts.CompilerOptions
    getScriptFileNames(): string[]
    private _getModel
    getScriptVersion(fileName: string): string
    getScriptText(fileName: string): Promise<string | undefined>
    _getScriptText(fileName: string): string | undefined
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot | undefined
    getScriptKind?(fileName: string): ts.ScriptKind
    getCurrentDirectory(): string
    getDefaultLibFileName(options: ts.CompilerOptions): string
    isDefaultLibFileName(fileName: string): boolean
    getLibFiles(): Promise<Record<string, string>>
    private static clearFiles
    getSyntacticDiagnostics(fileName: string): Promise<ts.Diagnostic[]>
    getSemanticDiagnostics(fileName: string): Promise<ts.Diagnostic[]>
    getSuggestionDiagnostics(fileName: string): Promise<ts.Diagnostic[]>
    getCompilerOptionsDiagnostics(fileName: string): Promise<ts.Diagnostic[]>
    getCompletionsAtPosition(fileName: string, position: number): Promise<ts.CompletionInfo | undefined>
    getCompletionEntryDetails(
        fileName: string,
        position: number,
        entry: string
    ): Promise<ts.CompletionEntryDetails | undefined>
    getSignatureHelpItems(
        fileName: string,
        position: number,
        options: ts.SignatureHelpItemsOptions | undefined
    ): Promise<ts.SignatureHelpItems | undefined>
    getQuickInfoAtPosition(fileName: string, position: number): Promise<ts.QuickInfo | undefined>
    getOccurrencesAtPosition(fileName: string, position: number): Promise<ReadonlyArray<ts.ReferenceEntry> | undefined>
    getDefinitionAtPosition(fileName: string, position: number): Promise<ReadonlyArray<ts.DefinitionInfo> | undefined>
    getReferencesAtPosition(fileName: string, position: number): Promise<ts.ReferenceEntry[] | undefined>
    getNavigationBarItems(fileName: string): Promise<ts.NavigationBarItem[]>
    getFormattingEditsForDocument(fileName: string, options: ts.FormatCodeOptions): Promise<ts.TextChange[]>
    getFormattingEditsForRange(
        fileName: string,
        start: number,
        end: number,
        options: ts.FormatCodeOptions
    ): Promise<ts.TextChange[]>
    getFormattingEditsAfterKeystroke(
        fileName: string,
        position: number,
        ch: string,
        options: ts.FormatCodeOptions
    ): Promise<ts.TextChange[]>
    findRenameLocations(
        fileName: string,
        position: number,
        findInStrings: boolean,
        findInComments: boolean,
        providePrefixAndSuffixTextForRename: boolean
    ): Promise<readonly ts.RenameLocation[] | undefined>
    getRenameInfo(fileName: string, position: number, options: ts.RenameInfoOptions): Promise<ts.RenameInfo>
    getEmitOutput(fileName: string): Promise<ts.EmitOutput>
    getCodeFixesAtPosition(
        fileName: string,
        start: number,
        end: number,
        errorCodes: number[],
        formatOptions: ts.FormatCodeOptions
    ): Promise<ReadonlyArray<ts.CodeFixAction>>
    updateExtraLibs(extraLibs: IExtraLibs): Promise<void>
    provideInlayHints(fileName: string, start: number, end: number): Promise<readonly ts.InlayHint[]>
}
```

これが実現できるのか試してみないとなぁ


出力先:

div.playground-sideber
    div.playground-plugin-container <-- ここ

```TypeScript
// src/sidebar/runtime.ts

// closureとはトランスパイルしたエディタのコードかも
export const runWithCustomLogs = (closure: Promise<string>, i: Function) => {
  const noLogs = document.getElementById("empty-message-container")
  const logContainer = document.getElementById("log-container")!
  const logToolsContainer = document.getElementById("log-tools")!
  if (noLogs) {
    noLogs.style.display = "none"
    logContainer.style.display = "block"
    logToolsContainer.style.display = "flex"
  }

    // コードはこっちへ
  rewireLoggingToElement(
    () => document.getElementById("log")!,
    () => document.getElementById("log-container")!,
    closure,
    true,
    i
  )
}

function rewireLoggingToElement(
  eleLocator: () => Element,
  eleOverflowLocator: () => Element,
  closure: Promise<string>,
  autoScroll: boolean,
  i: Function
) {
  const rawConsole = console;

  closure.then((js) => {
    const replace = {} as any;
    bindLoggingFunc(replace, rawConsole, "log", "LOG");
    bindLoggingFunc(replace, rawConsole, "debug", "DBG");
    bindLoggingFunc(replace, rawConsole, "warn", "WRN");
    bindLoggingFunc(replace, rawConsole, "error", "ERR");
    replace["clear"] = clearLogs;
    const console = Object.assign({}, rawConsole, replace);
    try {
        // ここですな
      const safeJS = sanitizeJS(js);
      eval(safeJS);
    } catch (error) {
      console.error(i("play_run_js_fail"));
      console.error(error);

      if (error instanceof SyntaxError && /\bexport\b/u.test(error.message)) {
        console.warn(
          'Tip: Change the Module setting to "CommonJS" in TS Config settings to allow top-level exports to work in the Playground'
        );
      }
    }
  });
    // ...
}
```
eval()つかってますね。

処理の流れ

button準備

button.onClick

--> monaco.editor.getModel()でmodelを取得する

--> monaco-editorの用意してあるworkerを取得する

```TypeScript
// `client`は以下のようにmonaco-editorがデフォで用意するworkerである。
  const getWorker = isJSLang
    ? monaco.languages.typescript.getJavaScriptWorker
    : monaco.languages.typescript.getTypeScriptWorker
```
--> getWorker().getEmitOutput()

--> compile済のコードを含むオブジェクトを取得する

## 情報収集

https://stackoverflow.com/questions/23075748/how-to-compile-typescript-code-in-the-browser

## ESBuild Official

#### TypeScript

https://esbuild.github.io/content-types/#typescript-caveats

> このローダーはデフォルトで .ts、.tsx、.mts、.cts ファイルに対して有効になっている。つまり、esbuild は TypeScript の構文を解析し、型アノテーションを破棄するサポートを内蔵している。しかし、esbuildは型チェックを行わないので、esbuildと並行してtsc -noEmitを実行して型チェックを行う必要がある。これはesbuild自身が行うことではない。

> 単一のモジュールをトランスパイルする場合でも、TypeScriptコンパイラはインポートされたファイルを解析するため、インポートされた名前が型なのか値なのかを判別することができます。しかし、esbuildやBabelのようなツール(およびTypeScriptコンパイラのtranspileModule API)は各ファイルを個別にコンパイルするため、インポートされた名前が型なのか値なのかを判別できない。

> このため、esbuildでTypeScriptを使用する場合はisolatedModules TypeScript設定オプションを有効にする必要がある。このオプションは、esbuildのようにファイル間の型参照をトレースせずに各ファイルが独立してコンパイルされる環境で、誤コンパイルを引き起こす可能性のある機能を使用しないようにする。例えば、'./types'からexport {T}を使用して別のモジュールから型を再エクスポートすることを防ぎます(代わりに'./types'からexport type {T}を使用する必要があります)。

> バンドル中、esbuildのパス解決アルゴリズムは、tsconfig.jsonファイルを含む最も近い親ディレクトリのtsconfig.jsonファイルの内容を考慮し、それに応じて動作を変更します。また、esbuild の tsconfig 設定を使用してビルド API で tsconfig.json のパスを明示的に設定したり、esbuild の tsconfigRaw 設定を使用して変換 API で tsconfig.json ファイルの内容を明示的に渡すことも可能です。ただし、現在のところ、esbuild は tsconfig.json ファイルの以下のフィールドしか検査しません：

> 省略


ということで、

esbuildは各ファイルを個別にコンパイルする仕様により、インポートされた名前が方なのか値なのか判別できない。

というのはこういうことか。

```TypeScript
// esbuildは以下を区別できない
import type { File } from '../files';
import { File } from '../File';
```

なのでtsconfig.jsonで予め`isolatedModules: true`を設定しておく。

#### TypeScript `isolatedModels`

https://www.typescriptlang.org/tsconfig#isolatedModules

> esbuildのようにファイル間の型参照をトレースせずに各ファイルが独立してコンパイルされる環境で、誤コンパイルを引き起こす可能性のある機能を使用しないようにする。

`tsconfig.json`で設定できる設定である。



