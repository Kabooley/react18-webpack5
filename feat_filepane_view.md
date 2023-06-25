# Implement file pane 

## 枠組み

- FilePaneのベース：https://www.youtube.com/watch?v=20F_KzHPpvI

- dnd機能：HTML5 drag and drop api

サードパーティ製の方が面倒くさかった。


## 実装：スタイリング

#### svg icon

webpack準備:

https://webpack.js.org/guides/asset-management/#loading-images

typescript準備：

https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript

iconはネットから拾ってきたやつをひとまず：

https://www.svgrepo.com/svg/42233/pencil-edit-button


## 実装：DND機能

HTML5 Drag and Drop API

MDN:

https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

その他：

https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/

https://www.youtube.com/watch?v=u65Y-vqYNAk

#### 手順

https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#dragstart


- dragしたいHTML要素に`draggable`属性に`true`を与える
- `dragstart`イベントのリスナを定義する
- `ondragstart`リスナで`DataTransfer:setData()`を呼び出す
- `DragEvent.dataTransfer.setData()`でdndしたい情報を渡す
- `ondrop`リスナで`DragEvent.dataTransfet.getData()`からdndされた情報を取得して処理をする
- droppableエリアとするには、そのdroppableにしたい要素に`ondropover`と`ondrop`イベントハンドラを渡し、ハンドラで`e.preventDefault()`すること。

というのが基本的な流れ。

Reactには組み込みでJSXにリスナが用意されている。なのでJavaScriptで実装するのよりもはるかに楽勝。

`React.DragEvent`

```TypeScript
import React, { useState } from "react";
import type { iExplorer } from "../../data/folderData";
import { Drop, DragNDrop } from '../../Tree';


const Folder = ({ 
  explorer, 
  handleInsertNode, handleDeleteNode,
}: iProps) => {

    /***
     * Fires when the user starts dragging an item.
     * 
     * */ 
    const onDragStart = (e: React.DragEvent, id: string) => {
      // DEBUG:
      console.log("[Folder] Start drag");
      console.log(`[Folder] DraggindId: ${id}`);
      e.dataTransfer.setData("draggingId", id);
    };

    /**
     * Fires when dragged item evnters a valid drop target.
     * 
     * */ 
    const onDragEnter = (e: React.DragEvent) => {
      // DEBUG:
      console.log("[Folder] on drag enter");
    };

    /***
     * Fires when a draggaed item leaves a valid drop target.
     * 
     * */ 
    const onDragLeave = (e: React.DragEvent) => {
      // DEBUG:
      console.log("[Folder] on drag leave");
    };

    /**
     * Fires when a dragged item is being dragged over a valid drop target,
     * every handred milliseconds.
     * 
     * */ 
    const onDragOver = (e: React.DragEvent) => {
      // DEBUG:
      console.log("[Folder] on drag over");
      e.preventDefault();
    };

    /***
     * Fires when a item is dropped on a valid drop target.
     * 
     * */ 
    const onDrop = (e: React.DragEvent, droppedId: string) => {
      // DEBUG:
      console.log("[Folder] on drop: ");
      const draggedItemId = e.dataTransfer.getData("draggingId") as string;
      console.log(`draggingId: ${draggedItemId}`);
      console.log(`droppedId: ${droppedId}`);
      e.dataTransfer.clearData("draggingId");
      // Send id to reorder process;
    };

    if (explorer.isFolder) {
      return (
        <div>
            <DragNDrop
              id={explorer.id}
              index={Number(explorer.id)}
              isDraggable={true}
              onDragStart={(e) => onDragStart(e, explorer.id)}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, explorer.id)}
              onDragOver={onDragOver}
            >
                // ...
            </DragNDrop>
        </div>
      );
    } else {
      return (
        <DragNDrop
          id={explorer.id}
          index={Number(explorer.id)}
          isDraggable={true}
          onDragStart={(e) => onDragStart(e, explorer.id)}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, explorer.id)}
          onDragOver={onDragOver}
        >
            // ...
        </DragNDrop>
      );
    }
  };
```

これで楽勝でdragしたアイテムのidとdropされたアイテムのidを取得できる。


#### explorerを直接参照しているため再レンダリングが起こっていない

ネストされたオブジェクトをstateで管理する場合のあるあるかも。

onDragEndでのdnd結果の反映による再レンダリングがされない。

何が問題かというと、explorerDataを参照している変数を変更しているため、

setExplorerData()で変更を適用する前に既にexplorerDataが変更していることから

最終的にsetExplorerData()で変更を適用したつもりが「差分がない」と判断されて

再レンダリングが起こらないのである。

これの修正。

- helper関数へ渡すオブジェクトはコピーにする（参照を持たない）

deepcopyはJSONメソッドを使うほかないので処理が重い。

- helper関数が常に次のような新たなitemsを返すようにする

```TypeScript
  function insertNode(
    tree: iExplorer,
    folderId: string,
    item: string,
    isFolder: boolean
  ): iExplorer {

    // ...

    // NOTE: これ
    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return insertNode(ob, folderId, item, isFolder);
    });

    return { ...tree, items: latestNode };
  }
```

`tree.items.map()`は常に新しい配列を返し、

spread構文で上書き保存している。

だから最終的に新しいtree全体を返すので

最終的なsetExplorerDataで再レンダリングが起こってくれる。


## branch: test_filepane_viewへ統合

確認された問題など：

- fontサイズ(CSSの統合)
- 親フォルダを子フォルダにドロップすると消える。
- 問題じゃないけど：Monacoエディタはdroppableだけどおとしてもfileexplorerの機能に影響はない。

#### 親フォルダを子フォルダにドロップすると消える問題

統合したことは関係ないのだけどね。

親フォルダを子アイテムエリアにドロップしないために、

dragstart時点で無効にするべき。