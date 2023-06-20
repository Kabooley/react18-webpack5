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


/***
 * 
 * @return { iExplorer | undefined }
 * 
 * https://stackoverflow.com/a/40025777/22007575
 * 
 * nested以下の各item.idがlookForに一致したら
 * そのnestedの要素を返す。
 * */ 
const findParentNodeByChildId = (nested: iExplorer[], lookFor: string) => {
  console.log("[findParentNodeByChildId] nested:");
  console.log(nested);

  // こっちの方法だと、一致する要素をitemsにもつ親要素を返すことになる
  // return nested.find((exp) => exp.items.some((item) => item.id === lookFor));
  const r = nested.find((exp) => exp.items.some((item) => item.id === lookFor));
  
  console.log("[findParentNodeByChildId] r:");
  console.log(r);

  return r;
};



/***
 * Returns parent node from explorerData by its items id via recursive way.
 * @return { iExplorer | undefined }
 * */ 
const getParentNodeById = (items: iExplorer[], id: string): iExplorer | undefined => {

  let e: iExplorer | undefined;
  const result = findParentNodeByChildId(items, id);

  // DEBUG:
  console.log("[getParentNodeById] result:");
  console.log(result);

  e =  result ? result : items.find(item => getParentNodeById(item.items, id));

  // DEBUG:
  console.log("[getParentNodeById] e:");
  console.log(e);
  
  return e;
};


// // lookForIdをitemsに含むexplorerオブジェクトを取得する
// (function() {
//   const lookForId = "4";
//   let result: iExplorer | undefined;
//   // TODO: 以下のrを得る手段をgetParentNodeByIdに統合できないかしら？
//   const r = explorer.items.find(item => item.id === lookForId);
//   if(!r){
//     result = getParentNodeById(explorer.items, lookForId);
//   }
//   else {
//     // rがundefinedでない場合、explorerが親要素
//     result = explorer;
//   };
//   console.log(result);
// })();

export const tester = () => {
    const lookForId = "4";
    let result: iExplorer | undefined;
    // TODO: 以下のrを得る手段をgetParentNodeByIdに統合できないかしら？
    const r = explorer.items.find(item => item.id === lookForId);
    if(!r){
      result = getParentNodeById(explorer.items, lookForId);
    }
    else {
      // rがundefinedでない場合、explorerが親要素
      result = explorer;
    };
    console.log(result);

}