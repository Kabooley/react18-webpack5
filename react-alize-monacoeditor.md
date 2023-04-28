# Make monaco-editor a React Component

## TODO

- TODO: 情報の整理
- TODO: ノートの整理
- TODO: 処理が重すぎるのか動作が遅い

## 参考

https://github.com/suren-atoyan/monaco-react

https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf

https://github.com/satya164/monaco-editor-boilerplate

webworker + React:

## 目次

- [monaco-editorのReactコンポーネント化にあたって](#monaco-editorのReactコンポーネント化にあたって)
- [機能実装](#機能実装)
- [@monaco-editor/react](#@monaco-editor/react)
- [JavaScript Tips](#JavaScript_Tips)
- [](#)


## monaco-editorのReactコンポーネント化にあたって

React公式はwebworkerと連携する手段を公開していない。手探りで、ハチャメチャな(hackyな)方法をとるしかないかも。

#### Reactコンポーネント基本

純粋関数でなくてはならない。

コンポーネントは再レンダリング時に再度実行される。

再レンダリング間で保持しておかなくてはならない変数や関数は`useRef`や`useMemo`, `useCalback`を使うこと。そうでないと通常の変数は消える可能性あるかも。

#### monaco-editorとReactメカニズムの連携

参考：TODO: @monaco-editor/reactのurl貼り付け

- 親コンポーネントからハンドラ関数をprops経由で取得する
- useRefでハンドラ関数を保持しておく（monaco-editorはReactコンポーネントではないためハンドラ関数を直接渡すことはできないから）
- monaco-editorの`IDispose`型イベントハンドラ関数のコールバックの中で親関数から取得したハンドラ関数を呼び出す
(monaco-editorのハンドラ関数はReactメカニズムと一切関係ないためハンドラ関数が呼び出されてもReactは反応しない)
- ハンドラ関数がその呼び出しによって、親コンポーネント内で何かしら反応させればReactが再レンダリングされる

たとえばハンドラ関数が内部でuseState()の値を変更したら、再レンダリングが発生する

#### webworkerはreactコンポーネントと連携するのか？

結論：webworkerのonmessageはuseEffect()等の機能と関係なく独立している

当然ですが。

そのためwebworkerに任せた処理結果を変数の更新などで反映させたとしても、

Reactは更新を検知して再レンダリングなどを起こさない。

理由はすべてのプロセスがReactのメカニズム外の処理だからである。

そのためReactに認識させる方法を用意しなくてはならない。

以下検証内容。

検証：webworkerを依存関係としたuseEffect()は反応するか。

参考サイトを基に作成してみた。

https://blog.logrocket.com/web-workers-react-typescript/

```TypeScript
// a component that works with webworker

	const ESLintWorker = useMemo(() => new Worker(new URL('../../../worker/eslint.worker.ts', import.meta.url)), []);
	const SyntaxHighlightWorker = useMemo(() => new Worker(new URL('../../../worker/jsx-highlight.worker.ts', import.meta.url)), []);

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

			return () => {
				ESLintWorker.terminate();
				SyntaxHighlightWorker.terminate();
			}
		}
	}, []);

	useEffect(() => {
		console.log("[CodeEditor] useEffect():");
		if(window.Worker) {
			
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
		}
	}, [ESLintWorker, SyntaxHighlightWorker]);
```

結果：

- workerインスタンスを依存関係にしているuseEffect()は永遠に実行されない。理由はuseMemo()で依存関係なしで発行したため生成物はおそらく永遠に変わらないから。
- `worker.onmessega`はReactコンポーネントのリレンダリングに関連しないためコンポーネントの更新を起こさない
- `worker.onmessega`はReactコンポーネントのリレンダリングに関連しないためリアクトのメカニズムから独立している

ということでメッセージを受信するタイミングは（Reactのメカニズムとシンクロするようにという意味では）制御できない。

万が一、useMemo()が再レンダリング時に変更したwebworkerのインスタンスを返したときに、前のインスタンスが消えるからonmessage登録しなおすという保険的な役割なら意味のある処理かも。

#### webworkerをreactコンポーネントと連携させる

参考その１：

https://github.com/satya164/monaco-editor-boilerplate/blob/master/src/Editor.js

- componentDidMount()でESLint workerにmessageイベントリスナを登録する
- リスナには



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

## 機能実装

実装する機能：

- beforeMount
- didMount
- onChange
- onValidate
- formatting
- jsxHighlight
- ESLint

#### 実装：beforeMount

beforeMountがマウント前に一度だけ呼ばれるような仕組みと、

MonacoEditorのマウントが問題なく実行されるように実装する。

`useEffect.md`を参考に。

```TypeScript

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
    // Workers
    const esLinteWorker = useMemo(() => new Worker(new URL('/src/workers/ESLint.worker.ts', import.meta.url)), []);
    const jsxHighlightWorker = useMemo(() => new Worker(new URL('/src/workers/JSXHighlight.worker.ts', import.meta.url)), []);

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
            options
        );

        setIsEditorReady(true);
        _preventBeforeMount.current = true;
    }, [options]);
    
    useEffect(() => {
        
        // DEBUG:
        console.log("[CodeEditor] Generate editor?:" + isEditorReady);

        !isEditorReady && _createEditor();
    }, [isEditorReady, _createEditor]);

    useEffect(() => {
        // DEBUG:
        console.log("[CodeEditor] component did mount:");
        
        if(window.Worker) {
            esLinteWorker.addEventListener('message', (e) => {
                // Invoke updater
            }, false);
            jsxHighlightWorker.addEventListener('message', (e) => {
                // Invoke updater
            }, false);
        }

        return () => {
            _cleanUp();
        }
    }, []);

    useEffect(() => {
        // DEBUG:
        console.log("[CodeEditor] onChange useEffect:");

        if(isEditorReady && onChange !== undefined) {

            // DEBUG:
            console.log("[CodeEditor] reset _subscription");

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

    useEffect(() => {
        if(isEditorReady) {
            // TODO: makerに関しては何をするのか理解
        }

    }, [onValidate, isEditorReady]);

    // DEBUG:
    useEffect(() => {
        console.log("[MonacoEditor] component did update");
    });

    // Clean up code
    const _cleanUp = (): void => {
        // DEBUG:
        console.log("[CodeEditor] _cleanup()");

        if(_editor.current) _editor.current.dispose();
        if(_subscription.current) _subscription.current.dispose();
        esLinteWorker.terminate();
        jsxHighlightWorker.terminate();
    };


    return (
        // ...
    );
};
```

```bash
# -- strict mode --
# 
# そのため、すべてのuseEffectはstress-testのため一度実行される
[webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading enabled, Progress disabled, Overlay enabled.
[HMR] Waiting for update signal from WDS...
[reportWebVitals]
# 
# useEffect([isEditorReady, _createEditor])
[CodeEditor] Generate editor?:false
# _createEditor()
[CodeEditor] _createEditor:
[App] Before Mount:
Module
# useEffect([])
[CodeEditor] component did mount:

[CodeEditor] onChange useEffect:
[MonacoEditor] component did update
[CodeEditor] _cleanup()
# 
# 多分ここまでで開発モード中のuseEffectのstress-testは終了したはず...
# 
[CodeEditor] Generate editor?:false
[CodeEditor] _createEditor:
# 
# しかし、Reactive valueは同じ値で実行されるならここで再度beforeMount()を呼び出さなくてはならないが、呼び出されていない...
# 
[CodeEditor] component did mount:
[CodeEditor] onChange useEffect:
[MonacoEditor] component did update
[webpack-dev-server] Disconnected!
[webpack-dev-server] Trying to reconnect...
[CodeEditor] Generate editor?:true
[CodeEditor] onChange useEffect:
[CodeEditor] reset _subscription
[MonacoEditor] component did update
```
問題：BeforeMountがstress-testの後のuseEffectの実行時に呼び出されていない

理由は_preventBeforeMountはrefで参照している値であるため、Reactive valueでないことからstress-testの前後で違う値でuseEffectのコードが実行されているからである。

これはcleanupコード次第でどうにかなるのか？

#### 実装：didMount

以下の条件の時にOnMountを実行させる

```TypeScript
const _isMounted = useRef<boolean>(false);

/**
 * Mount時にのみ発火させたいので
 * 依存関係は空にしなくてはならない
 * */ 
useEffect(() => {
    // ...
}, []);


useEffect(() => {
    if(!_isMounted.current && isEditorReady && _editor.current) {
        onMount(_editor.current, monaco);
        _isMounted.current = true;
    }
    // refは依存関係に含める必要がない
}, [isEditorReady]);
```

結果：

```bash
reportWebVitals.ts:6 [reportWebVitals]
MonacoEditor.tsx:102 [CodeEditor] Generate editor?:false
MonacoEditor.tsx:103 isEditorReady:false
MonacoEditor.tsx:104 _preventBeforeMount.current:false
MonacoEditor.tsx:61 [CodeEditor] _createEditor:
App.tsx:43 [App] Before Mount:
App.tsx:44 Module
MonacoEditor.tsx:116 [CodeEditor] component did mount:(Not about Monaco-Editor)
MonacoEditor.tsx:156 [CodeEditor] onChange useEffect:
MonacoEditor.tsx:192 [MonacoEditor] component did update
MonacoEditor.tsx:193 isEditorReady:false
MonacoEditor.tsx:194 _preventBeforeMount.current:true
MonacoEditor.tsx:200 [CodeEditor] _cleanup()
#)
# Done stress-test:
# 
# 以下、stress-test終了後のマウント実行
# isEditorReady: false かつ _preventBeforeMount: true
# 
MonacoEditor.tsx:102 [CodeEditor] Generate editor?:false
MonacoEditor.tsx:103 isEditorReady:false
MonacoEditor.tsx:104 _preventBeforeMount.current:true
MonacoEditor.tsx:61 [CodeEditor] _createEditor:
MonacoEditor.tsx:116 [CodeEditor] component did mount:(Not about Monaco-Editor)
# isEditorReady: falseのままなのでonMountは実行されない
MonacoEditor.tsx:156 [CodeEditor] onChange useEffect:
MonacoEditor.tsx:192 [MonacoEditor] component did update
MonacoEditor.tsx:193 isEditorReady:false
MonacoEditor.tsx:194 _preventBeforeMount.current:true
# 
# 以下、マウント実行後にisEditorReady: trueに変更されたため再度実行
# 
MonacoEditor.tsx:102 [CodeEditor] Generate editor?:true
MonacoEditor.tsx:103 isEditorReady:true
MonacoEditor.tsx:104 _preventBeforeMount.current:true
# OnMountは実行されているみたい
MonacoEditor.tsx:141 [MonacoEditor] On Mount
App.tsx:49 [App] Did Mount:
App.tsx:50 StandaloneEditor
App.tsx:51 Module
MonacoEditor.tsx:156 [CodeEditor] onChange useEffect:
MonacoEditor.tsx:161 [CodeEditor] reset _subscription
MonacoEditor.tsx:162 isEditorReady:true
MonacoEditor.tsx:163 _preventBeforeMount.current:true
MonacoEditor.tsx:192 [MonacoEditor] component did update
MonacoEditor.tsx:193 isEditorReady:true
MonacoEditor.tsx:194 _preventBeforeMount.current:true
```


#### 実装：onChange

Reactの再レンダリングメカニズムと連携するためには、

親コンポーネントから取得したハンドラをuseEffect()内で呼び出し、

そのハンドラがReactの再レンダリングのトリガーを引くことである。

ここでは、

MonacoEditorは親コンポーネントから`onChange`という、

内部的に`setValue`を呼び出すハンドラをuseEffect()内部で呼び出す。

```TypeScript
// Editro.tsx

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
    const _beforeMount = useRef(beforeMount);

    /**
     * On Value Change:
     * 
     * Initialize and reset on value change listener to _subscription.
     * */ 
    useEffect(() => {
        // DEBUG:
        console.log("[CodeEditor] onChange useEffect:");

    /**
     * Generate editor and pass it ref. 
     * 
     * Invoke _createEditor() when isEditor returns false.
     * */ 
    useEffect(() => {
            
            // DEBUG:
            console.log("[CodeEditor] Generate editor?:" + isEditorReady);

            !isEditorReady && _createEditor();
        }, [isEditorReady, _createEditor]);


        if(isEditorReady && onChange !== undefined) {
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

    
    // DEBUG:
    useEffect(() => {
        console.log("[MonacoEditor] component did update");
    });

    // ...
};
```

親コンポーネント：

```TypeScript
import React, { useState } from "react";
import * as monaco from 'monaco-editor';
import MonacoEditor from './components/Editor2';
import type { beforeMount, onMount, onChange, onValidate } from "./components/Editor2";

const monacoEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    value: "// First line\nfunction hello() {\n\talert('Hello world!');\n}\n// Last line",
	language: "javascript",

	lineNumbers: "off",
	roundedSelection: false,
	scrollBeyondLastLine: false,
	readOnly: false,
	theme: "vs-dark",
    
};

const App = () => {
    const [value, setValue] = useState<string>("");

    const onChange: onChange = (v) => {
        // DEBUG:
        console.log("[App] onChange:");
        console.log(v);
        setValue(v);
    };

    return (
        <div className="app">
            <MonacoEditor 
                beforeMount={beforeMount}
                onMount={onDidMount}
                onChange={onChange}
                onValidate={onValidate}
                {...monacoEditorOptions}
            />
        </div>
    );
};

```

この状態でエディタを編集すると...

```bash
[CodeEditor] _subscription callback:
21:44:22.546 App.tsx:56 [App] onChange:
21:44:22.547 App.tsx:57 // First line
function hello() {
	alert('Hello world!');
};
// Last line
21:44:22.558 Editor2.tsx:96 [CodeEditor] Generate editor?:true
21:44:22.559 Editor2.tsx:133 [CodeEditor] onChange useEffect:
21:44:22.559 Editor2.tsx:161 [MonacoEditor] component did update
21:44:29.514 Editor2.tsx:139 [CodeEditor] _subscription callback:
21:44:29.515 App.tsx:56 [App] onChange:
21:44:29.515 App.tsx:57 // First line
function hello() {
	alert('Hello world!');
};

// Last line
21:44:29.524 Editor2.tsx:96 [CodeEditor] Generate editor?:true
21:44:29.525 Editor2.tsx:133 [CodeEditor] onChange useEffect:
21:44:29.526 Editor2.tsx:161 [MonacoEditor] component did update
21:44:30.943 Editor2.tsx:139 [CodeEditor] _subscription callback:
21:44:30.944 App.tsx:56 [App] onChange:
21:44:30.944 App.tsx:57 // First line
function hello() {
	alert('Hello world!');
};


// Last line
21:44:30.953 Editor2.tsx:96 [CodeEditor] Generate editor?:true
21:44:30.954 Editor2.tsx:133 [CodeEditor] onChange useEffect:
21:44:30.955 Editor2.tsx:161 [MonacoEditor] component did update
21:44:34.720 Editor2.tsx:139 [CodeEditor] _subscription callback:
21:44:34.721 App.tsx:56 [App] onChange:
21:44:34.725 App.tsx:57 // First line
# ...
```

- _subscription --> onChange --> setValue --> 再レンダリング

の流れが出来上がっているのが確認できる。

ちなみに、親コンポーネントでsetValue()を呼び出さなかった場合、

`[MonacoEditor] component did update`が出力されていなかったので、

再レンダリングが起きていないことので、

setValue()が再レンダリングを引き起こしているのが確認できる。

#### 実装：onValidate

```TypeScript
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

```

#### 実装：ESLint

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

## 実装：format

prettierにする。

デフォルトでformattingの設定関数は備わっている

`languages.registerDocumentFormattingEditProvider()`

講義で設定していたprettierの設定を導入できるようにする

@monaco-editor/reactではformatの機能は実装なし。

参考repoの方では一度だけ呼び出していた。

講義の方ではmonaco-editorの機能なしで自前で強制的にフォーマットしていた

参考repoの方法を採用してみる。

#### 一度登録すれ常にformattingしてくれるってこと？

そこがわからん。

https://stackoverflow.com/questions/73970692/not-working-in-prettier-formatting-using-monaco-editor

無効化を忘れているかも？

TODO: 無効化を試す

#### 実装してみる

monaco react boilerplateでは一度の登録で済んでいるみたい。

講義みたいにuseEffectで毎度呼び出す必要がない（はず）

- `languages.registerDocumentFormattingEditProvider()`はモデルの中身をフォーマッティングしてくれるフォーマッタを登録する。

```TypeScript
// @親コンポーネント
import prettier from 'prettier'

const beforeMount: /* TODO: define type*/.beforeMount = (
	m: monaco
) => {
	// Apply format setting
	monaco.language.registerDocumentFormattingEditProvider(
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

## @monaco-editor/react

分析

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


## webpack

メモ。あとでwebpackのノートに転記すること。

#### `[webpack-dev-server] app hot update`

webpack-dev-serverで開発中、コンソールに上記のようなものが出た。

https://webpack.js.org/guides/hot-module-replacement/

> ホットモジュールリプレイスメント (または HMR) は、webpack が提供する最も便利な機能の 1 つです。これにより、すべての種類のモジュールを実行時に完全に更新することなく更新できます。

> HMRはproductionモードで使ってはならず、開発モードでのみ使われるべきです。

有効化するには：

```JavaScript
devServer: {
		static: './dist',
		hot: true
	},
```
