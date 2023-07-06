# Integrate file data

fileexplorerとmonaco-editorの両者の前提とするファイルデータを統合する。

- FileExplorerのファイルを(ダブル)クリックでmonaco-editorで表示する
- monaco-editorの前提ファイルをexplorerDataへ変換する処理

## やること

- iExplorerとiFileの連携

    どのexplorerがどのfileと同じものなのか現状区別できないため、
    fileの情報変更とexplorerの情報変更がお互い反映させることができない。


このブランチと関係ないけど...

- tabsのうちエディタに表示中のファイルのタブは見えるところに表示させる
- tabsのdnd
- fileexplorerでdrop不可能領域はホバー時点でわかるようにする

## やったこと

- filesデータはｵﾌﾞｼﾞｪｸﾄ型ではなく配列にした
- filesデータをマウント時にfilesProxy()が読取、データを管理しやすい形で扱うことにする。


## TODOs

- TODO: fileexplorer: dndしてdragIdとdropIdが同じ場合、dragしていたアイテムがexplorerから消える

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

```TypeScript
//create the files
entries.forEach(pathStr => {

    const pathArr = pathStr.split('/');
    const pathLen = pathArr.length;
    let current = rootNode; 

    // path配列の要素が一つだけなら問答無用でファイルノードとする
    if(pathLen === 1){

        let name = pathArr[0];
        currentKey = currentKey += 1;
        let node = new TreeNode( `${currentKey}`, name, false,  current );
        current.children.push(node);
        return;
    }  

    
    // Loop through the path to add files
    pathArr.forEach( (name, index) => {

        // If the child node doesn't exist, create it
        let child = current.children.find(el => el.name === name);

        // childが未定義（TreeNode未生成）かつpath配列の一番最後なら
        // fileノードを生成する
        if(child === undefined && index === ( pathLen - 1)){

            currentKey = currentKey += 1;
            child = new TreeNode( `${currentKey}`, name, false,  current );
            current.children.push(child);
        }
        else if( child === undefined ){
            return;
        }
        else
        {
            // make child the current tree node
            current = child;
        }
    });
});
```

という感じでそのまま流用できそうである。

## filesデータとeditor, explorerの連携

考えうる関連処理：

- explorerでファイルを移動など変更を行った場合に、filesデータをそれに合わせて更新
- 

```TypeScript
export const files: iFiles = {
    'javascript': {
        path: '/main.js',
        language: 'javascript',
        value: `var salute = "salute!!";`
    },
    'typescript': {
        path: '/main.ts',
        language: 'typescript',
        value: `const jungleBeats: string = "Holla at me, boo";`
    },
    // ...
}
```

上記のようなオブジェクトから`path`の情報だけを抜き取る

同時にfilesのデータを見直す。

```TypeScript
interface iFile {
    path: string;
    language: string;
    value: string;
};

const files: iFiles[] = [
    {
        path: 'src/index.js',
        language: 'javascript',
        value: `var salute = "salute!!";`
    },
    {
        path: 'src/index.ts',
        language: 'typescript',
        value: `const jungleBeats: string = "Holla at me, boo";`
    },
];
```
```TypeScript
const collectPathFromFiles = (entries: iFiles[]) => {
    return entries.map(file => file.path);
};

// 
```

#### filesデータの更新

TODO: filesのデータ型を`iFiles`のオブジェクトから`File[]`へ変更したいが、それにあたって障害はあるか？確認、修正。

fileデータはクラスにするべきか？

マウント時に`files`から`File[]`を生成する。

filesを直接使わないのは、File各々にメソッドを持たせたかったから...

とはいえclassインスタンスを生成するタイミングがわからん。

参考サイトを確認してみよう。

```TypeScript
class File {
    constructor(
        private _path: string,
        private _language: string,
        private _value: string
    ){};

    get path() {
        return this._path;
    };

    get language() {
        return this._language;
    };

    get value() {
        return this._value;
    };

    // // 必須ではないけどあったら便利かも
    // get name() {
    //     // 正規表現を使ってpathの「ファイル名.拡張子」部分を返す
    // };

    set updatePath(p: string) {
        this._path = p;
    };

    set changeLanguage(l: string) {
        this._language = l;
    };

    set updateValue(v: string) {
        this._value = v;
    };
};

```
おさらい：monacoでのfilesの使われ方：

```TypeScript
// MonacoEditor.tsx
// 
// modelの生成には必要だけど、stateとかで管理する必要はない
const { files, ...} = props;
Object.keys(files).forEach(path => {
    _initializeFiles(files[path]);
    // file情報を基にmodelを生成する
});

// Tabs.tsx
return (
    // ...
    {            
        Object.keys(files).map((key, index) => {
            const file: iFile = files[key];
                return (
                    <span 
                        className={file.path === path ? "tab active": "tab"}
                        ref={_refTabs.current[index]}
                        onClick={() => changeTab(_refTabs.current[index].current!, file.path)}
                        key={index}
                    >
                        {file.path}
                    </span>
                );
            })
        }
    )}
)
```
と考えるとfilesは別にclassじゃなくてもいいなぁ

