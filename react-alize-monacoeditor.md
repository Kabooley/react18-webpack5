# Make monaco-editor a React Component

## 参考

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

## 実装：


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

#### useRef

参照しているもの

editorコンポーネントのdivDOM
editorインスタンス
subscription

などなど

こちらでも同様にuseRefは使うかというと。。。

useRefはレンダリングをまたいで値を保持してくれる機能で、

コンポーネントは再レンダリング時に再度実行されるので純粋関数でなくてはならない

という2つの条件を鑑みるとつかうべきか。


## monaco-editor

#### `onDidChangeContent()`

https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.ITextModel.html#onDidChangeContent

modelの中身が変更されたときに実行されるリスナを登録することができる