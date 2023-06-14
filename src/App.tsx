import React, { useState } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./styles.css";
import { DragDropContext } from "react-beautiful-dnd";
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
   * @param {string} itemId - 削除するアイテムの名前
   * @param {boolean} isFolder - 削除するアイテムはフォルダかファイルか   多分要らない。
   * */
  const handleDeleteNode = (itemId: string, isFolder: boolean) => {
    const updatedTree = deleteNode(explorer, itemId, isFolder);
    setExplorerData(updatedTree);
    console.log(updatedTree);
  };


  // TODO: implement on drag start process
  const onDragStart: typeOfRBD.OnDragStartResponder = () => {

  }

  // TODO: implement on drag end process
  const onDragEnd: typeOfRBD.OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }
    // ...
  };

  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Folder
          handleInsertNode={handleInsertNode}
          handleDeleteNode={handleDeleteNode}
          explorer={explorerData}
        />
      </DragDropContext>
    </div>
  );
};
