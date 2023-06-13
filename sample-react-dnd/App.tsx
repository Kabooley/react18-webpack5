
/**********************************
 * https://www.youtube.com/watch?v=20F_KzHPpvI
 * 
 * */ 
import React, { useState } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./styles.css";

export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);

  const { insertNode } = useTraverseTree();

  const handleInsertNode = (folderId: string, item: string, isFolder: boolean) => {
    const finalTree = insertNode(explorerData, folderId, item, isFolder);
    setExplorerData(finalTree);
  };

  return (
    <div className="App">
      <Folder handleInsertNode={handleInsertNode} explorer={explorerData} />
    </div>
  );
}

// fix connect script in latest video
