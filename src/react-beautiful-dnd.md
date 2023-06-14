# Note: implement dnd able file explorer

by `react-beautfuk-dnd`.

file explorerのために、dndできるreact componentを習得する。


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


#### issue about using with React18

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

