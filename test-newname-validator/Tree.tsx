/**************************************************
 * 
 * ************************************************/ 
import React, { useState } from "react";
import TreeColumnIconName from "./TreeColumnIconName";

// import {ReactComponebt as addFolder} from './add-folder.svg';
// import {ReactComponebt as addFile} from './add-file.svg';
// import {ReactComponebt as closeButton} from './close-button.svg';

// えらってるけど無視していいかも
import addFolder from './add-folder.svg';
import addFile from './add-file.svg';
import closeButton from './close-button.svg';
import textFileIcon from "./text-file.svg";
import folderIcon from "./folder.svg";

export interface iExplorer {
  id: string;
  name: string;
  isFolder: boolean;
  path: string;
  items: iExplorer[];
};

const filenameRegexp = /^([A-Za-z0-9\-\_\.]+)\.([a-zA-Z0-9]{1,9})$/;

export const isFilenameValid = (path: string): boolean => {
    return filenameRegexp.test(path);
};

const foldernmaeRegexp = /^[^\\\/?%*:|"'=^<>\.]+$/;

export const isFolderNameValid = (name: string): boolean => {
    return foldernmaeRegexp.test(name);
};

interface iProps {
  nestDepth: number;
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
  explorer, nestDepth,
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


    if (explorer.isFolder) {
      return (
        <div>
          <div>
              <div className="treeColumn" 
                style={{ paddingLeft: `${nestDepth * 2.4}rem`}}
              >
                <div className="TreeItem" onClick={() => setExpand(!expand)}>
                  <TreeColumnIconName explorer={explorer} />
                  <div className="TreeItem--function">
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
              </div>
            </div>
          <div 
            // temporary:
            // style={{ display: expand ? "block" : "none" }}
            style={{ display: "block" }}
          >
            {showInput.visible && (
              <div className="treeColumn"
                style={{ paddingLeft: `${nestDepth * 2.4}rem`}}
              >
                <div className="inputContainer">
                  <div className="inputContainer--column">
                    <span className="treeColumn-icon-name--icon">
                      {showInput.isFolder ? <img src={folderIcon} alt="folder icon" /> : <img src={textFileIcon} alt="text file icon" />}
                    </span>
                    <input
                      type="text"
                      className={"inputContainer--input" + " " + (isNameValid ? "__valid" : "__invalid")}
                      onKeyDown={(e) => onAddItem(e, explorer.path)}
                      onBlur={() => setShowInput({ ...showInput, visible: false })}
                      onChange={(e) => handleNewItemNameInput(e, explorer.isFolder)}
                      autoFocus
                      placeholder={explorer.isFolder ? defaultNewDirectoryName : defaultNewFileName}
                    />
                  </div>
                  <div className={"inputContainer--validSign" + " " + (isNameValid ? "__valid" : "__invalid")}>{isNameValid ? "Name is valid" : "Name is invalid"}</div>
                </div>
              </div>
            )}
            {explorer.name === "temporary" && (
              <div className="treeColumn"
                style={{ paddingLeft: `${nestDepth * 2.4}rem`}}
              >
                <div className="inputContainer">
                  <div className="inputContainer--column">
      <div style={{ display: "inline-block", verticalAlign: "middle" }}>
                    <span className="treeColumn-icon-name--icon">
                      {showInput.isFolder ? <img src={folderIcon} alt="folder icon" /> : <img src={textFileIcon} alt="text file icon" />}
                    </span>
      </div>
                    <input
                      type="text"
                      className={"inputContainer--input" + " " + (isNameValid ? "__valid" : "__invalid")}
                      onKeyDown={(e) => onAddItem(e, explorer.path)}
                      onBlur={() => setShowInput({ ...showInput, visible: false })}
                      onChange={(e) => handleNewItemNameInput(e, explorer.isFolder)}
                      autoFocus
                      placeholder={explorer.isFolder ? defaultNewDirectoryName : defaultNewFileName}
                    />
                  </div>
                  <div className={"inputContainer--validSign" + " " + (isNameValid ? "__valid" : "__invalid")}>{isNameValid ? "Name is valid" : "Name is invalid"}</div>
                </div>
              </div>
            )}
            {explorer.items.map((exp: iExplorer) => {
              const nd = nestDepth + 1;
              return (
                <Tree
                  key={exp.id}
                  handleInsertNode={handleInsertNode}
                  handleDeleteNode={handleDeleteNode}
                  handleReorderNode={handleReorderNode}
                  explorer={exp}
                  nestDepth={nd}
                />
              );
            })}
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="treeColumn" style={{ paddingLeft: `${nestDepth * 2.4}rem`}}>
            <div className="TreeItem">
              <TreeColumnIconName explorer={explorer} />
              <div 
                onClick={onDelete} 
                className="TreeItem--function"
              >
                <img src={closeButton} alt="delete file" />
              </div>
            </div>
          </div>
        </div>
      );
    }
  };


export default Tree;
