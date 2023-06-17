import React, { useState } from "react";
import type { iExplorer } from "../../data/folderData";

// import { Droppable } from "react-beautiful-dnd";
import type * as typeOfRBD from "react-beautiful-dnd";
import { Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "../../strictMode/StrictModeDroppable";



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
      e: React.MouseEvent<HTMLButtonElement>,
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
      e: React.MouseEvent<HTMLButtonElement>,
      isFolder: boolean
    ) => {
      e.stopPropagation();
      handleDeleteNode(explorer.id, isFolder);
    };

    if (explorer.isFolder) {
      return (
        <div>
          <StrictModeDroppable droppableId={explorer.id}>
            {(provided) => (
              <div 
                style={{ marginTop: 5 }} 
                ref={provided.innerRef} 
                {...provided.droppableProps}
              >
                <div className="folder" onClick={() => setExpand(!expand)}>
                  <span>📁 {explorer.name}</span>
                  <div>
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                        handleNewFolder(e, true)
                      }
                    >
                      Folder +
                    </button>
                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                        handleNewFolder(e, false)
                      }
                    >
                      File +
                    </button>
                    <button onClick={(e) => onDelete(e, true)}>
                      <span>-x-</span>
                    </button>
                  </div>
                </div>
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
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
          {/* <StrictModeDroppable droppableId={explorer.id + "__inside"}>
            {(provided) => (
              <div 
                style={{ display: expand ? "block" : "none", paddingLeft: 25 }}
                ref={provided.innerRef} 
                {...provided.droppableProps}
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
                {provided.placeholder}
              </div>
            )}
            </StrictModeDroppable> */}
        </div>
      );
    } else {
      return (
        <StrictModeDroppable droppableId={explorer.id}>
          {(provided) => (
            <Draggable 
              index={Number(explorer.id)} key={explorer.id} 
              draggableId={explorer.id}
            >
            {(provided) => (
              <span 
                className="file"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                📄 {explorer.name}{" "}
                <button onClick={(e) => onDelete(e, false)}>
                  <span>-x-</span>
                </button>
                {/* {provided.placeholder} */}
              </span>
            )}
            </Draggable>
          )}
        </StrictModeDroppable>
      );
    }
  };

export default Folder;