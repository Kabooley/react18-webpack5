import React from 'react';
import { iExplorer } from '../data/folderData';

export const reorder = (
    list: any[], startIndex: number, endIndex: number
) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
  
    return result
};


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
        // 
        // よく考えたらforEachでもかまわな...くない。
        // パフォーマンスを考えたら、findでtruthyが返されたらfindは処理終了するが、
        // forEachは全ての要素を呼び出すので余計な処理が増える。
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


const retrieveFromExplorer = (explorer: iExplorer, id: string): iExplorer | undefined => {
  console.log("[retrievefromExplorer]");
  // 親の親を返してしまっている
  const parent = getParentNodeByChildId(explorer, id);
  console.log("parent:");
  console.log(parent);
  const retrieved = parent && parent.items.find(item => item.id === id);
  console.log("retrieved:");
  console.log(retrieved);
  const index = parent && parent.items.map(item => item.id).indexOf(id);
  console.log("index:");
  console.log(index);
  if(index! > -1) parent && parent.items.splice(index!, 1);
  return retrieved;
};

const pushIntoExplorer = (explorer: iExplorer, toBePushed: iExplorer, destinationId: string): void => {
  console.log("[pushIntoExplorer]");
  const destination = getParentNodeByChildId(explorer, destinationId);
  console.log(destination);
  destination && destination.items.push(toBePushed);

  if(!destination) throw new Error("something went wrong but destinationId is not belong to any explorer.");
};

(function() {
  // const toBeMovedId = "5";
  // const destinationId = "7";

  // const retrieved = retrieveFromExplorer(explorer, toBeMovedId);
  // pushIntoExplorer(explorer, retrieved!, destinationId);
  console.log(getParentIdByChildeNodeId(explorer, "5"));
})();
  
