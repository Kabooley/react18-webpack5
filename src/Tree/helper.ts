import React from 'react';
import type { iExplorer } from '../data/folderData';


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


/****
 * `id`を元にそのidを持つexplorerをitemsから再帰的に捜索し見つけたら返す。
 * 
 *  */ 
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


export const retrieveFromExplorer = (explorer: iExplorer, id: string): iExplorer | undefined => {

    const parent = getParentNodeByChildId(explorer, id);
    const retrieved = parent && parent.items.find(item => item.id === id);
    const index = parent && parent.items.map(item => item.id).indexOf(id);

    if(index! > -1) parent && parent.items.splice(index!, 1);
    return retrieved;
};



export const pushIntoExplorer = (explorer: iExplorer, toBePushed: iExplorer, destinationId: string): iExplorer => {
    const destination = getNodeById(explorer, destinationId);

    destination && destination.items.push(toBePushed);

    if(!destination) throw new Error("something went wrong but destinationId is not belong to any explorer.");

    return explorer;
};


// -- 6-25 --

/***
 * DND反映するための処理順序：
 *
 * 移動するアイテムのコピーをとる: getNodeByid()
 * 移動するアイテムを元居た場所から削除する: deleteNode()
 * 移動するアイテムのコピーを移動先へ追加する: addNode()
 *
 * */

/**
 * TODO: Replace current `deleteNode` method to this.
 *
 * @param {iExplorer} tree - explorer object to be surveyed.
 * @param {string} id - An explorer's id which is to be removed.
 * @return {iExplorer} - Always returns new iExplorer object. No shallow copy.
 * */
const deleteNode = (tree: iExplorer, id: string): iExplorer => {
  // 引数idに一致するitemをtreeから見つけたら、
  // 該当item削除を反映したitemsにしてtreeを返す。
  if (tree.items.find((item) => item.id === id)) {
    const m = tree.items.map((item) => (item.id !== id ? item : undefined));
    const updatedTree = m.filter(
      (item: iExplorer | undefined) => item !== undefined
    ) as iExplorer[];
    return { ...tree, items: updatedTree };
  }
  // 1. まずtree.itemsのitemすべてを呼び出し...
  let latestNode: iExplorer[] = [];
  latestNode = tree.items.map((ob) => deleteNode(ob, id));

  // 2. ...常にtreeのitemsが更新されたtreeを返す
  return { ...tree, items: latestNode };
};

const addNode = (
  tree: iExplorer,
  where: string,
  toBeAdded: iExplorer
): iExplorer => {
  if (tree.items.find((item) => item.id === where)) {
    // items.pushだと新規の配列にならないので別の手段を
  }
  // 1. まずtree.itemsのitemすべてを呼び出し...
  let latestNode: iExplorer[] = [];
  latestNode = tree.items.map((ob) => addNode(ob, where, toBeAdded));

  // 2. ...常にtreeのitemsが更新されたtreeを返す
  return { ...tree, items: latestNode };
};
