import React, { useState } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./styles.css";

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

  return (
    <div className="App">
      <Folder
        handleInsertNode={handleInsertNode}
        handleDeleteNode={handleDeleteNode}
        explorer={explorerData}
      />
    </div>
  );
}

// fix connect script in latest video
