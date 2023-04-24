# Make monaco-editor a React Component

## 参考

https://github.com/suren-atoyan/monaco-react

https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf

https://github.com/satya164/monaco-editor-boilerplate

webworker + React:



## React化するにあたって

monaco-editor標準機能の`monaco.editor.onDidChange()`などのイベントリスは使わない

Reactの機能と衝突する可能性があるため。

基本的にuseEffect()とuseRef()とインスタンス変数保持で対応する

#### ReactとuseEffect()しか使わないコンポーネントの連携

https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf/Using the editor as a React Component

propsの更新があったときにエディタのコンテンツも更新する必要がある

#### webworkerとreactコンポーネントの連携

結論：webworkerのonmessageはuseEffect()等の機能と関係なく独立している

まぁ当たりまえなんですが。

```TypeScript
// a component that works with webworker
	// const refEditor = useRef<monaco.editor.IStandaloneCodeEditor>();
	const ESLintWorker = useMemo(() => new Worker(new URL('../../../worker/eslint.worker.ts', import.meta.url)), []);
	const SyntaxHighlightWorker = useMemo(() => new Worker(new URL('../../../worker/jsx-highlight.worker.ts', import.meta.url)), []);

	// Initialize and clean up workers.
	// 
	// NOTE: useEffect()はMonacoEditor.OnBeforeMount, MonacoEditor.OnMountよりも先に実行される
	useEffect(() => {
		// DEBUG:
		console.log("[CodeEditor] Component did mount.");

		if(window.Worker) {

			ESLintWorker.postMessage({
				signal: "First message to ESLintWorker",
				error: ""
			});
			SyntaxHighlightWorker.postMessage({
				signal: "First message to ESLintWorker",
				error: ""
			});

			ESLintWorker.onmessage = (e: MessageEvent<iMessage>) => {
				const { signal, error } = e.data;
				if(error.length) {
					console.error(error);
				}
				console.log(signal);
			};
			SyntaxHighlightWorker.onmessage = (e: MessageEvent<iMessage>) => {
				const { signal, error } = e.data;
				if(error.length) {
					console.error(error);
				}
				console.log(signal);
			};

			return () => {
				// DEBUG:
				console.log("[CodeEditor] unmount.");
				// clean up code
				ESLintWorker.terminate();
				SyntaxHighlightWorker.terminate();
			}
		}
	}, []);

	// worker message receiver
	// 
	// NOTE: useEffect()はMonacoEditor.OnBeforeMount, MonacoEditor.OnMountよりも先に実行される
	useEffect(() => {
		console.log("[CodeEditor] useEffect():");
		// if(window.Worker) {
			
		// 	ESLintWorker.onmessage = (e: MessageEvent<iMessage>) => {
		// 		const { signal, error } = e.data;
		// 		if(error.length) {
		// 			console.error(error);
		// 		}
		// 		console.log(signal);
		// 	};
		// 	SyntaxHighlightWorker.onmessage = (e: MessageEvent<iMessage>) => {
		// 		const { signal, error } = e.data;
		// 		if(error.length) {
		// 			console.error(error);
		// 		}
		// 		console.log(signal);
		// 	};
		// }
	}, [ESLintWorker, SyntaxHighlightWorker]);
```

上記の通り、

- `useEffect([webworker])`としてもこのuseEffect()は機能しない。そのため`useEffect([webworker])`の中身の定義は意味がない。
- `worker.onmessega`はReactコンポーネントのリレンダリングに関連しないためコンポーネントの更新を起こさない
- `worker.onmessega`はReactコンポーネントのリレンダリングに関連しないためリアクトのメカニズムと関係せずメッセージを取得する


ということでメッセージを受信するタイミングは（Reactのメカニズムとシンクロするようにという意味では）制御できない。

メッセージを送信するタイミングとしてなら使えるかも。

conclusion:

- webworkerのonmessageは初めのuseEffect()(conponentDidMount()タイミング)で設定すればよい
- webworkerが関連する値が変更されたら、そのレンダリング後にpostMessage()すればよい。

参考：

https://github.com/satya164/monaco-editor-boilerplate/blob/master/src/Editor.js

eslintするワーカとの連携は

componentDidMount時にworkerのインスタンス化をして、そのタイミングで`messega`イベントリスナを登録し、リスナはlintコードを反映させる関数を呼び出す

関数はリアクトのメカニズムと関係なくeditorの変更を反映させる

う～んReactとwebworkerの非同期処理の同期はできないのか？しなくていいのか？

