import { useState } from 'react';
import "./styles.css";

export interface iExplorer {
  id: string;
  name: string;
  isFolder: boolean;
  items: iExplorer[];
};

const filenameRegexp = /^([A-Za-z0-9\-\_\.]+)\.([a-zA-Z0-9]{1,9})$/;

export const isFilenameValid = (path: string): boolean => {
    return filenameRegexp.test(path);
};

const foldernmaeRegexp = /^[^\\\/?%*:|"'<>\.]+$/;

export const isFolderNameValid = (name: string): boolean => {
    return foldernmaeRegexp.test(name);
};
  

export default function Tree({explorer}:{
  explorer: iExplorer
}) {
  const [expand, setExpand] = useState<boolean>(false);
  const [showInput, setShowInput] = useState({
    visible: false,
    isFolder: false
  });
  const [isNameValid, setIsNameValid] = useState<boolean>(false);

  const onDelete = () => {};

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
        // handleInsertNode(requiredPath, showInput.isFolder);
        setShowInput({ ...showInput, visible: false });
        setIsNameValid(false);
    }
  };

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

  if(explorer.isFolder) {
  return (
    <div className="treeContainer">
    <div className="folder" >
      <span>📁 {explorer.name}</span>
      <div className="folder--function">
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            handleNewItem(e, explorer.isFolder)
          }
        >
          <span>afl</span>
        </div>
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            handleNewItem(e, explorer.isFolder)
          }
        >
        <span>afi</span>
        </div>
        <div onClick={(e) => onDelete()}>
          <span>del</span>
        </div>
      </div>
    </div>
    <div 
      style={{ display: "block", paddingLeft: 25 }}
    >
      <div className="inputContainer">
        <span>{"📁"}</span>
        <input
          type="text"
          className="inputContainer__input"
          onKeyDown={(e) => onAddItem(e, "wherever")}
          onChange={(e) => handleNewItemNameInput(e, explorer.isFolder)}
          autoFocus
        />
        <div className={"inputContainer--validSign" + " " + (isNameValid ? "__valid" : "__invalid")}>{isNameValid ? "Name is valid" : "Name is invalid"}</div>
        </div>
      
      {explorer.items.map((exp: iExplorer) => {
        return (
          <Tree
            key={exp.id}
            explorer={exp}
          />
        );
      })}
    </div>
    </div>
    );
    } else {
    return (
      <div className="file">
        <span className="file--name">
          📄 {explorer.name}{" "}
        </span>
        <div 
          onClick={(e) => onDelete()} 
          className="file--function"
        >
        <span>del</span>
        </div>
      </div>
    );
  }
}

