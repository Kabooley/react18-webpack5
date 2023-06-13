import React, { useState } from "react";
import type { iExplorer } from "../../data/folderData";

interface iProps {
  explorer: iExplorer;
  handleInsertNode: (folderId: string, item: string, isFolder: boolean) => void;
}

const Folder = ({ explorer, handleInsertNode }: iProps) => {
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
    // TODO: implement delete logic.
    if (isFolder) {
      // delete folder
    } else {
      // delete file
    }
  };

  if (explorer.isFolder) {
    return (
      <div style={{ marginTop: 5 }}>
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
              <span>❌</span>
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
              <Folder
                key={exp.id}
                explorer={exp}
                handleInsertNode={handleInsertNode}
              />
            );
          })}
        </div>
      </div>
    );
  } else {
    return (
      <span className="file">
        📄 {explorer.name}{" "}
        {/* <button onClick={(e) => onDelete(e, true)}>
          <span>❌</span>
        </button> */}
      </span>
    );
  }
};

export default Folder;
