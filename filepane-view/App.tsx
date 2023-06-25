import React, { useState, useEffect } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer, { iExplorer } from "./data/folderData";
import { 
  getParentNodeByChildId, 
  getNodeById,
  // retrieveFromExplorer, 
  // pushIntoExplorer  
} from './Tree';
import "./styles.css";


export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);
  
  useEffect(() => {
    console.log("[App] component did update");
  }, []);

  const { insertNode, deleteNode, updateNode, addNode, addFolderNode } = useTraverseTree();


  const handleInsertNode = (
    folderId: string,
    item: string,
    isFolder: boolean
  ) => {
    const updatedTree = insertNode(explorerData, folderId, item, isFolder);
    setExplorerData(updatedTree);
  };

  const handleDeleteNode = (itemId: string,) => {
    const updatedTree = deleteNode(explorer, itemId);
    setExplorerData(updatedTree);
  };

  const handleReorderNode = (droppedId: string, draggableId: string): void => {

      let updatedTree: iExplorer | undefined;
      if(getNodeById(explorerData, droppedId)!.isFolder) {
        // In case item dropped on folder column.
        const movingItem = getNodeById(explorerData, draggableId);        updatedTree = movingItem && addFolderNode(
          deleteNode(explorerData, draggableId), droppedId, movingItem
        );
      }
      else {
        // In case item dropped on a folder drop-list area
        const movingItem = getNodeById(explorerData, draggableId);
        updatedTree = movingItem && addNode(
          deleteNode(explorerData, draggableId), droppedId, movingItem
        );
      }

      updatedTree && setExplorerData(updatedTree);
  };

  return (
    <div className="App">
        <Folder
          handleInsertNode={handleInsertNode}
          handleDeleteNode={handleDeleteNode}
          handleReorderNode={handleReorderNode}
          explorer={explorerData}
        />
    </div>
  );
};
