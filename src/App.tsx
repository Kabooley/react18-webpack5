import React, { useState, useEffect } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import { 
  getParentNodeByChildId, 
  retrieveFromExplorer, 
  pushIntoExplorer  
} from './Tree';
import "./styles.css";


export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);
  
  useEffect(() => {
    console.log("[App] component did update");
  }, []);

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

  const handleReorderNode = (droppedId: string, draggableId: string): void => {

      // Check which folder draggable has been belonged.
      const prevFolder =  getParentNodeByChildId(explorerData, draggableId);
      const droppedFolder = getParentNodeByChildId(explorerData, droppedId);
      if(!prevFolder || !droppedFolder) throw new Error("[App] draggableId/destination.droppableId is not belongs to any parent explorer object.");

      // DEBUG:
      console.log(prevFolder);
      console.log(droppedFolder);

      if(prevFolder.id === droppedFolder.id) {return;}

      console.log("[onDragEnd] reorder item");
      
      const retrieved = retrieveFromExplorer(explorerData, draggableId);
      console.log("[onDragEnd] retrieved:");
      console.log(retrieved);
      const exp = retrieved && pushIntoExplorer(explorerData, retrieved, droppedFolder.id);
      
      console.log(exp);

      // NOTE: 相変わらず再レンダリングを起こさない!
      exp && setExplorerData(exp);
  }

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
