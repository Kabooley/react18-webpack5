/**************************************************
 * 
 * ************************************************/ 
import React, { useState } from "react";
import type { iExplorer } from "../../data/types";
import DragNDrop from './DragNDrop';

// Icons
// import editPencil from '../../assets/pencil-edit.svg';
import addFolder from '../../assets/add-folder.svg';
import addFile from '../../assets/add-file.svg';
import closeButton from '../../assets/close-button.svg';

interface iProps {
  explorer: iExplorer;
  // handleInsertNode: (folderId: string, item: string, isFolder: boolean) => void;
  handleInsertNode: (requiredPath: string, isFolder: boolean) => void;
  // handleDeleteNode: (itemId: string, isFolder: boolean) => void;
  handleDeleteNode: (explorer: iExplorer) => void;
  handleReorderNode: (droppedId: string, draggableId: string) => void;
};

const Tree = ({ 
  explorer, 
  handleInsertNode, handleDeleteNode, handleReorderNode
}: iProps) => {
    const [expand, setExpand] = useState<boolean>(false);
    const [showInput, setShowInput] = useState({
      visible: false,
      isFolder: false
    });
    const [dragging, setDragging] = useState<boolean>(false);

    // TODO: 名前が紛らわしいかも
    const handleNewItem = (
      e: React.MouseEvent<HTMLDivElement>,
      isFolder: boolean
    ) => {
      e.stopPropagation();
      setExpand(true);
      setShowInput({
        visible: true,
        isFolder
      });
    };

    const onAddItem = (e: React.KeyboardEvent<HTMLInputElement>, addTo: string) => {
      const requiredPath = addTo.length ? addTo + '/' + e.currentTarget.value : e.currentTarget.value;
      if (e.keyCode === 13 && requiredPath) {
        handleInsertNode(requiredPath, showInput.isFolder);
        setShowInput({ ...showInput, visible: false });
      }
    };

    const onDelete = (
      e: React.MouseEvent<HTMLDivElement>,
      
      isFolder: boolean
    ) => {
      e.stopPropagation();
      handleDeleteNode(explorer);
      // handleDeleteNode(explorer.id, isFolder);
    };

    // DND

    /***
     * Fires when the user starts dragging an item.
     * 
     * */ 
    const onDragStart = (e: React.DragEvent, id: string) => {
      // DEBUG:
      console.log("[Folder] Start drag");
      console.log(`[Folder] DraggindId: ${id}`);
      setDragging(true);
      e.dataTransfer.setData("draggingId", id);
    };

    /**
     * Fires when dragged item evnters a valid drop target.
     * 
     * */ 
    const onDragEnter = (e: React.DragEvent) => {
      // DEBUG:
      console.log("[Folder] on drag enter");
    };

    /***
     * Fires when a draggaed item leaves a valid drop target.
     * 
     * */ 
    const onDragLeave = (e: React.DragEvent) => {
      // DEBUG:
      console.log("[Folder] on drag leave");
    };

    /**
     * Fires when a dragged item is being dragged over a valid drop target,
     * every handred milliseconds.
     * 
     * */ 
    const onDragOver = (e: React.DragEvent) => {
      // DEBUG:
      console.log("[Folder] on drag over");
      e.preventDefault();
    };

    /***
     * Fires when a item is dropped on a valid drop target.
     * 
     * */ 
    const onDrop = (e: React.DragEvent, droppedId: string) => {
      // DEBUG:
      console.log("[Folder] on drop: ");
      const draggedItemId = e.dataTransfer.getData("draggingId") as string;
      console.log(`draggingId: ${draggedItemId}`);
      console.log(`droppedId: ${droppedId}`);
      e.dataTransfer.clearData("draggingId");

      handleReorderNode(droppedId, draggedItemId);
      setDragging(false);
    };

    if (explorer.isFolder) {
      return (
        <div>
            <DragNDrop
              id={explorer.id}
              index={Number(explorer.id)}
              isDraggable={true}
              onDragStart={(e) => onDragStart(e, explorer.id)}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, explorer.id)}
              onDragOver={onDragOver}
            >
              <div className="folder" onClick={() => setExpand(!expand)}>
                <span>📁 {explorer.name}</span>
                <div className="folder--function">
                  <div
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      handleNewItem(e, true)
                    }
                  >
                    <img src={addFolder} alt="add folder" />
                  </div>
                  <div
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      handleNewItem(e, false)
                    }
                  >
                  <img src={addFile} alt="add file" />
                  </div>
                  <div onClick={(e) => onDelete(e, true)}>
                    <img src={closeButton} alt="delete folder" />
                  </div>
                </div>
              </div>
            </DragNDrop>
          <div 
            style={{ display: expand ? "block" : "none", paddingLeft: 25 }}
          >
            {showInput.visible && (
              <div className="inputContainer">
                <span>{showInput.isFolder ? "📁" : "📄"}</span>
                <input
                  type="text"
                  className="inputContainer__input"
                  onKeyDown={(e) => onAddItem(e, explorer.path)}
                  onBlur={() => setShowInput({ ...showInput, visible: false })}
                  autoFocus
                />
                </div>
            )}
            {explorer.items.map((exp: iExplorer) => {
              return (
                <Tree
                  key={exp.id}
                  handleInsertNode={handleInsertNode}
                  handleDeleteNode={handleDeleteNode}
                  handleReorderNode={handleReorderNode}
                  explorer={exp}
                />
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <DragNDrop
          id={explorer.id}
          index={Number(explorer.id)}
          isDraggable={true}
          onDragStart={(e) => onDragStart(e, explorer.id)}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, explorer.id)}
          onDragOver={onDragOver}
        >
          <div className="file">
            <span className="file--name">
              📄 {explorer.name}{" "}
            </span>
            <div 
              onClick={(e) => onDelete(e, false)} 
              className="file--function"
            >
              <img src={closeButton} alt="delete file" />
            </div>
          </div>
        </DragNDrop>
      );
    }
  };


export default Tree;