たとえばformattingをworkerに任せるとしてformat済のコードをいざコンポーネントの値へ反映させるときに、

Reactのメカニズムを通さないと再レンダリングが発生しなくてREactと衝突することになりそうで怖い。

#### React + webworker同期その１：Custom Hooks

NOTE: ここでいう「同期」とはReactのメカニズムにwebworkerを合わせること。

つまり、自作Hooksを作ろう...ってこと？

参考：

https://react.dev/learn/reusing-logic-with-custom-hooks#there-is-more-than-one-way-to-do-it

https://ja.legacy.reactjs.org/docs/hooks-custom.html

自作のHookをReactに認識させる方法：

- コンポーネントになるのでファイル名は大文字にしなくてはならない
- カスタムHookの名前は`use`から始まり続けて大文字をつなげなくてはならない
- カスタムHookは他のコンポーネントと異なり特定のシグネチャを持つ必要はない

Hooksの扱い：

- カスタム フックを使用すると、ステートフル ロジックを共有できますが、ステート自体は共有できません。フックへの各呼び出しは、同じフックへの他のすべての呼び出しから完全に独立しています。
- リレンダリング時に、カスタムフックの中身は常に再度実行される。これが他のコンポーネント同様、Hookが純粋関数でなくてはならない理由である

いつカスタムフックを使うべき？

- 小さなコードの重複は抽出する必要がない


```TypeScript
import { useEffect, useState, useRef } from 'react';

function useWorker() {

};
```

#### React + webworker連携その2：useReducer

参考：

https://react.dev/reference/react/useReducer

https://ja.legacy.reactjs.org/docs/hooks-reference.html#usereducer

`useState`の代替品。

> (state, action) => newState という型のリデューサ (reducer) を受け取り、現在の state を dispatch メソッドとペアにして返します（もし Redux に馴染みがあれば、これがどう動作するのかはご存じでしょう）。

たとえば...

editorコンポーネントでユーザがコードを変更した

editorコンポーネントの値が更新されたのでdispatchされる

dispatchされたactionを受け取った関数はコードをwebworkerへ送信する



#### React + webworker連携：参考情報

https://github.com/dai-shi/react-hooks-worker

https://blog.logrocket.com/react-usereducer-hooks-web-workers/

useReducer-like reduer works in worker:

https://github.com/surma/use-workerized-reducer

## 実装：ESLint

#### 参考repoのlintの適用手順の分析

NOTE: TypeScriptのLintがデフォで導入されているのでそもそも任意である。
う～ん今のところ必要性を感じないので後回しかなぁ

それでも導入する場合：

- デフォルト設定の無効化
- `editor.setModelMarkers`を使ってmodelへmarkerを適用する
- eslint webworkerへ現在のエディタの値をわたしてlintのmarkerを作ってもらう
- workerから返事が来たらこれらを`editor.setModelMarkers`で適用させる
TODO:
- markerはどういうオブジェクトでなくてはならないのか
- eslintはブラウザをサポートしないので


## 実装：JSX Syntax Highlight

## 実装：formatting by prettier

デフォルトでformattingの設定関数は備わっている

`languages.registerDocumentFormattingEditProvider()`

講義で設定していたprettierの設定を導入できるようにする

@monaco-editor/reactではformatの機能は実装なし。

参考repoの方では一度だけ呼び出していた。

講義の方ではmonaco-editorの機能なしで自前で強制的にフォーマットしていた

参考repoの方法を採用してみる。

#### `languages.registerDocumentFormattingEditProvider()`

https://microsoft.github.io/monaco-editor/docs.html#functions/languages.registerDocumentFormattingEditProvider.html

> Register a formatter that can handle only entire models.

