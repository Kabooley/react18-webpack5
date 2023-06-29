import React, { useState, useEffect } from "react";
import Tree from "./Tree";
import { isNodeIncludedUnderExplorer, getNodeById } from "./helper";
import useTraverseTree from "../../hooks/use-traverse-tree";
// import explorer, { iExplorer } from "../../data/explorerData";
import type { iExplorer } from "../../data/explorerData";
import { generateTreeNodeData } from "./generateTree";
import { filesProxy } from "../../data/files";


export default function FileExplorer() {
  const [explorerData, setExplorerData] = useState(generateTreeNodeData([], "root"));

  useEffect(() => {
    setExplorerData(generateTreeNodeData(filesProxy.getAllPaths(), "root"));
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
    const updatedTree = deleteNode(explorerData, itemId);
    setExplorerData(updatedTree);
  };

  const handleReorderNode = (droppedId: string, draggableId: string): void => {

      // Check if the dropped area is under dragging item
      if(isNodeIncludedUnderExplorer(explorerData, droppedId, draggableId)){
        // DEBUG:
        console.log("[onDragEnd] cancel drop on the area.");
        return;
      }

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
    <div className="file-explorer">
        <Tree
          key={explorerData.id}
          handleInsertNode={handleInsertNode}
          handleDeleteNode={handleDeleteNode}
          handleReorderNode={handleReorderNode}
          explorer={explorerData}
        />
    </div>
  );
};
