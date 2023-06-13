
/**********************************
 * https://www.youtube.com/watch?v=20F_KzHPpvI
 * 
 * */ 
import React, { useState } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./index.css";

export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);

  const { insertNode, deleteNode, updateNode } = useTraverseTree();

  const handleInsertNode = (folderId: string, item: string, isFolder: boolean) => {
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
  const handleDeleteNode = (folderId: string, itemId: string) => {
    const updatedTree = deleteNode(explorer, folderId, itemId);
  };

  return (
    <div className="App">
      <Folder 
        handleInsertNode={handleInsertNode} 
        // handleDeleteNode={handleDeleteNode} 
        explorer={explorerData} 
        key={explorerData.id} 
    />
    </div>
  );
}

// fix connect script in latest video