```TypeScript
const filesProxy = (function(initializeData: iFile[]) {
    // 参照を持たせないため
    const _files: iFile[] = initializeData.map(d => d);

    const addFile = (newFile: iFile) => {

    };


    return {
        addFile, 
    }
})(initializeData);
```

## iFileとiExplorerを連携させる機能

いまのところ：

大本: `files: iFile[]`

コンポーネントは`filesProxy()`が情報源になっている。

FileExplorer:

`filexProxy()` --> `files`

`FileExplorer/index.tsx` --> `state.explorerData` --> `filesProxy`

Monaco:

`MonacoContainer.tsx` --> `files={filesProxy.getFiles()}` --> `filesProxy`

`MonacoEditor.tsx` --> `props.files`

ということで、

Monaco側、`<MonacoEditor files={filesProxy.getFiles()} >`となっているので、再レンダリングのタイミングでfilesProxyの最新情報を取得する

Explorer側：`filesProxy`の最新情報はmount時にのみ取得されるのみで、後は独自にstate管理しているから変更がfilesProxyへ伝わっていない

component --> state --> filesProxy --> 他のcomponent

という変更の伝達が叶うように修正が必要。

stateを通すのは再レンダリングさせるため。

#### filesProxyとstateの連携

`component --> state --> filesProxy`の部分

```TypeScript
const [explorerData, setExplorerData] = useState<iExplorer>();
const cachedFiles = useMemo(filesProxy.getAllPaths(), [])
```

上記のようにイメージしてみても、usememoの依存関係が見当たらないなぁ。


## FileExplorerのファイルをクリックしたらeditorに該当ファイルを表示させる機能

ひとまずreduxのことを忘れる。

どのファイルがクリックされたのかの情報を、以下の通りどうにかしてバケツリレーしなくてはならない

```JavaScript
    <>
      <Header />
      <MainContainer>
        <NavigationSection />
        <SplitPane>
        // このPaneから...
          <Pane />
        // ...EditorSectionまで
          <EditorSection onBundled={onBundled} />
          <PreviewSection bundledCode={bundledCode} />
        </SplitPane>
      </MainContainer>
    </>
```

React Contextを使うことにする。

https://react.dev/learn/passing-data-deeply-with-context

シンプルな使い方だと一方通行に値を渡すことになる。

ネストされたコンポーネントがcontextの値を変更したい場合：

https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component

値と関数を渡す。

## iFile[]とiExplorerは互いを識別できない

問題は、iFile[]とiExplorerは互いを識別できないことである。

つまり、

iFileのあるfile情報から、iExplorerにあるexplorerを特定できない

iExplorerのexplorer情報からも、iFileにあるfileを特定できない。

そのため、

iExplorerを基にしているFileExplorerの変更情報はiFile(もしくはfilesProxy)へ反映できない。

どのexplorerがどのfileと同じものなのか区別がつかないから。

一方、iFileの変更は、

`setExplorerData(generateTreeNodeData(filesProxy.getAllPath(), "root"))`でstate管理されているのでFileExplorerへは反映できる

FileExplorerのdndによってpathが変更されるから、

この問題の修正が必須である。

ひとまず：

- FileExplorerで扱うiExplorerデータはpath情報を付加する
- dnd などpathが変更しうる操作に対応してpathが適切に変更されるようにする
- 要検証：`setExplorerData(updatedTree)`したらfilesをそれに合わせて更新する機能

目下の目標：monacoのmodelとiExplorerとの整合性

NOTE: monaco-editorはmodelをそのままにuriを変更することはできない

https://github.com/Microsoft/monaco-editor/issues/926

代わりになる方法は示してくれる模様。


## 参考: snack

#### dnd結果をどうやって反映させているのか

https://github.com/expo/snack/blob/main/website/src/client/components/FileList/FileListEntryDropTarget.tsx

