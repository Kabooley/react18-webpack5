import "./styles.css";
import type { iExplorer } from "./Tree";
import Tree from "./Tree";

const explorerData: iExplorer = {
  id: "1",
  name: "root",
  isFolder: true,
  path: "///",
  items: [
    {
      id: "2",
      name: "public",
      isFolder: true,
      path: "///////",
      items: [
        {
          id: "5",
          name: "index.html",
          isFolder: false,
          items: [],
          path: "///////"
        },
        {
          id: "6",
          name: "style.css",
          isFolder: false,
          items: [],
          path: "///////"
        }
      ]
    },
    {
      id: "3",
      name: "src",
      isFolder: true,
      path: "///////",
      items: [
        {
          id: "7",
          name: "index.js",
          isFolder: false,
          items: [],
          path: "///////"
        },
        {
          id: "8",
          name: "react",
          isFolder: true,
          path: "///////",
          items: [
            {
              id: "9",
              name: "index.jsx",
              isFolder: false,
              items: [],
              path: "///////"
            }
          ]
        }
      ]
    },
    {
      id: "4",
      name: "assets",
      isFolder: true,
      items: [],
      path: "///////"
    },
    {
      id: "99",
      name: "temporary",
      isFolder: true,
      items: [],
      path: "///////"
    }
  ]
};

export default function App() {
  return (
    <div className="App">
      <Tree
        explorer={explorerData}
        nestDepth={0}
        handleDeleteNode={() => {}}
        handleInsertNode={() => {}}
        handleReorderNode={() => {}}
      />
    </div>
  );
}
