/**************************************************
 * Droppableの領域が他と重複しないようにするために
 * Droppableを囲うコンポーネントを増やした。
 * 
 * 重複はないはず。
 * ************************************************/ 
import React, { useState } from "react";
import type { iExplorer } from "../../data/folderData";
import { Drag, Drop } from '../../Tree';

import editPencil from '../../assets/pencil-edit.svg';
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

    if (explorer.isFolder) {
      return (
        <div>
          <Drop droppableId={explorer.id} type={"folder"}>
            <Drag 
              index={Number(explorer.id)} key={explorer.id} 
              draggableId={explorer.id}
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
            </Drag>
          </Drop>
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
        <Drop droppableId={explorer.id} type={"file"}>
          <Drag 
            index={Number(explorer.id)} key={explorer.id} 
            draggableId={explorer.id}
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
          </Drag>
        </Drop>
      );
    }
  };

export default Folder;