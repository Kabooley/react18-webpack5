import React, { useState, useEffect } from "react";
import Tree from "./Tree";
import { isNodeIncludedUnderExplorer, getNodeById } from "./helper";
import useTraverseTree from "../../hooks/use-traverse-tree";
import type { iExplorer } from "../../data/explorerData";
import { generateTreeNodeData } from "./generateTree";
// import { filesProxy } from "../../data/files";

import { files } from '../../data/files';
import type { iFile } from '../../data/files';


const getFilesPaths = (_files: iFile[]) => {
  return _files.map(_f => _f.path);
};

/***
 * TODO: 検証だけど。filesを直接state管理する
 * 実装に当たってexplorerのhelperがいらなくなるかも...
 * - handleReorder
 * - handleInsetNode
 * - handleDeleteNode
 * - handle
 * 
 * */ 
export default function FileExplorer() {
  // NOTE: 配列を扱うので常に新しい配列を返すこと
  const [baseFiles, setBaseFiles] = useState<iFile[]>(files);

  // 毎レンダリングで必ずbaseFilesを元にexplorerDataは更新される
  const explorerData = generateTreeNodeData(getFilesPaths(baseFiles), "root");

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

      if(droppedId === draggableId) { return; }

      // Check if the dropped area is under dragging item
      if(isNodeIncludedUnderExplorer(explorerData, droppedId, draggableId)){
        return;
      }

      let updatedTree: iExplorer | undefined;
      if(getNodeById(explorerData, droppedId)!.isFolder) {
        console.log("[handleReorderNode] item dropped on folder column");
        // In case item dropped on folder column.
        const movingItem = getNodeById(explorerData, draggableId);        updatedTree = movingItem && addFolderNode(
          deleteNode(explorerData, draggableId), droppedId, movingItem
        );
      }
      else {
        console.log("[handleReorderNode] item NOT dropped on folder column");
        // In case item dropped on a folder drop-list area
        const movingItem = getNodeById(explorerData, draggableId);
        updatedTree = movingItem && addNode(
          deleteNode(explorerData, draggableId), droppedId, movingItem
        );
      }

      updatedTree && setExplorerData(updatedTree);

      console.log(updatedTree);
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
