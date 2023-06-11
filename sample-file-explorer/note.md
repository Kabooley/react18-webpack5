# Note: Build ReactJS File Explorer

https://www.youtube.com/watch?v=20F_KzHPpvI&t=883s

## buisiness logic

isFolder: trueならitemsに何かしらフォルダまたはファイルを抱えることになっている構造。

```TypeScript
export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
  }
  
  const explorer: iExplorer = {
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
            id: "3",
            name: "public nested 1",
            isFolder: true,
            items: [
              {
                id: "4",
                name: "index.html",
                isFolder: false,
                items: []
              },
              {
                id: "5",
                name: "hello.html",
                isFolder: false,
                items: []
              }
            ]
          },
          {
            id: "6",
            name: "public_nested_file",
            isFolder: false,
            items: []
          }
        ]
      },
      {
        id: "7",
        name: "src",
        isFolder: true,
        items: [
          {
            id: "8",
            name: "App.js",
            isFolder: false,
            items: []
          },
          {
            id: "9",
            name: "Index.js",
            isFolder: false,
            items: []
          },
          {
            id: "10",
            name: "styles.css",
            isFolder: false,
            items: []
          }
        ]
      },
      {
        id: "11",
        name: "package.json",
        isFolder: false,
        items: []
      }
    ]
  };
  
  export default explorer;

```

## 処理の流れ


`explorerData`,
`handleInsertNode`

#### `handleInsertNode`

- Folder.index.tsx::onAddFolder()で呼び出される、新規フォルダまたはファイル追加の為の関数
- App.state.explorerDataを更新する
- explorerDataの現在のidのitemsの配列の頭に新たなdataを追加する

```TypeScript
export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);

  const { insertNode } = useTraverseTree();

  const handleInsertNode = (folderId: string, item: string, isFolder: boolean) => {
    const finalTree = insertNode(explorerData, folderId, item, isFolder);
    setExplorerData(finalTree);
  };

  return (
    <div className="App">
      <Folder handleInsertNode={handleInsertNode} explorer={explorerData} />
    </div>
  );
}
```
```JavaScript
const explorer: iExplorer = {
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
            id: "3",
            name: "public nested 1",
            isFolder: true,
            items: [
                {
                id: "4",
                name: "index.html",
                isFolder: false,
                items: []
                },
                {
                id: "5",
                name: "hello.html",
                isFolder: false,
                items: []
                }
            ]
            },
            {
            id: "6",
            name: "public_nested_file",
            isFolder: false,
            items: []
            }
        ]
        },
        {
            // 省略...
        }
    ]
};

```

例：以下のような引数で呼び出した場合の処理の流れ

```TypeScript
// explorerData.id: 7のオブジェクトのitems[]へ新規のフォルダを追加する
handleInsertNode("7", "newInSrc", true);
```

```
insertNode(explorerData, 7, "newInSrc", true);
    tree.id:1, folderId: 7, tree.idFolder: true // explorerData.id:1と比較
    // 結果、偽
    insertNode(tree.id:1::items[0], 7, "newInSrc", true);
        tree.id: 2, folderId: 7, tree.idFolder: true    // 偽
        insertNode(tree.id:2::items[0], 7, "newInSrc", true);
            // tree.idが7と一致するまで繰り返す...

            // 一致したらtree.items.unshift()して新規のアイテムを追加し、return tree。
            // mapによる再帰呼出の真っ最中なので終わるまでループ
最終的にunshiftで追加したアイテムを反映した更新版treeを返す

```

これが更新処理の全容。

ならば...


## 実装：item削除処理

同様の処理で再利用できる

```TypeScript
  const useTraverseTree = () => {
    function insertNode(
      tree: iExplorer,
      folderId: string,
      item: string,
      isFolder: boolean
    ): iExplorer {
      // Add folder or file:
      if (tree.id === folderId && tree.isFolder) {
        console.log(`Generate new folder under ${folderId}`);
        tree.items.unshift({
          id: "" + new Date().getTime(),
          name: item,
          isFolder,
          items: []
        });
  
        return tree;
      }
  
      // update its tree's items property.
      let latestNode: iExplorer[] = [];
      latestNode = tree.items.map((ob) => {
        console.log("----");
        console.log(ob);
        console.log("----");
        return insertNode(ob, folderId, item, isFolder);
      });
  
      return { ...tree, items: latestNode };
    }
  
    // TODO: implement this yourself.
    const deleteNode = (
      tree: iExplorer,
      folderId: string, // 削除されるアイテムが含まれているフォルダのid
      deleteId: string, // 削除するアイテムのid
      item: string,
      isFolder: boolean
    ): iExplorer => {
      // Add folder or file:
      if (tree.id === deleteId) {
        console.log(`Delete item`);
        
        // TODO: 削除反映済のtreeを返す
        tree.items.pop()
  
        return tree;
      }
  
      // update its tree's items property.
      let latestNode: iExplorer[] = [];
      latestNode = tree.items.map((ob) => {
        console.log("----");
        console.log(ob);
        console.log("----");
        return insertNode(ob, folderId, item, isFolder);
      });
  
      return { ...tree, items: latestNode };
    };
  
    // TODO: implement this yourself.
    const updateNode = () => {};
  
    return { insertNode };
  };

```