import "./styles.css";
import type { iExplorer } from './Tree';
import Tree from './Tree';

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



export default function App() {
  return (
    <div className="App">
      <Tree explorer={explorerData} />
    </div>
  );
}
