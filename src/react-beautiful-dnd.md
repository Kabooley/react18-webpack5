# Note: implement dnd able file explorer

by `react-beautfuk-dnd`.

file explorerのために、dndできるreact componentを習得する。

## 問題

- ネストされたdroppableは難しいかも？[RBDNDでnested-droppable](#RBDNDでnested-droppable)

## Watch!

本来のsrc/をこのブランチにおいてのみsrc2/にしている

## はじめるまえに

TODO: codesandboxでプロジェクトを保存する方法を知る。

スターターコード：

https://github.com/piyush-eon/react-typescript-taskify/tree/react-typescript-tutorial

Issue: react-beautiful-dndはreact18に対応していない:

https://github.com/atlassian/react-beautiful-dnd/issues/2399

https://github.com/atlassian/react-beautiful-dnd/issues/2350

動画チュートリアル：

https://egghead.io/lessons/react-course-introduction-beautiful-and-accessible-drag-and-drop-with-react-beautiful-dnd

lesson codeもページ中断についている。

## Guide 

https://github.com/atlassian/react-beautiful-dnd/tree/master/docs/guides

## api

https://github.com/atlassian/react-beautiful-dnd/tree/master/docs/api

## Issue

#### RBD with React18

https://github.com/atlassian/react-beautiful-dnd/issues/2399

動かなかったらこれを試せと。

https://github.com/atlassian/react-beautiful-dnd/issues/2399#issuecomment-1175638194

## 独自コンポーネントと`provided.innerRef`

https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/using-inner-ref.md

RBDでは`provided.innerRef`はDOMノードに渡されることを常に前提としている。

(というかReactはそうなんだけど)

つまり`ref`には`HTMLELement`を渡さなくてはならないため、

独自コンポーネントにrefを渡す方法は取れない。

https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/using-inner-ref.md#a-common-error-

なので、独自コンポーネントを`Droppable`で囲うと、

大変な遠回りを実装しなくてはならない。

その上結局実行時にエラーが起こるのでやはり直接

DOMノードを`Droppable`などで囲った方が楽

```TypeScript

<Droppable>
    {(provided) => (
        <MyComponent 
            domRef={provided.innerRef}
            provided={provided}
        />
    )}
</Droppable>

const MyComponent = ({ domRef, provided }:iProps) => {
    return (
        <div ref={domRef} {...provided.}>
            //...
        </div>
    )
}
```

## DragDropContext Responders

https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md

#### onBeforeCapture

> このレスポンダーは、ドラッグが開始されることがわかった後、DOM からディメンションが収集される前に呼び出されます。これは次のことを行う機会です。

- `<Draggable />`や`<Droppable />`コンポーネントを除去する
- 要素のサイズを変更する

#### onBeforeDragStart

> ドラッグを開始するために必要な情報をすべて取得したら、onBeforeDragStart 関数を呼び出します。これは、 <Draggable /> コンポーネントと <Droppable /> コンポーネントのスナップショット値を更新する直前に呼び出されます。
> この時点では、アプリケーションはドラッグ状態ではないため、isDropDisabled などのプロパティの変更は失敗します。 onBeforeDragStart レスポンダーは、テーブルの並べ替えに必要なディメンションのロックを実行する良い機会です。

できる：

- 現状のコンポーネントにサイズのロックをかけるなどはできる

できない：

- `<Draggable />`や`<Droppable />`の追加・除去
- `<Draggable />`や`<Droppable />`のサイズの変更


#### provided: ResponderProvided

> onDragStart、onDragUpdate、および onDragEnd には、指定された ResponderProvided オブジェクトが与えられます。このオブジェクトには、announce というプロパティが 1 つあります。この関数は、スクリーン リーダーにメッセージを同期してアナウンスするために使用されます。この機能を使用しない場合は、デフォルトの英語メッセージがアナウンスされます。スクリーン リーダーの使用方法に関するガイドを作成しました。スクリーン リーダーのメッセージを自分で制御し、国際化をサポートすることに興味がある場合は、このガイドを使用することをお勧めします。アナウンスを使用している場合は、同期的に呼び出す必要があります。


#### onDragStart

> onDragStart はドラッグが開始されると通知を受け取ります。このレスポンダはオプションであるため、指定する必要はありません。この関数を使用して、ドラッグ中にすべての <Draggable /> および <Droppable /> コンポーネントの更新をブロックすることを強くお勧めします。 (下記のドラッグ中の更新をブロックするを参照してください)


#### onDragUpdate

> onDragUpdate は、ドラッグ中に何かが変更されるたびに呼び出されます。考えられる変更は次のとおりです。 

> - <Draggable /> の位置が変更されました 
> - <Draggable /> は別の <Droppable /> の上にあります。 
> - <Draggable /> は <Droppable /> ではなくなりました 

> この機能を使用するとドラッグの速度が低下するため、作業をしすぎないようにすることが重要です。

## RBDNDでnested-droppable

Droppable領域が重複していると重なっている部分の下の方のDroppableを、

destinationとして見てくれない。

そのため、

各アイテムを細かくDroppableで囲うこととした。

```TypeScript
// Droppable, Draggableの簡易化したコンポーネント
import { Drag, Drop } from '../../Tree';

const Folder = ({ 
  explorer, 
  handleInsertNode, handleDeleteNode,
}: iProps) => {

    // ...

    if (explorer.isFolder) {
      return (
        // 
        // 1. フォルダの行部分だけをDropで囲う
        // 
        <div>
          <Drop droppableId={"folder-area-" + explorer.id}>
          <div 
                style={{ marginTop: 5 }}
              >
                <div className="folder" onClick={() => setExpand(!expand)}>
                  <span>📁 {explorer.name}</span>
                  <div>
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                        handleNewFolder(e, true)
                      }
                    >
                      Folder +
                    </button>
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                        handleNewFolder(e, false)
                      }
                    >
                      File +
                    </button>
                    <button onClick={(e) => onDelete(e, true)}>
                      <span>-x-</span>
                    </button>
                  </div>
                </div>
              </div>
          </Drop>
            // 2. フォルダ行を広げた領域は囲わない
            <div 
              style={{ display: expand ? "block" : "none", paddingLeft: 25 }}
            >
            // ...
              {explorer.items.map((exp: iExplorer) => {
                return (
                  <Folder
                    handleInsertNode={handleInsertNode}
                    handleDeleteNode={handleDeleteNode}
                    explorer={exp}
                  />
                );
              })}
              </div>
        </div>
      );
    } else {
      return (
        // 3. ファイル自体をDropで囲う
        <Drop droppableId={"file-area" + explorer.id}>
            <Drag 
              index={Number(explorer.id)} key={explorer.id} 
              draggableId={explorer.id}
            >
              <span className="file">
                📄 {explorer.name}{" "}
                <button onClick={(e) => onDelete(e, false)}>
                  <span>-x-</span>
                </button>
              </span>
            </Drag>
        </Drop>
      );
    }
  };
```



## OnDragEndとexplorerロジックの統合

ではdnd操作ができるようになったので捜査結果の反映ができるように実装していく