```TypeScript
// https://github.com/expo/snack/blob/main/website/src/client/components/FileList/FileList.tsx

// entries: 多分うちでいうところのiExplorer的なものかしら
private updateEntries(entries: FileSystemEntry[]) {
    const prevEntries = this.state.entries;
    this.setState({ entries });

    // Sync changes
    this.props.updateFiles((files) => {
      const updates: { [path: string]: SnackFile | null } = {};

      // Handle file removal (and rename)
      for (const path in files) {
        const entry = entries.find((entry) => entry.item.path === path);
        if (!entry) {
          updates[path] = null;
        }
      }

      // Handle added/renamed files
      entries.forEach((entry) => {
        if (
          entry.item.type === 'file' &&
          !files[entry.item.path] &&
          !isPackageJson(entry.item.path)
        ) {
          updates[entry.item.path] = {
            type: entry.item.asset ? 'ASSET' : 'CODE',
            contents: entry.item.asset ? entry.item.uri : entry.item.content,
          };
        }
      });

      return updates;
    });

    // Update focus
    const prevFocusedEntry = findFocusedEntry(prevEntries);
    const focusedEntry = findFocusedEntry(entries);
    if (focusedEntry?.item.path !== prevFocusedEntry?.item.path) {
      this.props.onSelectFile(focusedEntry?.item.path ?? '');
    }
  }

```

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


#### delete folder and file

```TypeScript
// Tree.tsx
const onDelete = (
    e: React.MouseEvent<HTMLDivElement>,
    
    isFolder: boolean
) => {
    e.stopPropagation();
    // 引数`explorer.id`を`explorer.path`に変更する
    handleDeleteNode(explorer.path, isFolder);
};


// Explorer/index.tsx
  const handleDeleteNode = (path: string, isFolder: boolean) => {
    // const updatedTree = deleteNode(explorerData, itemId);
    // setExplorerData(updatedTree);

    // NOTE: あらかじめ、引数pathのTreeNode上の子孫を削除しなくてはならない
  };
```

ということで、tree上の子孫を得るならtreeから引っ張ってきた方が簡単なので

```TypeScript
// Explorer/helper.ts

/**
 * @param {iExplorer} _explorer - explorer as parent node.
 * @return {Array<iExplorer>} - All descendant nodes of `_explorer`.
 * 
 * */ 
const getAllDescendants = (_explorer: iExplorer): iExplorer[] => {
  const descendants: iExplorer[] = [];

  function collectDescendantsRecursive(exp: iExplorer) {
      exp.items.forEach(item => {
          descendants.push(item);
          if(item.items.length) {
              collectDescendantsRecursive(item);
          }
      });
  };

  collectDescendantsRecursive(_explorer);

  return descendants;
};
```

改めて...

```TypeScript
// Tree.tsx
const onDelete = (
    e: React.MouseEvent<HTMLDivElement>,
    
    isFolder: boolean
) => {
    e.stopPropagation();
    // 引数`explorer.id`を`explorer.path`に変更した
    handleDeleteNode(explorer);
};


// Explorer/index.tsx

    // TODO: isFolder: trueのFileも削除できているか確認
  const handleDeleteNode = (_explorer: iExplorer) => {
    const descendantPaths: string[] = getAllDescendants(_explorer).map(d => d.path);
    const updatedFiles: File[] = baseFiles.filter(f => {
        if(f.isFolder) {
            return descendants.find(d => d.includes(f.path) !== undefined)
            ? false : true;
        }
        return descendantPaths.find(d => d === f.path)
        ? false : true;
    });
    setFiles(updatedFiles);
  };
```


TEST: codesandbox

```TypeScript
import { File, files } from './files';
import { generateTreeNodeData } from './generateTreeNode';

export interface iExplorer {
  id: string;
  name: string;
  isFolder: boolean;
  items: iExplorer[];
  // 
  // NOTE: new added
  // 
  path?: string;
}



const _getNodeById = (items: iExplorer[], id: string): iExplorer | undefined => { 

  let e = items.find(item => item.id === id);

  if(!e) {
      items.find(item => {
        let el = _getNodeById(item.items, id);
        if(el) e = el;
      });
  }

  return e;
};


/****
 * `id`を元にそのidを持つexplorerをitemsから再帰的に捜索し見つけたら返す。
 * NOTE: _getNodeById()はexplorer.items以下のみしか検索できないので、
 * この関数はexplorer.idの検査を設けた。
 *  */ 
export const getNodeById = (explorer: iExplorer, id: string): iExplorer | undefined => {
  return explorer.id === id ? explorer : _getNodeById(explorer.items, id);
};



const getAllDescendants = (_explorer: iExplorer): iExplorer[] => {
  const descendants: iExplorer[] = [];

  function temp(exp: iExplorer) {
      exp.items.forEach(item => {
          descendants.push(item);
          if(item.items.length) {
              temp(item);
          }
      });
  };

  temp(_explorer);

  return descendants;
};


const baseFiles: File[] = files.map(f => new File(f.path, f.value, f.language, f.isFolder));

  // TODO: isFolder: trueのFileも削除できているか確認
const handleDeleteNode = (_explorer: iExplorer) => {
  const descendantPaths: string[] = getAllDescendants(_explorer).map(d => d.path) as string[];
  
  console.log("[handleDeleteNode] descendantPaths:");
  console.log(descendantPaths);

  const updatedFiles: File[] = baseFiles.filter(f => {
    // TODO: コメントアウト部分要修正
      // if(f.isFolder()) {
      //     
      //     return descendantPaths.find(d => d.includes(f.getPath()) !== undefined)
      //     ? true : false;
      // }
      // 例：`public/js`を削除する場合...
      // 対象外
      // `public/`, `public/css`
      // 対象
      // `public/js`, `public/js/default/`, `
      // 
      // なので、d.includes(f.getPath())だと、
      // `public`も`public/css`もtruthyになる。
      // 
      // となったら、
      // まず_explorer.pathと一致するか比較する必要があるか
      // NOTE: 
      if(f.isFolder()) {

      }
      return descendantPaths.find(d => d === f.getPath())
      ? false : true;
  });
  // setFiles(updatedFiles);
  console.log("updatedFiles:");
  console.log(updatedFiles);
};

