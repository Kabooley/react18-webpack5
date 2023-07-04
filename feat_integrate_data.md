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

- TODO: folderはiFileと相容れないので空のフォルダの扱いを決めること

    generateTreeNodeは空のフォルダを認めるか？確認

    認めるならばiFileでもフォルダの取り扱いを始める
    認めないなら模索
    
- iExplorerにはpathという新しいpropertyを追加することとする。

```TypeScript
// FileExplorer/index.tsx
const onAddFolder = (parentPath: string, folderName: string) => {
    const newFolder: iExplorer = {
        id: new Date().
        name: folderName,
        isFolder: true,
        path: parentPath + '/' + folderName,
        items: []
    }

    // NOTE: 新規folder作成はfilesへ追加できないのでexplorerDataだけ
}
// Tree.tsx

/***
 * clickされたfolderの直下にフォルダを作る行為なので
 * filesからしたら、新規のfileデータの追加で、
 * 重要な情報がpathがどうなるかである。
 * 親フォルダのpathが必要になるはずなので親フォルダpathを渡す
 * 
 * */ 
const onAddFolder = (
    e: e: React.KeyboardEvent<HTMLInputElement>,
    parentPath: string
) => {
    const v = e.currentTarget.value;
    if (e.keyCode === 13 && v) {
        props.onAddFolder(parentPath, v);
        setShowInput({ ...showInput, visible: false });
    }
};

// render
<div onClick={(e: : React.MouseEvent<HTMLDivElement>) => onAddFolder(e, explorer.path)}>
    // ...
</div>
```

`use-traverse-tree.ts`:

常にfilesを基にtree nodeを生成することとしたので、tree nodeを直接変更する必要がなくなった

```TypeScript
const insertNodeVer2 = 
```

#### [React Tips] management of object array in state

https://stackoverflow.com/questions/26253351/correct-modification-of-state-arrays-in-react-js

https://stackoverflow.com/questions/49477547/setstate-of-an-array-of-objects-in-react

https://react.dev/learn/updating-arrays-in-state

stateで配列を管理する場合：

- state.arrayをstate.array[0] = "changed"のように直接変更するな

- state.arrayには常に新しい配列を与えよ。

```TypeScript

```