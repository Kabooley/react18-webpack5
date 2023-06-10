import { useState } from "react";
import type { iExplorer } from '../../data/folderData';

interface iProps {
  explorer: iExplorer;
};

const Folder = ({ explorer }: iProps ) => {
  const [expand, setExpand] = useState<boolean>(false);

  if (explorer.isFolder) {
    return (
      <div style={{ marginTop: 5 }}>
        Folder
        <div className="folder" onClick={() => setExpand(expand!)}>
          <span>📁{explorer.name}</span>
        </div>
        <div style={{ display: expand ? "block" : "none" }}>
          {explorer.items.map((exp: iExplorer) => {
            return <Folder explorer={exp} />;
          })}
        </div>
      </div>
    );
  } else {
    return <span className="file">{explorer.name}</span>;
  }
};

export default Folder;
