import React, { useState } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./styles.css";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import type * as typeOfRBD from "react-beautiful-dnd";

export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);

  const { insertNode, deleteNode, updateNode } = useTraverseTree();

  const handleInsertNode = (
    folderId: string,
    item: string,
    isFolder: boolean
  ) => {
    const finalTree = insertNode(explorerData, folderId, item, isFolder);
    setExplorerData(finalTree);
  };

  /*****
   * どのフォルダのどのアイテムなのか、idで指定すれば削除する
   *
   * @param {string} folderId - 削除するアイテムを所有しているフォルダのid
   * @param {string} item - 削除するアイテムの名前
   * @param {string} itemId - 削除するアイテムの名前
   * @param {boolean} isFolder - 削除するアイテムはフォルダかファイルか   多分要らない。
   * */

  const handleDeleteNode = (itemId: string, isFolder: boolean) => {
    const updatedTree = deleteNode(explorer, itemId, isFolder);
    setExplorerData(updatedTree);
    console.log(updatedTree);
  };

  const onDragEnd: typeOfRBD.OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // TODO: implement on drag end process
  };

  // DragDropContextは特に子要素に独自のpropertyを渡す必要がない
  //
  // 独自コンポーネントにrefを渡せないので、FolderをforwardRef()で囲う必要がある
  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={explorerData.id}>
          {(provided) => (
            <Folder
              handleInsertNode={handleInsertNode}
              handleDeleteNode={handleDeleteNode}
              explorer={explorerData}
              // RBD requirements
              ref={provided.innerRef}
              {...provided.droppableProps}
            />
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

// fix connect script in latest video