```TypeScript
/**
 * Register a formatter that can handle only entire models.
 */
export function registerDocumentFormattingEditProvider(
	// `javascript`や`typescript`などの言語
	languageSelector: LanguageSelector, 
	// 
	provider: DocumentFormattingEditProvider
): IDisposable;

/**
 * The document formatting provider interface defines the contract between extensions and
 * the formatting-feature.
 */
export interface DocumentFormattingEditProvider {
	readonly displayName?: string;
	/**
	 * Provide formatting edits for a whole document.
	 */
	provideDocumentFormattingEdits(model: editor.ITextModel, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]>;
};

/**
 * Interface used to format a model
 */
export interface FormattingOptions {
	/**
	 * Size of a tab in spaces.
	 */
	tabSize: number;
	/**
	 * Prefer spaces over tabs.
	 */
	insertSpaces: boolean;
	/**
	 * The list of multiple ranges to format at once, if the provider supports it.
	 */
	ranges?: Range[];
}

export interface CancellationToken {
    /**
     * A flag signalling is cancellation has been requested.
     */
    readonly isCancellationRequested: boolean;
    /**
     * An event which fires when cancellation is requested. This event
     * only ever fires `once` as cancellation can only happen once. Listeners
     * that are registered after cancellation will be called (next event loop run),
     * but also only once.
     *
     * @event
     */
    readonly onCancellationRequested: (listener: (e: any) => any, thisArgs?: any, disposables?: IDisposable[]) => IDisposable;
}

/**
 * A provider result represents the values a provider, like the {@link HoverProvider},
 * may return. For once this is the actual result type `T`, like `Hover`, or a thenable that resolves
 * to that type `T`. In addition, `null` and `undefined` can be returned - either directly or from a
 * thenable.
 */
export type ProviderResult<T> = T | undefined | null | Thenable<T | undefined | null>;

```

#### 実装してみる

