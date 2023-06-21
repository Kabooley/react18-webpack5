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
 * @param {iExplorer[]} nested - あるiExplorer.items
 * @param {string} lookFor - 探しているitemのidで、nestedに含まれているかどうかを調べる
 * @return { iExplorer | undefined } - lookForのidをもつitemがnestedのなかのexplorerに含まれていた場合、そのexplorerを返す。
 * 
 * 参考: https://stackoverflow.com/a/40025777/22007575
 * */ 
const findParentNodeByChildId = (nested: iExplorer[], lookFor: string) => {
  const r = nested.find((exp) => exp.items.some((item) => item.id === lookFor));

  return r;
};


/****
 * @param {iExplorer[]} items - 検索範囲となるexplorer
 * @param {string} id - 探しているitemのidで、引数itemsにそのitemが含まれているかどうかを調べる
 * @return {iExplorer | undefined} - findParentNodeByChildId()の結果を返す。
 * 
 * 再帰呼出を行うことで、引数のitems以下のexplorerのitemsを続けて捜索する。
 * */ 
const _getParentNodeByChildId = (items: iExplorer[], id: string): iExplorer | undefined => {

  let e: iExplorer | undefined;
  const result = findParentNodeByChildId(items, id);

  if(!result) {
    // NOTE: items.find()は配列をひとつずつ再帰呼出し、実行結果を得るために使用しており、findからの戻り値は必要としない。
    items.find(item => {
      e = _getParentNodeByChildId(item.items, id);
      return e;
    })
  }
  else e = result;

  return e;
};

/***
 *  _getParentNodeByChildId()はexplorerの1段階の深さを捜索できない。
 * そのためこの関数はその部分をカバーする。
 * */ 
export const getParentNodeByChildId = (explorer: iExplorer,lookForId: string) => {
    let result: iExplorer | undefined;
    const r = explorer.items.find(item => item.id === lookForId);
    if(!r){
      result = _getParentNodeByChildId(explorer.items, lookForId);
    }
    else {
      // rがundefinedでない場合、explorerが親要素
      result = explorer;
    };
    return result;
};

// -- USAGE --
export const tester = () => {
  const r = getParentNodeByChildId(explorer, "8");
  console.log(r);
}