(function() {
  const explorer = generateTreeNodeData(baseFiles, "root");
  console.log("explorer: ");
  console.log(explorer);
  const parent = getNodeById(explorer, "2");
  console.log("parent: ");
  console.log(parent);
  parent && handleDeleteNode(parent);
})();

```

空フォルダを削除する方法の模索:

```TypeScript
const handleDeleteNode = (_explorer: iExplorer) => {
  const descendantPaths: string[] = getAllDescendants(_explorer).map(d => d.path) as string[];

  const updatedFiles: File[] = baseFiles.filter(f => {
    // TODO: 要修正
      if(f.isFolder()) {
        const operand = f.path.split('/');          // 例：`public/css`,`pubcli/default`
        const _operand = _explorer.path.split('/'); // 例：`public/js`
        let completeMatch: boolean = false;
        _operand.forEach((_o, index) => {
          completeMatch = (_o === operand[index]) || completeMatch;
        });
        return completeMatch ? true : false;
      }
      return descendantPaths.find(d => d === f.getPath())
      ? false : true;
  });
```

#### reorder files

DND結果の反映ですわ

- フォルダが移動したら
  連なるファイル、フォルダ全てのpathの変更

- ファイルが移動したら
  該当ファイルのpathだけ変更

- Tree.tsxから引っ張ってこれるのは
  droppedIdとdraggableId

- onDrop: droppedIdとdraggableIdを取得できる

```TypeScript
  const handleReorderNode = (droppedId: string, draggableId: string): void => {

      if(droppedId === draggableId) { return; }

      // Check if the dropped area is under dragging item
      if(isNodeIncludedUnderExplorer(explorerData, droppedId, draggableId)){
        return;
      }

      // -- ここまではこのままでおｋ --
      const movingItem = getNodeById(explorerData, draggableId);
      const droppedArea = getNodeById(explorerData, droppedId)
      if(droppedArea!.isFolder) {
        // item dropped on Folder column
        // get all descendant paths of movingItem. 
        const descendantPaths: string[] = getAllDescendants(_explorer).map(d => d.path) as string[];
        // 
        // 例：たとえば、`public/js`を、`src`へドロップしたとする
        // すると、`src/public/js`となる。
        // それは`public/js`以下のすべてのアイテムが同様である
        // つまり、
        // path変更は`dropした場所のパス` + `対象パス`とすればよい
        // 
        // 配列の上書きをするために...
        // 
        const reorderFiles = baseFiles.map(f => descendatnPaths.find(d => d === f.getPath()) );
        const restFiles = baseFiles.filter(f => descendatnPaths.find(d => d !== f.getPath()) );
        const updatedReorderItems = reorderFiles.map(r => {
          return {
            path: droppedArea.path + r.path,
            language: r.language,
            value: r.value,
            isFolder: r.isFolder
          };
        });

        setBaseFiles([...restFiles, ...updatedReorderItems]);
      }
      else {
        // Item dropped on NOT folder column
        const restFiles = baseFiles.filter(f => f.getPath() !== movingItem.path);
        const movingFile = baseFiles.find(f => f.getPath() === movingItem.path);
        setBaseFiles([
          ...restFiles, 
          {
            path: droppedArea.path + movingFile.path,
            language: movingFile.language,
            value: movingItem.value,
            isFolder: movingItem.isFolder
          }
        ]);
      }
  };

  const convertPartOfPath = (targetPath: string, )
```
#### [React Tips] management of object array in state

https://stackoverflow.com/questions/26253351/correct-modification-of-state-arrays-in-react-js

https://stackoverflow.com/questions/49477547/setstate-of-an-array-of-objects-in-react

https://react.dev/learn/updating-arrays-in-state

stateで配列を管理する場合：

- state.arrayをstate.array[0] = "changed"のように直接変更するな

- state.arrayには常に新しい配列を与えよ。

