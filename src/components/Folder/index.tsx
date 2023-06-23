/**************************************************
 * Droppableの領域が他と重複しないようにするために
 * Droppableを囲うコンポーネントを増やした。
 * 
 * 重複はないはず。
 * ************************************************/ 
import React, { useState } from "react";
import type { iExplorer } from "../../data/folderData";
import { Drop, DragNDrop } from '../../Tree';

// Icons
// import editPencil from '../../assets/pencil-edit.svg';
import addFolder from '../../assets/add-folder.svg';
import addFile from '../../assets/add-file.svg';
import closeButton from '../../assets/close-button.svg';

interface iProps {
  explorer: iExplorer;
  handleInsertNode: (folderId: string, item: string, isFolder: boolean) => void;
  handleDeleteNode: (itemId: string, isFolder: boolean) => void;
};

const Folder = ({ 
  explorer, 
  handleInsertNode, handleDeleteNode,
}: iProps) => {
    const [expand, setExpand] = useState<boolean>(false);
    const [showInput, setShowInput] = useState({
      visible: false,
      isFolder: false
    });

    const handleNewFolder = (
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

    const onAddFolder = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      if (e.keyCode === 13 && v) {
        handleInsertNode(explorer.id, v, showInput.isFolder);
        setShowInput({ ...showInput, visible: false });
      }
    };

    const onDelete = (
      e: React.MouseEvent<HTMLDivElement>,
      isFolder: boolean
    ) => {
      e.stopPropagation();
      handleDeleteNode(explorer.id, isFolder);
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
      // Send id to reorder process;
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
                <div className="folder-function">
                  <div
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      handleNewFolder(e, true)
                    }
                  >
                    <img src={addFolder} alt="add folder" />
                  </div>
                  <div
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      handleNewFolder(e, false)
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
                  onKeyDown={onAddFolder}
                  onBlur={() => setShowInput({ ...showInput, visible: false })}
                  autoFocus
                />
                </div>
            )}
            {explorer.items.map((exp: iExplorer) => {
              return (
                <Folder
                  handleInsertNode={handleInsertNode}
                  handleDeleteNode={handleDeleteNode}
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
            <span className="file-name">
              📄 {explorer.name}{" "}
            </span>
            <div 
              onClick={(e) => onDelete(e, false)} 
              className="file-function"
            >
              <img src={closeButton} alt="delete file" />
            </div>
          </div>
        </DragNDrop>
      );
    }
  };

export default Folder;