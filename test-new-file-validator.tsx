import { useState } from 'react';
import "./styles.css";

export interface iExplorer {
  id: string;
  name: string;
  isFolder: boolean;
  items: iExplorer[];
};

const explorerData: iExplorer = {
  id: "1",
  name: "root",
  isFolder: true,
  items: [
    {
      id: "2",
      name: "public",
      isFolder: true,
      items: [
        {
          id: "5",
          name: "index.html",
          isFolder: false,
          items: []
        },
        {
          id: "6",
          name: "style.css",
          isFolder: false,
          items: []
        }
      ]
    },
    {
      id: "3",
      name: "src",
      isFolder: true,
      items: [
        {
          id: "7",
          name: "index.js",
          isFolder: false,
          items: []
        }
      ]
    },
    {
      id: "4",
      name: "assets",
      isFolder: true,
      items: []
    }
  ]
};



export default function Tree({explorer}:{
  explorer: iExplorer
}) {
  const [showInput, setShowInput] = useState<boolean>(true);
  const handleNewItem = () => {};
  const onDelete = () => {};
  const onAddItem = () => {};
  if(explorer.isFolder) {
  return (
    <div className="treeContainer">
    <div className="folder" >
      <span>📁 {explorer.name}</span>
      <div className="folder--function">
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            handleNewItem()
          }
        >
          <span>afl</span>
        </div>
        <div
          onClick={(e: React.MouseEvent<HTMLDivElement>) =>
            handleNewItem()
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
          onKeyDown={(e) => onAddItem()}
          autoFocus
        />
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

