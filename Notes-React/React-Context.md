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


> コンテキストを提供するコンポーネントとそれを使用するコンポーネントの間に、好きなだけコンポーネントを挿入できます。これには、<div> などの組み込みコンポーネントと自分で構築するコンポーネントの両方が含まれます。

#### Before you use context

深いネストのコンポーネントにプロパティを渡したいからという理由だけでcontextを使うべきではない。

contextを使う前に考慮すること:

- これまで通りpropsを渡すことをためらわない。
- `children`としてJSXを渡すようにすると、`<Layout posts={posts} />`とするかわりに`<Layout><Posts posts={posts} /></Layout>`というように、直接propsを使用しないコンポーネントにpropsを渡す処理を減らすことができる。

どちらにも当てはまらないならcontextを使うことを考慮しよう。

#### Use cases for context

- Theming: 省略
- Current Account: 省略
- Routing: 省略
- Managing State:

> ステートの管理： アプリが成長するにつれて、アプリの最上位に近いところに多くのステートを持つことになるかもしれない。下にある多くの離れたコンポーネントは、それを変更したいと思うかもしれない。複雑な状態を管理し、あまり手間をかけずに遠くのコンポーネントにそれを渡すために、コンテキストと一緒にリデューサーを使うのが一般的です。

# Scaling up with Reducer and context

https://react.dev/learn/scaling-up-with-reducer-and-context

> Reducer を使用すると、コンポーネントの状態更新ロジックを統合できます。コンテキストを使用すると、情報を他のコンポーネントに深く渡すことができます。リデューサーとコンテキストを組み合わせて、複雑な画面の状態を管理できます。

contextとreducerを組み合わせて使うことでもはやReduxを実現できてしまうという方法。

つまり、

contextを使うだけだと親から遠くの子へ好きな値を渡すことはできたけれど、

遠くの子はcontextで扱う値を変更する手段はなかった。

つまり一方通行だったのだが、

この方法を使えば遠くの子がcontextの値（厳密にはReducerで管理するstateの値）を

変更できるようになるのである。

## The case you are now facing...

```JavaScript
// App.js
import { useReducer } from 'react';
import AddTask from './AddTask.js';
import TaskList from './TaskList.js';

export default function TaskApp() {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initialTasks
  );

  function handleAddTask(text) {
    dispatch({
      type: 'added',
      id: nextId++,
      text: text,
    });
  }

  function handleChangeTask(task) {
    dispatch({
      type: 'changed',
      task: task
    });
  }

  function handleDeleteTask(taskId) {
    dispatch({
      type: 'deleted',
      id: taskId
    });
  }

  return (
    <>
      <h1>Day off in Kyoto</h1>
      <AddTask
        onAddTask={handleAddTask}
      />
      <TaskList
        tasks={tasks}
        onChangeTask={handleChangeTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: action.id,
        text: action.text,
        done: false
      }];
    }
    case 'changed': {
      return tasks.map(t => {
        if (t.id === action.task.id) {
          return action.task;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter(t => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

let nextId = 3;
const initialTasks = [
  { id: 0, text: 'Philosopher’s Path', done: true },
  { id: 1, text: 'Visit the temple', done: false },
  { id: 2, text: 'Drink matcha', done: false }
];
```

アプリケーションが大きくなってきて、

子コンポーネントがtaskを必要としたり、

actionをディスパッチする必要が出てきたりする。

そんなとき。

```JavaScript
// child component...
<TaskList
  tasks={tasks}
  onChangeTask={handleChangeTask}
  onDeleteTask={handleDeleteTask}
/>
    // Grand child component...
    <Task
      task={task}
      onChange={onChangeTask}
      onDelete={onDeleteTask}
    />
```

上記のようにバケツリレーしていくのは苦痛である。

`tasks`と`dispatch`関数を`context`へ入れてしまえば解決できる！

## 手順

#### 1. Create the context

```JavaScript
// TaskContext.js
import { createContext } from 'react';

export const TasksContext = createContext(null);
export const TasksDispatchContext = createContext(null);
```

#### 2. Put the state and dispatch into context

```diff
import { TasksContext, TasksDispatchContext } from './TasksContext.js';

export default function TaskApp() {
+  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  // ...
  return (
+    <TasksContext.Provider value={tasks}>
+      <TasksDispatchContext.Provider value={dispatch}>
        ...
+      </TasksDispatchContext.Provider>
+    </TasksContext.Provider>
  );
}
```

今のところpropsとcontextの両方が存在しているが次のステップでpropsを取り除く

#### 3. Use contect anywhere in the tree

イベントハンドラ --> reducerのなかへ
state --> reducerのなかへ
props --> context経由で
stateを変更する手段 --> context経由でdispachから

TODO: 続きを学習すること

## Context in class components

https://react.dev/reference/react/Component#context

https://legacy.reactjs.org/docs/context.html#classcontexttype

https://stackoverflow.com/questions/61498035/react-usecontext-inside-class

> NOTE: この方法は単一のcontextのみに対してサブスクライブできます。

`static contextType`に対してcontextを代入すると、

`this.context`の呼び出しでcontextの提供する値にアクセスできる。

```JavaScript
class Button extends Component {
  static contextType = ThemeContext;

  render() {
    const theme = this.context;
    const className = 'button-' + theme;
    return (
      <button className={className}>
        {this.props.children}
      </button>
    );
  }
}
```
TypeScript例：

参考：https://stackoverflow.com/questions/53575461/react-typescript-context-in-react-component-class

```TypeScript
class MonacoContainer extends React.Component<iProps> {
    static contextType = FilesContext;
    context!: React.ContextType<typeof FilesContext>;
    state = {
        value: "",
        currentFilePath: this.context.find(f => f.getPath() === defaultFilePath) === undefined ? "" : this.context.find(f => f.getPath() === defaultFilePath)!.getPath()
    };
    bundleWorker: Worker | undefined;

    // ...

    render() {
        const files: File[] = this.context;
        return (
            <div className="monaco-container">
                <MonacoEditor 
                    files={files}
                    // ...
                />
                <button onClick={this._onSubmit}>submit</button>
            </div>
        );
    }
};

```