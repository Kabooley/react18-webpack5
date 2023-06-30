# Integrate file data

fileexplorerとmonaco-editorの両者の前提とするファイルデータを統合する。

- FileExplorerのファイルをダブルクリックでmonaco-editorで表示する
- monaco-editorの前提ファイルをexplorerDataへ変換する処理

## やったこと

- filesデータはｵﾌﾞｼﾞｪｸﾄ型ではなく配列にした
- filesデータをマウント時にfilesProxy()が読取、データを管理しやすい形で扱うことにする。


## TODOs

TODO: 修正）tabareaのタブが一定以上の数になると折り返されてタブが表示される。

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
