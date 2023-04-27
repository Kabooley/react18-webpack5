# Note all about React.useEffect

https://react.dev/reference/react/useEffect

https://react.dev/learn/you-might-not-need-an-effect

https://react.dev/learn/synchronizing-with-effects

https://react.dev/learn/lifecycle-of-reactive-effects

https://react.dev/learn/removing-effect-dependencies

## Prerequisities

- Reactは毎レンダリング時にコンポーネントを再度実行する

    そのため、コンポーネント内部で定義した変数や関数は毎レンダリング時に新しくなる。

## React Documentation: useEffect

https://react.dev/reference/react/useEffect

Caveats:

- React外部のシステムと同期をとる処理をしないならuseEffect()はそのコンポーネントに必要ないかもしれない

useEffect()はReactの外に出る機能なので、外部の機能と連携することがないならuseEffectは必要ないかも。

- strict modeが有効な時は、**Reactは、最初の実際のセットアップの前に、追加の開発のみのセットアップとクリーンアップサイクルを1回実行します。**

これは、クリーンアップ ロジックがセットアップ ロジックを "ミラーリング" し、セットアップが行っていることをすべて停止または元に戻すことを確認するストレス テストです。これが問題になる場合は、クリーンアップ機能を実装してください。

- useEffectの依存関係に、コンポーネント内部で定義した変数や関数を含めることは、本来よりも余計な再レンダリングを引き起こすリスクがある。

Usage:

**Reactは必要であれば何度もuseEffect()のsetup関数とcleanup関数を呼び出します。**

mount時：

- strict modeの時、ReactはuseEffectのsetupコードとcleanupコードを実行し、その後setupコードをもう一度実行する。どちらも依存関係の値は同じ値を使う。

毎レンダリング時:

依存関係が前回と変更されてあれば...

- **まず古いpropsとstateを基にcleanupコードが実行される**
- それからsetupコードが新しいpropsとstateを基に実行される

unmount時：

コンポーネントが取り除かれるときにcleanupコードが実行される

```JavaScript
import { useEffect } from 'react';
import { createConnection } from './chat.js';

function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    // 3. その後setupコードが新しいpropsとstateを基に実行される
  	const connection = createConnection(serverUrl, roomId);
    connection.connect();
  	return () => {
        // 2. まず前回のpropsとstateの値を基にcleanupコードが実行されて、
      connection.disconnect();
  	};
    // 1. 依存関係があるなら、毎レンダリング後に...
  }, [serverUrl, roomId]);


  // 毎レンダリング後に実行されるuseEffect
  useEffect(() => {
    // ...
  });       // no dependency array: re-runs this useEffect every render.
  // ...
}
```

Note:Reactの外部のシステムの意味

web APIやReactで書かれていないサードパーティライブラリなどのこと。

A timer managed with setInterval() and clearInterval().
An event subscription using window.addEventListener() and window.removeEventListener().
A third-party animation library with an API like animation.start() and animation.reset().
If you’re not connecting to any external system, you probably don’t need an Effect.


#### Controlling a non-React widget

https://react.dev/reference/react/useEffect#controlling-a-non-react-widget

React外部のウィジェットとコンポーネントのpropsとstateを同期させたいとき。

たとえばそのwidgetがReactで書かれていないものだった時、

useEffect()を使ってそのウィジェットのメソッドを呼び出して同期させることが出来る。

NOTE: ここのことはまさにmonaco-editorをReactコンポーネント化させる現状に耳寄りな話だったけど参考にならなかった

#### Specifying reactive dependencies

**貴方はEffectの依存関係を選ぶことはできない**

useEffectのなかで参照する`Reactive Value`はすべて依存関係に含めなくてはならない。

NOTE: `Reactive Value`とは、コンポーネント内で直接宣言された props とすべての変数と関数が含まれます。

それ以外の変数はuseEffect()の依存関係に含める必要がないから、

そうした変数は依存関係から取り除くことができる。


#### Updating state based on previous state from an Effect 

https://react.dev/reference/react/useEffect#updating-state-based-on-previous-state-from-an-effect

useEffect()のなかから参照するので依存関係に含めたいけど、

依存関係に含めると毎回クリーンアップコードを実行させたくないとき。

その依存関係を含めないように工夫する必要がある。

#### Removing unnecessary object dependencies

https://react.dev/reference/react/useEffect#removing-unnecessary-object-dependencies

Reactは再レンダリング時に毎回コンポーネント全体を再度実行させる。

そのためたとえば、

コンポーネントでオブジェクト変数を定義すると、

その変数は毎レンダリング時に新たに生成されることになる。

https://react.dev/learn/removing-effect-dependencies#does-some-reactive-value-change-unintentionally

そうした変数をuseEffectの依存関係に含めると毎レンダリング時に必ず実行されることになるのでこれは回避すべき。

依存関係に含めていたその変数はuseEffect()内部で定義するべき。

