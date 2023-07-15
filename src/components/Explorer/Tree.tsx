/**************************************************
 * 
 * ************************************************/ 
import React, { useState } from "react";
import type { iExplorer } from "../../data/types";
import DragNDrop from './DragNDrop';
import { isFilenameValid, isFolderNameValid } from "../../utils";

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

const defaultNewFileName = "Untitled.file.js";
const defaultNewDirectoryName = "Untitled";

const Tree = ({ 
  explorer, 
  handleInsertNode, handleDeleteNode, handleReorderNode
}: iProps) => {
    const [expand, setExpand] = useState<boolean>(false);
    const [showInput, setShowInput] = useState({
      visible: false,
      isFolder: false
    });
    // NOTE: state管理じゃなくてもいい気がするなぁ let変数でもいいような
    // 
    // Use this state while being input form for new item.
    const [isNameValid, setIsNameValid] = useState<boolean>(false);
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
      if (e.keyCode === 13 && requiredPath && isNameValid) {
          handleInsertNode(requiredPath, showInput.isFolder);
          setShowInput({ ...showInput, visible: false });
          setIsNameValid(false);
      }
    };

    // Check if input value is valid for file/folder name.
    // 
    // ref
    // https://stackoverflow.com/questions/40676343/typescript-input-onchange-event-target-value
    // 
    // Accept: `A-Z`, `a-z`, `0-9`, `.`, `-`, `_`, `/`
    // `/`はまだ実装先になるかも
    // 
    // Invalid:
    // typ
    // typing_.
    // typing_.-
    // typing_.-wor
    // typing_.-worker
    // typing_.-worker.
    // (Any other characters without Accepted characters...)
    // 
    // Valid:
    // typing_.-worker.js
    // 
    // 
    const handleNewItemNameInput = (
      e: React.ChangeEvent<HTMLInputElement>,
      isFolder: boolean
      ) => {  
      // DEBUG:
      console.log(`[handleNewItemNameInput] ${e.currentTarget.value}`);
      if(isFolder && isFolderNameValid(e.currentTarget.value)) {
        setIsNameValid(true);
      }
      else if(isFilenameValid(e.currentTarget.value)) {
        setIsNameValid(true);
      }
      else {
        setIsNameValid(false);
      }
    };

    const onDelete = (
      e: React.MouseEvent<HTMLDivElement>
    ) => {
      e.stopPropagation();
      handleDeleteNode(explorer);
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
                  <div onClick={onDelete}>
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
                  className="inputContainer--input"
                  onKeyDown={(e) => onAddItem(e, explorer.path)}
                  onBlur={() => setShowInput({ ...showInput, visible: false })}
                  onChange={(e) => handleNewItemNameInput(e, explorer.isFolder)}
                  autoFocus
                  placeholder={explorer.isFolder ? defaultNewDirectoryName : defaultNewFileName}
                />
                <div className={"inputContainer--validSign" + isNameValid ? "__valid" : "__invalid"}>{isNameValid ? "Name is valid" : "Name is invalid"}</div>
                </div>
            )}
            {explorer.name === "temporary" && (
              <div className="inputContainer">
                <span>{showInput.isFolder ? "📁" : "📄"}</span>
                <input
                  type="text"
                  className="inputContainer--input"
                  // onKeyDown={(e) => onAddItem(e, explorer.path)}
                  // onBlur={() => setShowInput({ ...showInput, visible: false })}
                  onChange={(e) => handleNewItemNameInput(e, explorer.isFolder)}
                  autoFocus
                  placeholder={explorer.isFolder ? defaultNewDirectoryName : defaultNewFileName}
                />
                <div className="flex-break"></div>
                <div className={"inputContainer--validSign" + " " + (isNameValid ? "__valid" : "__invalid")}>{isNameValid ? "Name is valid" : "Name is invalid"}</div>
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
              onClick={onDelete} 
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