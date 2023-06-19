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
 * 
 * @return { iExplorer | undefined }
 * 
 * https://stackoverflow.com/a/40025777/22007575
 * 
 * nested以下の各item.idがlookForに一致したら
 * そのnestedの要素を返す。
 * */ 
const findParentNodeByChildId = (nested: iExplorer[], lookFor: string) => {

    // こっちの方法だと、一致する要素をitemsにもつ親要素を返すことになる
    return nested.find((exp) => exp.items.some((item) => item.id === lookFor));
};
  
  
/***
 * Returns parent node from explorerData by its items id via recursive way.
 * @return { iExplorer | undefined }
 * */ 
const getParentNodeById = (items: iExplorer[], id: string): iExplorer | undefined => {

    let e: iExplorer | undefined;
    const result = findParentNodeByChildId(items, id);
    e =  result ? result : items.find(item => getParentNodeById(item.items, id));

    return e;
};
  
  
/***
 * Returns explorer.id which has item that belongs to explorer items array.
 * 
 * */ 
export const getParentIdByChildeNodeId = (explorer: iExplorer, id: string): string | undefined => {
    let r: iExplorer | undefined= explorer.items.find(item => item.id === id);
    if(!r) {
        r = getParentNodeById(explorer.items, id);
    }
    else {
        r = explorer;
    }
    return r?.id;
};