[beforemount](#beforemount)より、

@monaco-editor/react同様、親コンポーネントで実行する内容を定義する。

beforeMount()はmonacoAPIインスタンスを引数に取る


```TypeScript
// @親コンポーネント
import prettier from 'prettier'

const beforeMount: /* TODO: define type*/.beforeMount = (
	m: monaco
) => {
	// Apply format setting
	monaco.language.registerDocument.FormattingEditProvider(
		"javascript",　
		{
			async provideDocumentFormattingEdits(model) {
				const formatted = prettier.format(
					model.getValue(), 
					{
						parser: 'babel',
						plugins: [parser],
						useTabs: false,
						semi: true,
						singleQuote: true,
					})
					.replace(/\n$/, '');

				return [{
					range: model.getFullModelRange(),
					formatted,
				}];
			}
		}
	);

	// TODO: 他に、インスタンス生成前に設定すべきものはここで。
	// eslintを使うならデフォルトのlintの無効化とか
}
```

## 参考repoのwebworkerとreactの連携のさせ方

ESLint機能：

componentDidMount():
    webworkerの生成
    webworkerのmessageイベントリスナの登録
    monaco.editor.create

componentDidUpdate():
    このコンポーネントが受け取ったpropsの展開
    _openFile()の呼び出し


_openFile():
    _initializeFile()
    (restore the editor state for the file)
    this._subscription = this._editor.getModel().onDidChangeContent()
        this.props.onValueChange(value);    #親コンポーネントへeditorの値を渡す
        this._lintCode(value)               #workerへlint依頼

つまり、

componentDidMount()とcomponentDidUpdate()の両方で、親コンポーネントから引き継いだthis.props.onValueChange(value)を呼び出すことによって、

親コンポーネントに変更を伝え、それによってReactを再レンダリングさせるきっかけを与えている

疑問・わからんところ：

- `monaco.editor.getModel().onDidChangeContent()`は何を返すのか


## @monaco-editor/reactの分析

https://github.com/suren-atoyan/monaco-react

これまたReact + monaco-editorをどうやって実現しているのかの参考に。

```TypeScript
import type * as monaco from '@monaco-editor';
import MonacoEditor from '@monaco-editor';

const Editor = () => {
	return (
		<MonacoEditor 
			// ...
			onWillMount={}
			onDidMount={}
			onChange={}
			onValidate={}
		/>
	)
}
```

- `monaco.OnChange`, `monaco.OnValidate`は内部的にuseEffect()を使って要る模様
- editorインスタンスやsubscription変数はuseRefで保持している模様

#### OnChange

```TypeScript

  const subscriptionRef = useRef<IDisposable>();
  // onChange
  useEffect(() => {
	// editorは展開済である && propからonChaneを取得してあるなら
    if (isEditorReady && onChange) {
		// IDisposable型のサブスクリプションをいったん閉じて
      subscriptionRef.current?.dispose();
		// 改めてサブスクリプションをつけなおし
      subscriptionRef.current = editorRef.current?.onDidChangeModelContent((event) => {
        if (!preventTriggerChangeEvent.current) {
			// onChangeの実装を実行する
          onChange(editorRef.current!.getValue(), event);
        }
      });
    }
  }, [isEditorReady, onChange]);
```

- subscriptionはonChangeのためにしか使わない代物の模様
- やっぱり「一旦subscription.dispose()してから改めつけなおす」のは参考repoと同じ
- `monaco.editor.onDidChangeModenlContent`を使っているのも参考repoと同じ

#### custom Hooks: useUpdate()

内部的にuseEffect()を呼び出すカスタムフックが定義されていた。

これでReactと連携しているのかも。

updateしている対象は

value, language, line, themeなど、monaco.editor.IStandaloneCodeEditorのオプションである。

valueの更新方法はよく分析しておかないといかん化も。

```TypeScript
import { useEffect, useRef, type DependencyList, type EffectCallback } from 'react';

function useUpdate(effect: EffectCallback, deps: DependencyList, applyChanges = true) {
  const isInitialMount = useRef(true);

  useEffect(
    isInitialMount.current || !applyChanges
      ? () => {
          isInitialMount.current = false;
        }
      : effect,
    deps,
  );
}

export default useUpdate;
```

#### useRef保持 vs. 変数保持

保持したいもの：

editorコンポーネントのdivDOM
editorインスタンス
subscription
etc...

useRefはレンダリングをまたいで値を保持してくれる機能で、

コンポーネントは再レンダリング時に再度実行されるので純粋関数でなくてはならない

という2つの条件を鑑みるとつかうべきかと。


#### beforeMount

- useCallback()を使ったeditorインスタンスの生成
- そのuseCallback()のコールバックの中でbeforeMount

propでbeforeMount関数を受け取って

`const beforeMountRef = useRef(beforeMount)`して

`beforeMountRef.current(monacoRef.current)`していた

@monaco-editor/reactでは

```TypeScript
type BeforeMount = (monaco: Monaco) => void;
```

と関単に定義されているだけだったが、

要はmonacoインスタンスを引き取る関数を親関数が定義出来て、

その関数をuseCallback()の戻り値の関数が実行されるときに実行されるから

editorが生成される前に定義できるのである。

ということで、

TODO: editorを生成するのは任意のタイミングで行えるように修正が必要


#### React useCallback

https://react.dev/reference/react/useCallback

https://ja.legacy.reactjs.org/docs/hooks-reference.html#usecallback

> `useCallback`は再レンダリング間で関数をキャッシュしておいてくれるReact Hooksである

useMemoの戻り値は値で、useCallbackは戻り値が関数という違い。

```TypeScript
const cachedFunc = useCallback(() => {}, [...depencies])
```

Parameters:

- fn:

useMemo()と似て、初回マウント時に渡された「関数を返す」。次回レンダリング以降は依存関係が変わっていなければ同じ関数を返す。Reactは関数を呼出すわけではないので注意。

NOTE: 関数の実行結果を返すわけではないので注意。

- dependencies:

fnコードの内部で参照されるリアクティブな値である。

Retuns:

最初のレンダリングで、useCallback は渡された fn 関数を返します。

その後のレンダリングでは、（依存関係が変更されていない場合）前回のレンダリングで既に保存されたfn関数を返すか、このレンダリングで渡されたfn関数を返すかのどちらかになります。

#### monaco-editor: `monaco.editor.create()`

```TypeScript
    /**
     * Create a new editor under `domElement`.
     * `domElement` should be empty (not contain other dom nodes).
     * The editor will read the size of `domElement`.
     */
    export function create(domElement: HTMLElement, options?: IStandaloneEditorConstructionOptions, override?: IEditorOverrideServices): IStandaloneCodeEditor;

	    /**
     * The options to create an editor.
     */
    export interface IStandaloneEditorConstructionOptions extends IEditorConstructionOptions, IGlobalEditorOptions {
        /**
         * The initial model associated with this code editor.
         */
        model?: ITextModel | null;
        /**
         * The initial value of the auto created model in the editor.
         * To not automatically create a model, use `model: null`.
         */
        value?: string;
        /**
         * The initial language of the auto created model in the editor.
         * To not automatically create a model, use `model: null`.
         */
        language?: string;
        /**
         * Initial theme to be used for rendering.
         * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light.
         * You can create custom themes via `monaco.editor.defineTheme`.
         * To switch a theme, use `monaco.editor.setTheme`.
         * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
         */
        theme?: string;
        /**
         * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
         * Defaults to true.
         */
        autoDetectHighContrast?: boolean;
        /**
         * An URL to open when Ctrl+H (Windows and Linux) or Cmd+H (OSX) is pressed in
         * the accessibility help dialog in the editor.
         *
         * Defaults to "https://go.microsoft.com/fwlink/?linkid=852450"
         */
        accessibilityHelpUrl?: string;
        /**
         * Container element to use for ARIA messages.
         * Defaults to document.body.
         */
        ariaContainerElement?: HTMLElement;
    }

```

#### 実装してみる

- props.beforeMountはrefで保持
- editorインスタンス関数はuseCallback()で保持
- beforeMountはuseCallback()のコールバック内部で呼び出す

```TypeScript
// ...

const MonacoEditor = ({
    onValueChange, 
    onValidate,
    beforeMount,
    ...options
}: iParamsMonacoEditor) => {
    const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
    const _editor = useRef<editor.IStandaloneCodeEditor | null>(null);
    const _subscription = useRef<IDisposable>();
    const _refEditorContainer = useRef<HTMLDivElement>(null);
    const _beforeMount = useRef(beforeMount);
    const esLinteWorker = useMemo(() => new Worker(new URL('../workers/ESLint.worker.ts')), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('../workers/jsxHighlight.worker.ts')), []);

    /**
     * 
     * - Create editor and pass instance to _editor.current
     * - Run beforeMount.current() before editor generated
     * */ 
    const _createEditor = useCallback(() => {
        if(!_refEditorContainer.current) return;

        // Run beforeMount() before create editor instance
        if(_beforeMount.current) _beforeMount.current(monaco);

        _editor.current = monaco.editor.create(
            _refEditorContainer.current, 
            options
            // overrideSerivces
        );

        setIsEditorReady(true);
    }, [
        // TODO: 何を依存関係にすべきかはさっぱり。動かしてみてから決めるべき
        // editorインスタンスの生成にかかわるオプションなどは含めるべきかと
        options,
    ]);
    

    /**
     * Generate editor and pass it ref.
     * */ 
    useEffect(() => {
        !isEditorReady && _createEditor();
    }, [isEditorReady, _createEditor]);

	// ...

    return (
        <div className="" ref={_refEditorContainer}></div>
    );
};
```

ということで、editorインスタンスを生成する前に必要な設定は

親コンポーネントでbeforeMountの関数を実装してpropsとして渡すこと


#### markers

`monaco.editor.onDidChangeMarkers`: モデルのマーカーが変更されたときに発生します。

https://microsoft.github.io/monaco-editor/docs.html#functions/editor.onDidChangeMarkers.html

- `monaco.editor.getModelMarkers`: 所有者やリソースのマーカーを取得する


## JavaScript Tips

#### `variable && foo()`?

https://dev.to/winstonpuckett/js-variable-function-37o7

https://stackoverflow.com/questions/6970346/what-is-x-foo

ポイントは

`変数 && 関数呼び出し`ということ。

`変数 && 関数名`ではないので注意。その場合只の変数同士の比較である。

意味は

```JavaScript
myVariable && myFunction();

// Which is equivalent to:

if (myVariable) {
    myFunction()
}
```

つまり、

&&は実際は左の比較対象（変数）の方しか真偽値を検査しない。

変数が真なら関数を実行して、偽なら実行しない

という意味の処理のショートカットである。

## バグ

#### [解決済] webpackがworkerの相対パスを正しく認識してくれない問題

普通にpathに含めていたファイル名を間違えていた。修正したら治った。

```bash
ERROR in ./src/components/Editor2.tsx 51:11-75
Module not found: Error: Can't resolve './jsxHighlight.worker.js' in '/home/teddy/playground/webpack/src/components'
Did you miss the leading dot in 'resolve.extensions'? Did you mean '[".*",".js",".jsx",".tsx",".ts"]' instead of '["*",".js",".jsx",".tsx",".ts"]'?
resolve './jsxHighlight.worker.js' in '/home/teddy/playground/webpack/src/components'
  using description file: /home/teddy/playground/webpack/package.json (relative path: ./src/components)
    Field 'browser' doesn't contain a valid alias configuration
    using description file: /home/teddy/playground/webpack/package.json (relative path: ./src/components/jsxHighlight.worker.js)
      no extension
```
誤: `jsxHighlight.worker.js`

正： `JSXHighlight.worker.js`

publicPathを設定したりとかはする必要なし。


#### undefinedにdispose()なんてメソッドないよのエラー

```bash
index.js:485 [webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
log.js:24 [HMR] Waiting for update signal from WDS...
react-dom.development.js:29840 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
reportWebVitals.ts:6 [reportWebVitals]
Editor2.tsx:95 [CodeEditor] Generate editor:
Editor2.tsx:58 [CodeEditor] _createEditor:
Editor2.tsx:107 [CodeEditor] component did mount:
Editor2.tsx:132 [CodeEditor] onChange useEffect:
Editor2.tsx:159 [CodeEditor] _cleanup()
react-dom.development.js:22839 Uncaught TypeError: Cannot read properties of undefined (reading 'dispose')
    at _cleanUp (Editor2.tsx:162:32)
    at Editor2.tsx:121:13
    at safelyCallDestroy (react-dom.development.js:22932:1)
    at commitHookEffectListUnmount (react-dom.development.js:23100:1)
    at invokePassiveEffectUnmountInDEV (react-dom.development.js:25207:1)
    at invokeEffectsInDev (react-dom.development.js:27351:1)
    at commitDoubleInvokeEffectsInDEV (react-dom.development.js:27324:1)
    at flushPassiveEffectsImpl (react-dom.development.js:27056:1)
    at flushPassiveEffects (react-dom.development.js:26984:1)
    at react-dom.development.js:26769:1
Editor2.tsx:95 [CodeEditor] Generate editor:
Editor2.tsx:58 [CodeEditor] _createEditor:
Editor2.tsx:107 [CodeEditor] component did mount:
Editor2.tsx:132 [CodeEditor] onChange useEffect:
react-dom.development.js:18687 The above error occurred in the <MonacoEditor> component:

    at MonacoEditor (http://localhost:8080/index.bundle.js:622:26)
    at div
    at App

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18687
react-dom.development.js:12056 Uncaught TypeError: Cannot read properties of undefined (reading 'dispose')
    at _cleanUp (Editor2.tsx:162:32)
    at Editor2.tsx:121:13
    at safelyCallDestroy (react-dom.development.js:22932:1)
    at commitHookEffectListUnmount (react-dom.development.js:23100:1)
    at invokePassiveEffectUnmountInDEV (react-dom.development.js:25207:1)
    at invokeEffectsInDev (react-dom.development.js:27351:1)
    at commitDoubleInvokeEffectsInDEV (react-dom.development.js:27324:1)
    at flushPassiveEffectsImpl (react-dom.development.js:27056:1)
    at flushPassiveEffects (react-dom.development.js:26984:1)
    at react-dom.development.js:26769:1
Editor2.tsx:159 [CodeEditor] _cleanup()
react-dom.development.js:22839 Uncaught TypeError: Cannot read properties of undefined (reading 'dispose')
    at _cleanUp (Editor2.tsx:162:32)
    at Editor2.tsx:121:13
    at safelyCallDestroy (react-dom.development.js:22932:1)
    at commitHookEffectListUnmount (react-dom.development.js:23100:1)
    at commitPassiveUnmountInsideDeletedTreeOnFiber (react-dom.development.js:25098:1)
    at commitPassiveUnmountEffectsInsideOfDeletedTree_begin (react-dom.development.js:25048:1)
    at commitPassiveUnmountEffects_begin (react-dom.development.js:24956:1)
    at commitPassiveUnmountEffects (react-dom.development.js:24941:1)
    at flushPassiveEffectsImpl (react-dom.development.js:27038:1)
    at flushPassiveEffects (react-dom.development.js:26984:1)
react-dom.development.js:18687 The above error occurred in the <MonacoEditor> component:

    at MonacoEditor (http://localhost:8080/index.bundle.js:622:26)
    at div
    at App

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18687
react-dom.development.js:12056 Uncaught TypeError: Cannot read properties of undefined (reading 'dispose')
    at _cleanUp (Editor2.tsx:162:32)
    at Editor2.tsx:121:13
    at safelyCallDestroy (react-dom.development.js:22932:1)
    at commitHookEffectListUnmount (react-dom.development.js:23100:1)
    at commitPassiveUnmountInsideDeletedTreeOnFiber (react-dom.development.js:25098:1)
    at commitPassiveUnmountEffectsInsideOfDeletedTree_begin (react-dom.development.js:25048:1)
    at commitPassiveUnmountEffects_begin (react-dom.development.js:24956:1)
    at commitPassiveUnmountEffects (react-dom.development.js:24941:1)
    at flushPassiveEffectsImpl (react-dom.development.js:27038:1)
    at flushPassiveEffects (react-dom.development.js:26984:1)
DevTools failed to load source map: Could not load content for chrome-extension://cfhdojbkjhnklbpkdaibdccddilifddb/browser-polyfill.js.map: System error: net::ERR_FILE_NOT_FOUND
```
どうやら`_cleanUp()`での_editorと_subscriptionがundefinedであるようだ

