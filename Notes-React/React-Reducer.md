# Managing State: Extracting state logic into a Reducer

https://react.dev/learn/extracting-state-logic-into-a-reducer

> 多数のイベント ハンドラーにまたがる多数のState更新を含むコンポーネントは、処理が膨大になる可能性があります。このような場合、コンポーネントの外部にあるすべてのState更新ロジックを、リデューサーと呼ばれる 1 つの関数に統合できます。

例えば今、todoアプリを開発しているとして、

追加、編集、削除という各処理がすべて`setState`を呼び出し一つの値を変更するとする。

## Reducerを使ってstateを管理する導入手順

- stateを変更する手段からアクションをディスパッチする方法へ変換する

setStateを呼び出す代わりに、Reduxのようなアクションをディスパッチする方法に変える

そのために

1. setStateからアクション・ディスパッチへ移行

どんな状態になるのかではなく、ユーザが何をしたのかを伝える。

```diff
- function handleAddTask(text) {
-   setTasks([
-     ...tasks,
-     {
-       id: nextId++,
-       text: text,
-       done: false,
-     },
-   ]);
- }
- 
- function handleChangeTask(task) {
-   setTasks(
-     tasks.map((t) => {
-       if (t.id === task.id) {
-         return task;
-       } else {
-         return t;
-       }
-     })
-   );
- }
- 
- function handleDeleteTask(taskId) {
-   setTasks(tasks.filter((t) => t.id !== taskId));
- }

# dispatch(ACTIONOBJECT)

+ function handleAddTask(text) {
+   dispatch({
+     type: 'added',
+     id: nextId++,
+     text: text,
+   });
+ }

+ function handleChangeTask(task) {
+   dispatch({
+     type: 'changed',
+     task: task,
+   });
+ }
+ 
+ function handleDeleteTask(taskId) {
+   dispatch({
+     type: 'deleted',
+     id: taskId,
+   });
+ }
```

2. Reducer関数を定義する

Reduxよろしく、

```JavaScript
function yourReducer(
    state,      // reducerで扱いたいstate 
    action      // ディスパッチされたactionオブジェクト
): state        // 更新されたstate
 {
  // return next state for React to set
  switch(action.type) {
    case "edit": {
        
    }
    case "add": {

    }
    case "delete": {

    }
  }
};
```

3. Use the Reducer from your component

```JavaScript
import { useReducer } from 'react';

// Instead using this,
// const [tasks, setTasks] = useState(initialTasks);

// Use this.
const [tasks, dispatch] = useReducer(
    tasksReducer,   // pass reducer funtion you defined.
    initialTasks    // pass initial state
);

// useReducer()で使えればいいのでどこに定義しておいてもよい
function tasksReducer(taks, action) {
    // ...
};
```

結果、コンポーネントから見れば`handleDeleteTask`, `handleEditTask`, `handleAddTask`を`tasksReducer`へまとめることに成功し、
結果を`useReducer`から取得できるようになった。

## Comparing useState and useReducer

> - 可読性: useState は、状態の更新が単純な場合、非常に読みやすくなります。複雑になると、コンポーネントのコードが肥大化し、スキャンが困難になる可能性があります。この場合、useReducer を使用すると、ロジックの更新方法とイベント ハンドラーで何が起こったかを明確に分離できます。 
> - デバッグ: useState にバグがある場合、状態がどこで間違って設定されたのか、またその理由を特定するのが難しい場合があります。 useReducer を使用すると、Reducer にコンソール ログを追加して、すべての状態の更新と、それが発生した理由 (どのアクションによるか) を確認できます。それぞれのアクションが正しければ、間違いがリデューサー ロジック自体にあることがわかります。ただし、useState を使用する場合よりも多くのコードをステップ実行する必要があります。 
> - テスト: **リデューサーはコンポーネントに依存しない純粋な関数です。**これは、個別にエクスポートしてテストできることを意味します。一般的には、より現実的な環境でコンポーネントをテストすることが最善ですが、複雑な状態更新ロジックの場合は、リデューサーが特定の初期状態とアクションに対して特定の状態を返すことをアサートすると便利な場合があります。 
> - 個人的な好み: リデューサーを好む人もいれば、そうでない人もいます。大丈夫。それは好みの問題です。 useState と useReducer の間はいつでも前後に変換できます。これらは同等です。

## Recap

- Reducer を使用するには、もう少しコードを記述する必要がありますが、デバッグとテストに役立ちます。 
- Reducerは純粋でなければなりません。 
- 各アクションは、単一のユーザー インタラクションを表します。 
- 変化するスタイルでリデューサーを作成したい場合は、Immer を使用してください。


## React.useRedcuer + TypeScript

ややこしい。

- ``