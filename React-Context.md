# How to pass data deeply without "prop-drilling"

https://react.dev/learn/passing-data-deeply-with-context

`context`を使えば離れた子コンポーネントへ直接データを渡すことができる。

手順：

- 1. `context`を作成する（これはそのままコンポーネントとなる）
- 2. データを必要とするコンポーネントで`context`を呼び出す
- 3. データを提供するコンポーネントから`context`を提供する

1. `context`の作成

```JavaScript
import { createContext } from 'react';

export const LevelContext = createContext(1);
```

2. `context`を呼び出す

```JavaScript
// データを必要とするコンポーネント
import { useContext } from 'react';
import { LevelContext } from './LevelContext.js';

// Before:
// export default function Heading({ level, children }) {
//   // ...
// }

// After:
export default function Heading({ children }) {
  const level = useContext(LevelContext);
  // ...
}
```

`useContext`は、`Hading`コンポーネントが`context`を使いたいということをReactへ伝える。

バケツリレーと異なるところは、`Heading`呼び出し側は`level`プロパティを渡さなくてよくなる点。

`Heading`は`level`プロパティをcontextを通じて取得する。


3. `context`を提供する

```JavaScript
// contextを提供するコンポーネント
import { LevelContext } from './LevelContext.js';

export default function Section({ level, children }) {
  return (
    <section className="section">
      <LevelContext.Provider value={level}>
        {children}
      </LevelContext.Provider>
    </section>
  );
}
```

> これはReactにこう伝えます。"この<Section>内のコンポーネントが`LevelContext`を要求したら、この`level`を渡せ"。コンポーネントは、その上のUIツリーで最も近い<LevelContext.Provider>の値を使用します。

結果：

```JavaScript
import Heading from './Heading.js';
import Section from './Section.js';

export default function Page() {
  return (
    <Section level={1}>
      <Heading>Title</Heading>
      <Section level={2}>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section level={3}>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Heading>Sub-heading</Heading>
          <Section level={4}>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
            <Heading>Sub-sub-heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  );
}
```

つまり、

`<Section level={1}>`と指定したら、

`Section`コンポーネントにて`<LevelContext.Provider value={level}>`のvalueへ`1`を渡す。

すると、

`useContext(LevelContext)`を呼び出すコンポーネントが`1`を取得する。

上記の例では1, 2, 3, 4を渡しているが、

その`useContext()`を呼び出したコンポーネントの一番近いコンポーネントへ渡された値を自動で選び取るらしい。

いまいちわからん。

