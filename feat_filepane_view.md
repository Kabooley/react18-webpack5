# Implement file pane 

## タスク

TODO: 元となるデータ`files`を基にEXPLORERペインビューを実装する
TODO: 元となるデータ`files`のロジックを固める必要がある（directoruかfileかとかの情報もつけるとか）

## 参考

snack expoのOSS：

https://github.com/expo/snack/blob/main/website/src/client/components/FileList/FileList.tsx


他ggたやつ

https://dev.to/siddharthvenkatesh/creating-a-simple-file-explorer-with-recursive-components-in-react-458h

## 実装

## filesのロジック

どんな情報が含まれていれば必要十分か。


例：

```TypeScript
const files = {

}


const files2 = [
    { name: "index.js", path: "path/to/file", language: "javascript", value: "import React from \'react\'"},
    { name: "component.tsx", path: "path/to/file", language: "typescript", value: "import React from \'react\'"},
    { name: "FILENAME", path: "path/to/file", language: "javascript", value: "import React from \'react\'"},
    { name: "FILENAME", path: "path/to/file", language: "javascript", value: "import React from \'react\'"},
]
```

pathからディレクトリなどを解決するようにする

NOTE: 空のディレクトリとかはその情報を基に生成することはできない

#### 実装：pathからディレクトリを解決する仕組み

path:

root file: `/index.js`

subdirectory file: `/components/Counter/index.js`

filesのpathからexplorerの構成のもととなるビジネスモデルを生成する

処理の流れ：

path読取 --> path解決 --> ビジネスモデルの更新 --> renndering

```html
<div className="rootDir" name="src/">
    <div className="directory" name="components" >
        <ul className="directory-ul" name="components">
            <li className="directory-li" name="components">
                <div className="file javascript-file" name="components/index.js">index.js</div>
            </li>
            <li className="directory-li" name="components">
                <!-- SubDir Dir1 -->
                <div className="directory" name="components/Dir1" >
                    <ul className="directory-ul" name="components/Dir1">
                        <li className="directory-li" name="components/Dir1">
                            <div className="file javascript-file" name="components/Dir1/index.js">index.js</div>
                        </li>
                        <li className="directory-li" name="components/Dir1">
                            
                        </li>
                        <li className="directory-li" name="components/Dir1"></li>
                    </ul>
                </div>
            </li>
            <li className="directory-li" name="components"></li>
        </ul>
    </div>
</div>

<!-- DIRECOTRY-NAME must be absolute path -->
<!-- Directory Base -->
<div className="directory" name="DIRECTORY-NAME">
    <ul className="directory-ul" name="DIRECTORY-NAME">
        <li className="directory-li" name="DIRECTORY-NAME"><!-- file or subdirectory here --></li>
        <li className="directory-li" name="DIRECTORY-NAME"><!-- file or subdirectory here --></li>
        <li className="directory-li" name="DIRECTORY-NAME"><!-- file or subdirectory here --></li>
        <li className="directory-li" name="DIRECTORY-NAME"><!-- file or subdirectory here --></li>
    </ul>
</div>

<!-- File Base -->
<div className="file javascript-file" name="PATH/TO/FILENAME">
    <svg>file-icon</svg>
    <span className="filename"></span>
</div>

```

test codesandbox

```TypeScript
import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>`;
interface iDirInfo {
  path: string; 
  nodeType: "file" | "Dir"
};

interface iTreeDirFileBase {
  id: string;
  name: string;
  parentNode: string;
  nodeType: "Dir" | "file"
};

const Root = "src/";

// "src/" as Root.
const dummy: iDirInfo[] = [
  {path: "/index.js", nodeType: "file"},
  {path: "/components/Dir1/index.js", nodeType: "file"},
  {path: "/components/Dir1/subDir/index.js", nodeType: "file"},
  {path: "/components/Dir2/index.js", nodeType: "file"}, 
  {path: "/utils/Counter.js", nodeType: "file"}, 
  {path: "/components/Di3", nodeType: "Dir"},    /* empty directory */ 
  {path: "/components/Di3/something", nodeType: "file"},    /* file with no extension */ 
];

