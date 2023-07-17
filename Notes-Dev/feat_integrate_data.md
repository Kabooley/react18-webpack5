# Integrate file data

fileexplorerとmonaco-editorの両者の前提とするファイルデータを統合する。

`files: File[]`を基に、FileExplorer, monaco-editorのmodel、tabsが生成され、

FileExplorer, monaco-editor, tabsの変更はfilesへ反映され、

全体が変更された`files`を基に再レンダリングされるようにする 

## やること

- 次の通り`files: File[]`を基にレンダリングされるように各コンポーネントの状態管理を`files`に基づかせる。

```bash
src/data/files.ts::files
  --> src/context/FilesContext.tsx::files:File[]
  # files.map(f => new File(f))
    --> src/components/Explorer/index.tsx::explorerData:iExplorer
    # const files: File[] = useFiles()
    # const explorerData: iExplorer = generateTreeNodeData(files);
    # Render FileExplorer Tree

    --> src/components/MonacoContainer.tsx
    # const files: File[] = useFiles()
      --> src/components/Editor/MonacoEditor.tsx
      # props.files
      # generate models according to props.files
      # Render model

    --> src/components/Tabs
    # const files: File[] = useFiles()

``` 

- 済）FileExplorerへReducer+Contextを導入したので完全に機能しているのかのテスト
- 済）Tabs.tsxが`files`を直接インポートしているのでこれをcontext経由にさせる
- 済）MonacoContainer.tsxが`files`を直接インポートしているのでこれをcontext経由にさせる
- [Explorer: アイテム追加フォームへ入力している段階でファイル/フォルダ名が有効か無効を判断させる](#Explorer:-アイテム追加フォームへ入力している段階でファイル/フォルダ名が有効か無効を判断させる)
- fileのsave機能
- tabsでの変更のfilesへの反映
- monaco-editorでの変更のfilesへの反映(file編集内容 --> File --> fileへ反映)
- Explorerで開いているフォルダは開いていることがわかる見た目にする
- Explorerで変更が起こったら「整列」させる機能（新規フォルダ追加とか）
- File.setPath()などするとき、既存のpathと被っていないか検査する
- File.setPath()などするとき、path文字列が無効な文字列でないか検査する

このブランチと関係ないけど...

- Explorerはリサイズすると再レンダリングされているのでリサイズでは再レンダリングしないようにしたい（低優先
- tabsのうちエディタに表示中のファイルのタブは見えるところに表示させる
- tabsのdnd
- tabsは初期表示させたいファイル以外は表示しないようにする
- tabsに閉じるボタンをつけて閉じる機能をつける
- fileexplorerでdrop不可能領域はホバー時点でわかるようにする
- fileExplorerで開いているフォルダは開いているのが見た目でわかるようにする
- fileExplorerでアイテムを削除するときに確認をとる。（モーダル表示？）
- previewのview決定
- アンダーバーの追加(参考：snack)

## やったこと

- filesを基にFileExplorer, monaco-editor, tabsが生成されるようにした
  Reducer + Context
- FileExplorerでの変更がfilesへ反映されるようにできたはず


## 情報収集

ディスカッション：

https://github.com/microsoft/monaco-editor/issues/1635

monaco-editor向けなfile explorer:

https://github.com/BlueMagnificent/monaco-tree/tree/master/src

- [pathからtreeを構成する](#pathからtreeを構成する)

## データ統合

monaco-editor:

```TypeScript
// files.ts
export interface iFile {
    path: string;
    language: string;
    value: string;
};

// explorerData.ts
export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
};
```

## pathからtreeを構成する

https://github.com/BlueMagnificent/monaco-tree/blob/master/src/monaco-tree/tree-generator.js

https://github.com/BlueMagnificent/monaco-tree/blob/master/src/monaco-tree/directory-listing.js

より。

pathからtreeオブジェクトを生成することをやってのけている。

これを解読し模倣する。

```JavaScript
// path情報
const directoryListing =  [
    'changelog.txt', 'debug.js', 'license.txt', 'package.json', 
    'readme.md', 'release.js', 'controllers/api.js', 
    'controllers/chat.js', 'controllers/default.js', 
    // 中略...
    'public/templates/users.html'
];

// 上がこうなる...
TreeNode {
    key: "1",
    name: "root",
    isDirectory: true,
    children: [
        {
            key: "2"
            name: "controllers"
            isDirectory: true
            children: Array(3)
            parent: TreeNode
            isDescendantOf: ƒ () {}
        },
        // 同様のものがいくつか続く...
    ],
    parent: null,
    isDescendantOf: ƒ () {},
}
```

1. まずpathをソートして昇順にする。

2. フォルダノードを作る

```TypeScript
//create the folders
// 
// 例："public/css/bootstrap.min.css"
entries.forEach((pathStr, ind) => {

    const pathArr = pathStr.split('/'); // ["public", "css", "bootstrap.min.css"]
    const pathLen = pathArr.length;     // 2
    let current: TreeNode = rootNode;   // "root"


    for(let i = 0; i < pathLen; i++){
        let name = pathArr[i];
        let index = i;
        
        // `current.children`にいなかったら新規にノードを生成する
        let child = current.children.find(el => el.name === name);

        if(child === undefined && index < ( pathLen - 1) ){
            
            currentKey = currentKey += 1;
            child = new TreeNode( `${currentKey}`, name, true,  current );
            current.children.push(child);   
        }
        // make child the current tree node
        current = child!;
    }
});
```
ループ内容）
i:0
current:"root"
name: "public"
    `"root/public"は存在しない && i < (pathLen -1)` を満たすか？
    満たす: "public"ノードの生成
    new TreeNode("1", "public", true, "root");
    "root.children"へ"public"追加

current: "root" --> "root/public"へ。

i: 1
current: "root/public"
name: "css"
    `"root/public/css"は存在しない && i < (pathLen -1)` を満たすか？
    満たさない: "root/public/css"ノードの生成
    new TreeNode("2", "css", true, "root/public");
    "root/public.children"へ"css"追加

current: "root/public" --> "root/public/css"へ。

i: 2
current: "root/public/css"
name: "bootstrap.min.css"
    `"root/public/css/bootstrap.min.css"は存在しない && i < (pathLen -1)` を満たすか？
    満たさない

ループ終了。

なので`pubcli/css/bootstrap.min.css`のパスを分解して配列にした場合、
一番最後の要素だけ生成しないで終える。

つまり

**一番最後の要素はフォルダではないという前提で動いている。**


3. ファイルノードを作る



#### filesを直接state管理する方法をとってみる

現状:
```bash

files --> filesProxy
--> filesProxy.getAllPaths()
--> state.explorerData = generateTreeNode(filesProxy.getAllPaths())
--> rendering according to generated node
```

これだと、state管理しているのはiExplorerのデータで、

filesから変換したiExplorerのデータを、dndを反映するため、またfilesへ反映させるという逆方向の変換を実現しなくてはならない。

検討:

```bash

files --> new copied files
--> state.new copied files
--> generateTreeNode(state.new copied files paths)
--> rendering according to generated Node
```

要はtree nodeは常にレンダリング時に生成されるようにすればよい

これなら、たとえばdndの変更も直接filesを変更させることができる


前提：

- iExplorer.pathの追加
- iFile.isFolderの追加
- filesは必ずフォルダとファイルを区別すること


##### generateTreeNodeData()をアップデート

`files: File[]`を基にtree nodeを生成する。

新機能：空フォルダを受け付けるようになった。

- TODO: iExplorer.pathはオプショナルから必須にすること
- TODO: iFile.isFolderは必須にすること

```TypeScript
// condesandbox::vanilla typescript::index.tsへそのまま貼り付けて確認可能

export interface iFile {
  path: string;
  language: string;
  value: string;
  // 
  // new added
  // 
  isFolder: boolean
};

export interface iExplorer {
  id: string;
  name: string;
  isFolder: boolean;
  items: iExplorer[];
  // 
  // NOTE: new added: オプショナルなのは
  // 
  path: string;
}

export class File {
  constructor(
      private _path: string,
      private _value: string,
      private _language: string,
      private _isFolder: boolean,
  ){};

  isPathValid(path: string): boolean {
      // TODO: make sure path is valid
      return true;
  };

  setPath(path: string) {
      // TODO: make sure path is not include non exist folder
      if(this.isPathValid(path)){
          this._path = path;
          // TODO: change this._language according to path files extension.
      }
  };

  setValue(value: string) {
      this._value = value;
  };

  getPath(): string {
      return this._path;
  };

  getValue(): string {
      return this._value;
  };

  isFolder(): boolean {
      return this._isFolder;
  };
};


export const generateTreeNodeData = (
    entries: File[] = [], 
    root: string = "root"
): iExplorer => {


    entries.sort(function(a: File, b: File) {
        let aPath = a.getPath().toLowerCase(); // ignore upper and lowercase
        let bPath = b.getPath().toLowerCase(); // ignore upper and lowercase
        if (aPath < bPath)  return -1;
        if (aPath > bPath) return 1;
        return 0;
    });

    let currentKey = 1;
    const rootNode = {
        id: `${currentKey}`,
        name: root,
        isFolder: true,
        items: [],
        path: "/"
    };


    //create the folders
    entries.forEach((entry: File) => {
        
        if(entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;  

        for(let i = 0; i < pathLen; i++){
            let name = pathArr[i];
            let index = i;
            
            // If the child node doesn't exist, create it
            let child = current.items.find(item => item.name === name);

            // if(child === undefined && index < ( pathLen - 1) && entry.isFolder()){
            if(child === undefined && index < ( pathLen - 1)){
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: true,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/')
                };
                current.items.push(child);
            }
            current = child!;
        }
    });


    //create the files
    entries.forEach((entry: File) => {

        if(entry.isFolder()) return;
    
        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode; 
    
        if(pathLen === 1){
            let name = pathArr[0];
            currentKey = currentKey += 1;
            let node = {
                id: `${currentKey}`,
                name: name,
                isFolder: false,
                items: [],
                path: pathArr[0]
            };
            current.items.push(node);
            return;
        }  
        
        pathArr.forEach( (name, index) => {
            let child = current.items.find(item => item.name === name);

            if(child === undefined && index === ( pathLen - 1)){
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: false,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/')
                };
                current.items.push(child);
            }
            else if( child === undefined ){
                return;
            }
            else
            {
                current = child;
            }
        });
    });

    /**
     * Generate empty folders.
     * 
     * NOTE: Run below loop after finishing generate non-empty folders and files.
     *  
     * */ 
    entries.forEach((entry: File) => {

        if(!entry.isFolder()) return;
    
        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode; 

        console.log('entry:');
        console.log(entry);
    
        pathArr.forEach( (name, index) => {
            
          console.log(`loop: ${index}`);
          console.log(`name: ${name}`);
          console.log(`pathArr: ${pathArr}`);
          console.log(`current`);
          console.log(current);

            let child: iExplorer | undefined = current.items.find(item => item.name === name);

            if(child === undefined && index === ( pathLen - 1)){
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: pathArr[index - 1],
                    isFolder: true,             // As this is folder.
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/')
                };
                current.items.push(child);
            }
            else if( child === undefined ){
                return;
            }
            else
            {
                current = child;
            }
        });
    });

    return rootNode;
};




const files: iFile[] = [
  {
    path: 'public',
    language: '',
    value: '',
    isFolder: true
  },
  {
    path: 'public/index.html',
    language: 'html',
    value: `<!DOCTYPE html>\r\n<html>\r\n<head>\r\n<meta charset="utf-8" />\r\n<title>Monaco Editor Sample</title>\r\n</head>\r\n<body>\r\n<div id="root"></div>\r\n</body>\r\n</html>`,
    isFolder: false
  },
  {
    path: 'public/js',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'public/js/default.js',
      language: 'javascript',
      value: `var val = "This is public/js/default.js";`,
      isFolder: false
  },
  {
      path: 'public/js/jctajr.min.js',
      language: 'javascript',
      value: `var val = "This is public/js/jctajr.min.js";`, 
      isFolder: false
  },
  {
    path: 'public/css',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'public/css/default.css',
      language: 'css',
      value: `html {\r\n// This defines what 1rem is\r\nfont-size: 62.5%; //1 rem = 10px; 10px/16px = 62.5%\r\n}`,
      isFolder: false
  },
  {
    path: 'src',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'src/vanilla.ts',
      language: 'typescript',
      value: `const jungleBeats: string = "Holla at me, boo";`,
      isFolder: false
  },
  {
    path: 'src/react',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'src/react/some.jsx',
      language: 'javascript',
      value: ``,
      isFolder: false
  },
  {
      path: 'src/index.tsx',
      language: 'typescript',
      value: `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`,
      isFolder: false
  },
  {
    path: 'src/temporary/',
    language: '',
    value: '',
    isFolder: true
  },
  {
    path: 'temporary/',
    language: '',
    value: '',
    isFolder: true
  },
];

(function() {
  const FILES: File[] = files.map(f => new File(f.path, f.value, f.language, f.isFolder)); 
  const tree = generateTreeNodeData(FILES, "root");
  console.log(tree);
})();

```

#### AddFolder AddFile

Tree.tsx::handleNewItem()::setShowInput as true::onAddItem::handleInsertNode

`handleInsertNode(explorer.id, isFolder)`

explorer.id: 追加先となるexplorerのid

isFolder: 追加するアイテムはフォルダかファイルかの識別子

explorer.idは`explorerData`のなかでしか通用しないidなのでfilesでは通用しない。

そのためpathで識別するほかない。

`handleInsertNode(parentNodePath: string = explorer.path, isFolder: boolean = parameterFromOnAddItem)`

filesへ新規アイテムを追加するにあたって。

- 新規アイテムは既に存在していないか?
- 存在していないpathを経由していないか?(存在しないフォルダが挟まっているとか)


```TypeScript
//
const handleInsertNode = (requiredPath: string, isFolder: boolean): void => {
    // NOTE: 常に新しい配列をsetstateすること
    //
    // make sure requiredPath is already exist.
    if(getFilesPath(baseFiles).find(p => p === requiredPath)) {
        throw new Error("[handleInsertNode] The required path is already exist");
    }
    const _files = baseFiles.map(f => f);
    setFiles([
      ..._files,
      new File(requiredPath, "", getFileLanguage(requiredPath), isFolder)
    ]);
};

type Language = 'javascript' | 'typescript' | 'json' | 'css' | 'html' | 'markdown';

// Move this method to utils/
// https://stackoverflow.com/a/190878
const getFileLanguage = (path: string): Language | undefined => {
  if(path.includes('.')) {
    switch (path.split('.').pop()) {
          case 'js':
            return 'javascript';
          case 'ts':
          case 'tsx':
            return 'typescript';
          case 'json':
            return 'json';
          case 'css':
            return 'css';
          case 'html':
            return 'html';
          case 'md':
            return 'markdown';
          default:
            return undefined;
        }
    }
  return undefined;
};
```

どうせ setFiles を呼び出したら再レンダリングされるので、explorerData は state 管理する必要がない

```TypeScript
// Before
export default function FileExplorer() {
  // NOTE: 配列を扱うので常に新しい配列を返すこと
  const [baseFiles, setFiles] = useState<iFile[]>(files);
  // NOTE: setExplorerDataの引数は必ずbaseFilesでなくてはならない。
  const [explorerData, setExplorerData] = useState(generateTreeNodeData([], "root"));

  useEffect(() => {
    setExplorerData(generateTreeNodeData(getFilesPaths(baseFiles), "root"));
  }, []);

  useEffect(() => {
    setExplorerData(generateTreeNodeData(getFilesPaths(baseFiles), "root"));
  }, [baseFiles]);

  // ...
}

// After
export default function FileExplorer() {
  // NOTE: 配列を扱うので常に新しい配列を返すこと
  const [baseFiles, setFiles] = useState<iFile[]>(files);

  // 毎レンダリングで必ずbaseFilesを元にexplorerDataは更新される
  const explorerData = generateTreeNodeData(getFilesPaths(baseFiles), "root");

  // ...
}
```


#### Deletion and Reorder Functions

NOTE: handleDeleteNode, handleReorderNodeテスト完了。アプリケーションへ反映済。

TEST: codesandbox

```TypeScript
import { File, files } from './files';
import { generateTreeNodeData } from './generateTreeNodeData';
import { iExplorer } from './explorerData';
import { isNodeIncludedUnderExplorer, getNodeById, getParentNodeByChildId } from "./helper";



const getAllDescendants = (_explorer: iExplorer): iExplorer[] => {
  const descendants: iExplorer[] = [];

  function getAllDescendantsRecursively(exp: iExplorer) {
      exp.items.forEach(item => {
          descendants.push(item);
          if(item.items.length) {
              getAllDescendantsRecursively(item);
          }
      });
  };

  getAllDescendantsRecursively(_explorer);

  return descendants;
};


const baseFiles: File[] = files.map(f => new File(f.path, f.value, f.language, f.isFolder));
const explorerData = generateTreeNodeData(baseFiles, "root");



const handleDeleteNode = (_explorer: iExplorer) => {
  const isDeletionTargetFolder = _explorer.isFolder;
  const descendantPaths: string[] = getAllDescendants(_explorer).map(d => d.path) as string[];

  console.log('[handleDeleteNode] descendants:');
  console.log(descendantPaths);

  const deletionTargetPathArr = _explorer.path.split('/'); // 例：`public/css`

  console.log('[handleDeleteNode] deletionTartgetPathArr');
  console.log(deletionTargetPathArr);

  const updatedFiles: File[] = baseFiles.filter(f => {
      // In case deletion target is folder and f is also folder.
      if(f.isFolder() && isDeletionTargetFolder) {
        const comparandPathArr = f.getPath().split('/');
        if(deletionTargetPathArr.length > comparandPathArr.length) return true;
        
        
        let completeMatch: boolean = true;
        deletionTargetPathArr.forEach((p, index) => {
          completeMatch = (p === comparandPathArr[index]) && completeMatch;
        });

        console.log(comparandPathArr);
        console.log(completeMatch);

        return completeMatch ? false : true;
      }
      // In case deletion target is a file, not any folder.
      else if(!descendantPaths.length){
        return f.getPath() !== _explorer.path; 
      }
      // In case deletion target is folder but f is not folder.
      return descendantPaths.find(d => d === f.getPath())
        ? false : true;
  });

  return updatedFiles;
};

const handleReorderNode = (droppedId: string, draggableId: string): void => {
  
  if(droppedId === draggableId) { return; }

  // Check if the dropped area is under dragging item
  if(isNodeIncludedUnderExplorer(explorerData, droppedId, draggableId)){
    return;
  }

  const movingItem: iExplorer = getNodeById(explorerData, draggableId);
  const droppedArea: iExplorer = getNodeById(explorerData, droppedId);
  const movingFile: File | undefined = baseFiles.find(b => b.getPath() === movingItem.path);
  // NOTE: droppedAreaがfolderである場合とない場合の2通りに対処する。
  const appendPath = (droppedArea.isFolder ? droppedArea.path : getParentNodeByChildId(explorerData, droppedArea.id).path) + '/';

  if(movingFile === undefined) throw new Error("Something went wrong but File cannot be found by draggableId.");

  console.log("[handleReorderNode] movingItem:");
  console.log(movingItem);
  console.log("[handleReorderNode] dropped area:");
  console.log(droppedArea);

  // movingItemがフォルダである、空フォルダである、ファイルであるの３通りに対処する。
  //
  // なんか空フォルダの場合とファイルの場合は区別しなくていいなぁ
  if(movingItem.isFolder) {
    // movingItemがフォルダである場合、そのフォルダ以下のすべてのアイテムのパスを変更する


    let descendantPaths = getAllDescendants(movingItem).map(d => d.path) as string[];
    const isFolderEmpty = descendantPaths.length ? false : true;

    if(!isFolderEmpty) {
      console.log("[handleReorderNode] draggable item is folder");
      // movingItemが空フォルダでない場合：

      // By pushing item, no longer `descendantPaths` is not descendant paths.
      // But keep the name in this scope.
      descendantPaths.push(movingFile.getPath());
      const movingFilePathArr = movingFile.getPath().split('/');
      const reorderingFiles = baseFiles.filter(f => descendantPaths.find(d => d === f.getPath()) );
      const restFiles = baseFiles.filter(f => descendantPaths.find(d => d === f.getPath()) === undefined ? true : false);

      const updatedFiles: File[] = [
        ...restFiles, 
        ...reorderingFiles.map(r => {
          r.setPath(appendPath + r.getPath().split('/').slice(movingFilePathArr.length - 1, r.getPath().length).join('/'));
          return r;
        })
      ];
      console.log("updatedFiles: ");
      updatedFiles.forEach(u => console.log(u.getPath()));
    }
    else {
      // movingItemが空フォルダの場合：
      console.log("[handleReorderNode] draggable item is empty folder");
      const updatedFiles: File[] = baseFiles.map(f => {
        if(f.getPath() === movingFile.getPath()){
          f.setPath(appendPath + movingFile.getPath().split('/').pop());
        }
        return f;
      });
      
      console.log("updatedFiles: ");
      updatedFiles.forEach(u => console.log(u.getPath()));
    }
  }
  else {
    console.log("[handleReorderNode] draggable item is NOT folder");
    const updatedFiles: File[] = baseFiles.map(f => {
      if(f.getPath() === movingFile.getPath()){
        f.setPath(appendPath + movingFile.getPath().split('/').pop());
      }
      return f;
    });
    
      console.log("updatedFiles: ");
      updatedFiles.forEach(u => console.log(u.getPath()));
  }
};

  (function() {
    console.log(explorerData);
    // const parent = getNodeById(explorerData, "12");
    // console.log("parent:");
    // console.log(parent);
    // const updatedFiles: File[] = parent && handleDeleteNode(parent);
    // console.log("baseFiles:");
    // console.log(baseFiles);
    // baseFiles.forEach(b => console.log(b.getPath()));
    // console.log("[hanldeDeleteNode] updatedFiles: ");
    // console.log(updatedFiles);
    // updatedFiles.forEach(u => console.log(u.getPath()));

    // TEST: handleReorderNode(): drop "14" on "4"
    baseFiles.forEach(b => console.log(b.getPath()));
    handleReorderNode("8", "11");
  })();
  
```

```bash
# 両者ともにfolderである
case dropped.isFolder && draggable.isFolder:
    descendants: [...]
    draggableFile.path = "droppedFile.path + draggaleFile.path"
    apply it to all descendants
# dropped areaはフォルダではなくdraggableはフォルダである
case !dropped.isFolder && draggable.isFolder:
    descendants: [...]
    draggableFile.path = "droppedFile's_parent.path + draggaleFile.path"
    apply it to all descendants
# dropped areaがフォルダでdraggableはフォルダじゃない
case dropped.isFolder && !draggable.isFolder:
    descendants: []
    draggableFile.path = "droppedFile.path + draggaleFile.path"
# 両者ともにフォルダでない
case !dropped.isFolder && !draggable.isFolder:
    descendants: []
    draggableFile.path = "droppedFile's_parent.path + draggaleFile.path"
```

pathの適切な変更のために:

draggableItemがフォルダで、空フォルダでない場合は

pathの変更を適用させるのが面倒。

`src/public`
`src/public/css/default.css`
`src/public/js/script.js`
`src/public/index.html`

というファイルがあって、draggableItemが`src/public`の場合

他のアイテムは

`dropped-area-path` + `/public`
`dropped-area-path` + `/public/css/default.css`
`dropped-area-path` + `/public/js/script.js`
`dropped-area-path` + `/public/index.html`

となるはずである。

## Editor, Tabs, Explorerの統合

filesのデータを基に成立するようになった。

今、

- Explorer/index.tsx: `state.baseFile: File[]`
- Editor/index.tsx: `files`
- Tabs.tsx: `files`

で、現状fileへの変更はexplorer内部にしか反映されていない。

（Explorer/index.tsx::handleDeleteNode, handleReorderNode, handleInsertNodeはstate.baseFileを変更するだけ）

これをもっと上位へもっていき、filesの変更に伴って全体が再レンダリングされるように変更を。

```bash
Layout
    Pane
        PaneSection
            FileExplorer
    EditorSection
        MonacoContainer
            Tabs
            MonacoEditor
```

このため、Layoutからfilesのデータをバケツリレーしていくことになる。


#### [React Tips] management of object array in state

https://stackoverflow.com/questions/26253351/correct-modification-of-state-arrays-in-react-js

https://stackoverflow.com/questions/49477547/setstate-of-an-array-of-objects-in-react

https://react.dev/learn/updating-arrays-in-state

stateで配列を管理する場合：

- state.arrayをstate.array[0] = "changed"のように直接変更するな

- state.arrayには常に新しい配列を与えよ。

#### [React] Managing State

https://react.dev/learn/managing-state

Thingking about UI declaretively:

- コンポーネントの見た目が異なる状態を区別すること
- 何がそれらの状態を変更させるのか定義すること
- `useState`を使って状態を表現すること
- 非必須なstateを取り除くこと
- stateにイベントハンドラを接続すること




#### [React] Passing Data Deeply with Context

https://react.dev/learn/passing-data-deeply-with-context

シンプルな使い方だと一方通行に値を渡すことになる。

ネストされたコンポーネントがcontextの値を変更したい場合：

https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component

値と関数を渡す。

## File state management

Reducer + Contextの`FilesContext.tsx`の生成を行った。

これにてfilesを好きなコンポーネントから読み取り可能となり、

深いネストされたコンポーネントから変更のdispatchを送信できるようになった。

#### TEST FilesContext.tsx

ほとんどgenerateTreeNode.tsxの修正であった。

#### ADD_FILE

問題なし。

ただし2件について要修正：

- generateTreeNode.tsxで新規アイテム追加するとexplorer.nameがおかしくなる件。
- ユーザが悪意のある文字を含ませる可能性があるため入力内容が有効かチェックする機能が必要。

修正１：

```diff
// generateTreeNode.tsx
entries.forEach((entry: File) => {

    if(!entry.isFolder()) return;

    const pathArr = entry.getPath().split('/');
    const pathLen = pathArr.length;
    let current: iExplorer = rootNode; 

    pathArr.forEach( (name, index) => {

        let child: iExplorer | undefined = current.items.find(item => item.name === name);

        if(child === undefined && index === ( pathLen - 1)){
            currentKey = currentKey += 1;
            child = {
                id: `${currentKey}`,
-               name: !index ? pathArr[0] : pathArr[index - 1],
+               name: !index ? pathArr[0] : pathArr[index],
                isFolder: true,             // As this is folder.
                items: [],
                path: pathArr.slice(0, index + 1).join('/')
            };
            current.items.push(child);
        }
        else if( child === undefined ){
            return;
        }
        else
        {
            current = child;
        }
    });
```

修正２：

[フォームへ入力している段階でファイル/フォルダ名が有効か無効を判断させる](#フォームへ入力している段階でファイル/フォルダ名が有効か無効を判断させる)



#### CHANGE_FILE, CHANGE_MULTIPLE_FILE

fileのpath変更問題なし。


#### DELETE_FILE, DELETE_MULTIPLE_FILE

問題なし。

## Explorer: アイテム追加フォームへ入力している段階でファイル/フォルダ名が有効か無効を判断させる

VSCodeの仕様に寄せる。

- rootフォルダは通常のTreeとは異なるコンポーネントにする
- file, folder共通のカラムコンポーネントを作る
- 入力中はファイル名・フォルダ名が無効の時だけユーザ向けにエラー表示させる
- 無効な入力の時はエンタキーを押しても反応させない。
- 見た目はVSCodeと同じにする
- 開いているフォルダ・閉じているフォルダの見た目もVSCodeと同じにする

#### Create component common to file and folder

```TypeScript
interface iTreeColumnProps{
  explorer: iExplorer;
}
const TreeColumn = ({
  explorer,
}: iTreeColumnProps) => {

  const fileType = explorer.isFolder ? "folder" : "file";
  return (
    <div className={fileType}>
      <TreeFunctions />
    </div>
  )
};

interface iTreeFunctionsProps {
  explorer: iExplorer;
  handleNewItem: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDelete: () => void;
};

const TreeFunctions = ({
  explorer, handleNewItem, onDelete
}: iTreeFunctionsProps) => {

  if(explorer.isFolder) {
    return (
      <div className="folder--function">
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
    );
  }
  else {
    return (
      <div 
        onClick={onDelete} 
        className="file--function"
      >
        <img src={closeButton} alt="delete file" />
      </div>
    );
  }
};
```

## 実装：新規アイテム生成時のinputフォームバリデータ

Pane幅: xとして...

---

NOTE: 大前提

inputContainer--validSign width: 100% === div.inputContainer witdth

例：

inputContainer width: 168px

inputContainer width = inputContainer padding-left 8px
                     + icon element width 21.41px in thic case
                     + gap 5px
                     + inputContainer--input witdh 133.6px

inputContainer widthはinputcontainer--validSign width 100%と同じとのことなので、

```css
/* これでうまくいった */

/* 
前提：width: 100% === inputContainer width
0.8rem: inputCotnainer padding-left
21.41px: icon element width
5px: gap between icon element and input element
*/
.inputContainer--validSign {
    width: calc(100% - 0.8rem - 21.41px - 5px);
    position: absolute;
    margin-left: calc(21.41px + 5px);
```

TODO: なぜかinputContainer--validSignにstyleが適用されない件の修正
TODO: icon要素の追加とサイズの固定化
TODO: file要素のfilenameが、paneをリサイズすると真ん中に配置されるのでこれを左詰めになるよう修正