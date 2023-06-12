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
import "./styles.css";


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



const useTraverseTree = () => {
  // 
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

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return insertNode(ob, folderId, item, isFolder);
    });

    return { ...tree, items: latestNode };
  }

  //
  const deleteNode = (
    tree: iExplorer,
    folderId: string, // 削除されるアイテムが含まれているフォルダのid
    itemId: string, // 削除するアイテムのid
  ): iExplorer => {

    if (tree.id === folderId) {
      console.log(`Delete item`);
      return {
        id: tree.id,
        name: tree.name,
        isFolder: tree.isFolder,
        items: tree.items.filter(item => item.id !== itemId)
      };
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return deleteNode(ob, folderId, itemId);
    });

    return { ...tree, items: latestNode };
  };

  // 
  const updateNode = (
    tree: iExplorer,
    folderId: string,
    item: string,
    isFolder: boolean
  ) => {
    if (tree.id === folderId && tree.isFolder) {
      // TODO: modify folder
      // possibly...
      // name of item is changed,
      // dnd to move file,
    }
    else if(tree.id === folderId && !tree.isFolder) {
      // TODO: mpdify file
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return updateNode(ob, folderId, item, isFolder);
    });

    return { ...tree, items: latestNode };

  };

  return { insertNode, deleteNode, updateNode };
};

(function() {
  // -- USAGE --
  const { insertNode, deleteNode, updateNode } = useTraverseTree();
  /*** 
   * どのフォルダに、何（フォルダなのかファイルなのか）を追加するのかを指定すれば
   * それを追加してくれる
   * 
   * @param {string} folderid - アイテム追加するフォルダのid
   * @param {string} item - 追加するアイテムの名前
   * @param {boolean} isFolder - フォルダかファイルか
   * */ 
  const handleInsertNode = (folderId: string, item: string, isFolder: boolean) => {
    // @return {iExplorer} finalTree - アイテム追加が反映されたexplorerデータ 
    const finalTree = insertNode(explorer, folderId, item, isFolder);
    console.log(finalTree);
  };

  /***** 
   * どのフォルダのどのアイテムなのか、idで指定すれば削除する
   * 
   * @param {string} folderId - 削除するアイテムを所有しているフォルダのid
   * @param {string} item - 削除するアイテムの名前
   * @param {string} itemId - 削除するアイテムの名前
   * @param {boolean} isFolder - 削除するアイテムはフォルダかファイルか   多分要らない。
   * */ 
  const handleDeleteNode = (folderId: string, itemId: string) => {
    const updatedTree = deleteNode(explorer, folderId, itemId);
    console.log(updatedTree);
  };

  // handleDeleteNode("7", "9");
})();
```