const dummyExplorerTree = {
  root: {
    name: "src"
  },
  // id: ランダム生成のハッシュ値
  // NOTE: parentNodeはidの方がいいかも
  dirs: [
    {id: "", name: "components", parentNode: "src", nodeType: "Dir"},
    {id: "", name: "Dir1", parentNode: "components", nodeType: "Dir"},
    {id: "", name: "Dir2", parentNode: "Dir1", nodeType: "Dir"},
    {id: "", name: "utils", parentNode: "src", nodeType: "Dir"},
  ],
  files: [
    { name: "index.js", parentNode: "src", nodeType: "file"},
    {id: "", name: "index.js", parentNode: "Dir1", nodeType: "file"},
    {id: "", name: "index.js", parentNode: "Dir2", nodeType: "file"},
    {id: "", name: "counter.js", parentNode: "utils", nodeType: "file"},
  ]
};

const resolver = (path: string, nodeType: "file" | "Dir") => {
  const result = path.split('/').reduce<iTreeDirFileBase[]>(
    (a: iTreeDirFileBase, currentNode: string, currentIndex, arr) => {
    return {
      id: "xxxxxxx" + currentNode,
      name: currentNode,
      parentNode: a === undefined ? "src": a.id,
      nodeType: currentIndex < arr.length ? "Dir" : nodeType
    }
  }, []);
  return result;
};

(function () {
  let result = {};
  dummy.forEach(d => {
    const r = resolver(d.path, d.nodeType);
    reuslt = { ...result, ...r };
  });
  console.log(result);
})();



// ---


const resolver = (path, nodeType) => {
  let container = [];
  path.split("/").reduce((a, currentNode, currentIndex, arr) => {
    const d = {
      id: "xxxxxxx" + currentNode,
      name: currentNode,
      parentNode: a === undefined ? "src" : a.id,
      // TODO: fix this process
      nodeType: currentIndex < arr.length ? "Dir" : nodeType
    };
    container.push(d);
    console.log("<------");
    console.log(a);
    console.log(d);
    console.log(container);
    console.log("------>");
    return d;
  });
  return container;
};

// const resolver = (path, nodeType) => {
//   let root = {
//     id: "root",
//     name: "src/",
//     parentNode: undefined,
//     nodeType: "Dir"
//   };
//   const result = path.split("/").reduce((a, currentNode, currentIndex, arr) => {
//     const d = {
//       id: "xxxxxxx" + currentNode,
//       name: currentNode,
//       parentNode: a === undefined ? "src" : a.id,
//       // TODO: fix this process
//       nodeType: currentIndex < arr.length ? "Dir" : nodeType
//     };
//     console.log("<----");
//     console.log(a);
//     console.log(d);
//     console.log("---->");
//     return [...a, d];
//   }, [root]);
//   return result;
// };


(function () {
  dummy.forEach(d => {
    const r = resolver(d.path, d.nodeType);
    console.log('result');
    console.log(r);
  });
})();



 ```

 dummyからdummyTreeExplorerのようなオブジェクトを生成する

## JavaScript: Array.prototype.reduce

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

```TypeScript
const array = [15, 16, 17, 18, 19];

function reducer(accumulator, currentValue, index) {
  const returns = accumulator + currentValue;
  console.log(
    `accumulator: ${accumulator}, currentValue: ${currentValue}, index: ${index}, returns: ${returns}`,
  );
  return returns;
};

// In case no initialValue:
console.log(array.reduce(reducer));
// accumulator: 15, currentValue: 16, index: 1, returns: 31 
// accumulator: 31, currentValue: 17, index: 2, returns: 48 
// accumulator: 48, currentValue: 18, index: 3, returns: 66 
// accumulator: 66, currentValue: 19, index: 4, returns: 85 
// 85


// In case with initialValue:
console.log(array.reduce(reducer, array[0]));
// accumulator: 15, currentValue: 15, index: 0, returns: 30 
// accumulator: 30, currentValue: 16, index: 1, returns: 46 
// accumulator: 46, currentValue: 17, index: 2, returns: 63 
// accumulator: 63, currentValue: 18, index: 3, returns: 81 
// accumulator: 81, currentValue: 19, index: 4, returns: 100 
// 100
```

initialValueなしだと一巡目がaccumulatorがarray[0]で、currentValueがarray[1]になる。

