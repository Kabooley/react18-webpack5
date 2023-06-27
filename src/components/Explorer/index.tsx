import React, { useState } from "react";
import Tree from "./Tree";
import { isNodeIncludedUnderExplorer, getNodeById } from "./helper";
import useTraverseTree from "../../hooks/use-traverse-tree";
// import explorer, { iExplorer } from "../../data/explorerData";
import type { iExplorer } from "../../data/explorerData";
import { generateTreeNodeData } from "./generateTree";


// NOTE: ひとまずでexplorerのファイルをここにおいておく
const temporaryPaths =  [
  'changelog.txt', 'debug.js', 'license.txt', 'package.json', 'readme.md', 'release.js', 'controllers/api.js', 'controllers/chat.js', 'controllers/default.js', 'databases/channels.json', 'databases/users.json', 'definitions/auth.js', 'definitions/convertors.js', 'definitions/globals.js', 'definitions/helpers.js', 'definitions/localization.js', 'definitions/merge.js', 'definitions/operations.js', 'definitions/scheduler.js', 'models/account.js', 'models/channels.js', 'models/favorites.js', 'models/login.js', 'models/messages.js', 'models/tasks.js', 'models/users.js', 'public/favicon.ico', 'public/icon.png','views/index.html', 'views/login.html', 'views/notification.html', 'public/css/bootstrap.min.css', 'public/css/default.css', 'public/css/ui.css', 'public/forms/files.html', 'public/forms/formblacklist.html', 'public/forms/formchannel.html', 'public/forms/formuser.html', 'public/forms/help.html','public/img/preloader.gif', 'public/photos/face.jpg', 'public/js/default.js', 'public/js/jctajr.min.js', 'public/js/ui.js', 'public/templates/chat.html', 'public/templates/favorite.html', 'public/templates/settings.html', 'public/templates/tasks.html', 'public/templates/users.html',
];



export default function FileExplorer() {
  const [explorerData, setExplorerData] = useState(generateTreeNodeData(temporaryPaths, "root"));

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
          handleInsertNode={handleInsertNode}
          handleDeleteNode={handleDeleteNode}
          handleReorderNode={handleReorderNode}
          explorer={explorerData}
        />
    </div>
  );
};
