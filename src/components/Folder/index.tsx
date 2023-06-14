import React, { useState } from "react";
import type { iExplorer } from "../../data/folderData";

import { Droppable } from "react-beautiful-dnd";

interface iProps {
  explorer: iExplorer;
  handleInsertNode: (folderId: string, item: string, isFolder: boolean) => void;
  handleDeleteNode: (itemId: string, isFolder: boolean) => void;
}

const Folder = React.forwardRef<HTMLDivElement, iProps>(
  ({ explorer, handleInsertNode, handleDeleteNode }: iProps, ref) => {
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

    //
    // TODO: `explorer.id`だけで削除処理が完了するようにする
    //
    const onDelete = (
      e: React.MouseEvent<HTMLButtonElement>,
      isFolder: boolean
    ) => {
      e.stopPropagation();
      handleDeleteNode(explorer.id, isFolder);
    };

    if (explorer.isFolder) {
      return (
        <div style={{ marginTop: 5 }} ref={ref}>
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
          <div style={{ display: expand ? "block" : "none", paddingLeft: 25 }}>
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
                <Droppable droppableId={exp.id}>
                  {(provided) => (
                    <Folder
                      handleInsertNode={handleInsertNode}
                      handleDeleteNode={handleDeleteNode}
                      explorer={exp}
                      // RBD requirements
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    />
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <span className="file">
          📄 {explorer.name}{" "}
          <button onClick={(e) => onDelete(e, false)}>
            <span>-x-</span>
          </button>
        </span>
      );
    }
  }
);

export default Folder;