#### Removing unnecessary function dependencies

https://react.dev/reference/react/useEffect#removing-unnecessary-function-dependencies

先の話と同じで、関数の場合。

useEffect()の依存関係に含めないならば毎レンダリングによる関数の再生成は問題ないはず。

解決方法は先と同じでuseEffect()内部でその関数を定義すること。

他、依存関係を減らす話はこちらを参照のこと：

https://react.dev/learn/removing-effect-dependencies

#### trouble shooting

My cleanup logic runs even though my component didn’t unmount:

> クリーンアップ機能は、アンマウント中だけでなく、依存関係が変更されたすべての再レンダリングの前にも実行されます。さらに、開発中、React はコンポーネントのマウント直後に setup+cleanup をもう 1 回実行します。

依存関係が空のuseEffect()のクリーンアップコードならばコンポーネントのアウンマウント時にのみそのクリーンアップコードが実行されるよ。

## Synchronizing with Effects

https://react.dev/learn/synchronizing-with-effects

Effects are different from events.

話の前提：

- Rendering Code must be pure.
- イベントハンドラは、副作用を含む場合もある、コンポーネントにネストされた関数

副作用とはレンダリング後に引き起こされる貴方が定義することができる影響のことで、特定のイベントによって引き起こされるものではない。

#### Why the ref omitted from the dependency array?

refの値をuseEffectのなかで参照しているのに、なぜrefの値はuseEffectの依存関係に含めなくていいのですか？

useEffectの依存関係にはreactive valueを含めなくてはならないはず。

> `Reactive Value`とは、コンポーネント内で直接宣言された props とすべての変数と関数が含まれます。

公式によると、

useRefは再レンダリングにまたがって値を保持し続ける機能のため再レンダリング時に変更される値ではないからである。

refを依存関係に含めるような場合は、

> たとえば、ref が親コンポーネントから渡された場合、依存配列で指定する必要があります。それは、親コンポーネントが常に同じ ref を渡すのか、複数の ref のいずれかを条件付きで渡すのかがわからないため、これは良いことです。

## Lifecycle of Reactive Effects

https://react.dev/learn/lifecycle-of-reactive-effects

基本：

useEffect()を含むコンポーネントが...

mountされたら：useEffect()は実行される。strictモードなら、まずsetupコード、cleanupコードを行ってから改めてsetupコードを実行する。

毎レンダリング後：依存関係が前回の値と変更されていたらそのuseEffectは実行される

そのときそのuseEffectがcleanupコードを含んでいた場合、

前回のpropsとstateの値を基にcleanupコードを実行し

最新のpropsとstateの値を基にsetupコードが実行される

unmountされたら：useEffect()にcleanupコードがあればそれが実行される。

#### How React knows that it needs to re-synchronize the Effect

https://react.dev/learn/lifecycle-of-reactive-effects#how-react-knows-that-it-needs-to-re-synchronize-the-effect

useEffect()の依存関係に含めることで、

(依存関係が変更されたら)そのEffectを実行しなくてはならないとReactに伝えることができる。

#### All variables declared in the component body are reactive

https://react.dev/learn/lifecycle-of-reactive-effects#all-variables-declared-in-the-component-body-are-reactive

propsとstateだけがReactive valueではない。

具体的にReactive Valueとは？

毎レンダリング時にpropsやstateから再計算される値もReactive Valueである。

> コンポーネント内のすべての値 (コンポーネント本体の props、state、および変数を含む) はリアクティブです。リアクティブ値は再レンダリング時に変更される可能性があるため、エフェクトの依存関係としてリアクティブ値を含める必要があります。

globalや変更可能な値は依存関係になるのか？

https://react.dev/learn/lifecycle-of-reactive-effects#can-global-or-mutable-values-be-dependencies

変更可能な値は依存関係にならない。

**`ref.current`のような変更可能な値は通常依存関係にならない。**

useRefが返すインスタンス自体は依存関係になりうるけど、

useRef.currentは意図的に変更可能なので依存関係にならない。


#### 開発モード中だとeffectは二度実行される

https://react.dev/reference/react/useEffect#connecting-to-an-external-system

https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development

> To help you bugs, in development React runs setup and cleanup code one extra time before the setup. This is stress-test that verifies your effect's logic is implemented correctly.

ということで、

strict modeが有効な時は、**Reactは、最初の実際のセットアップの前に、追加の開発のみのセットアップとクリーンアップサイクルを1回実行します。**

2度実行することをやめさせるようにするのではなく、cleanupコードを実装することがすべきことと心得よとのこと

この2度実行で何かしら問題が起こる場合、cleanupコードに問題がある。

cleanupコードのパターン：

- ストレステストの時と本来の実行時に使われる依存関係の値は同じである
- 何か外部からデータをfetchするならクリーンアップコードでfetchを実行するかしないかの条件分岐変数を変更するべき

