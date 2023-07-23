import type { iExplorer } from '../../data/types';

/***
 * @param {iExplorer[]} nested - あるiExplorer.items
 * @param {string} lookFor - 探しているitemのidで、nestedに含まれているかどうかを調べる
 * @return { iExplorer | undefined } - lookForのidをもつitemがnestedのなかのexplorerに含まれていた場合、そのexplorerを返す。
 *
 * 参考: https://stackoverflow.com/a/40025777/22007575
 * */
const findParentNodeByChildId = (nested: iExplorer[], lookFor: string) => {
    const r = nested.find((exp) =>
        exp.items.some((item) => item.id === lookFor)
    );

    return r;
};

/****
 * @param {iExplorer[]} items - 検索範囲となるexplorer
 * @param {string} id - 探しているitemのidで、引数itemsにそのitemが含まれているかどうかを調べる
 * @return {iExplorer | undefined} - findParentNodeByChildId()の結果を返す。
 *
 * 再帰呼出を行うことで、引数のitems以下のexplorerのitemsを続けて捜索する。
 * */
const _getParentNodeByChildId = (
    items: iExplorer[],
    id: string
): iExplorer | undefined => {
    let e: iExplorer | undefined;
    const result = findParentNodeByChildId(items, id);

    if (!result) {
        // NOTE: items.find()は配列をひとつずつ再帰呼出し、実行結果を得るために使用しており、findからの戻り値は必要としない。
        //
        // よく考えたらforEachでもかまわな...くない。
        // パフォーマンスを考えたら、findでtruthyが返されたらfindは処理終了するが、
        // forEachは全ての要素を呼び出すので余計な処理が増える。
        items.find((item) => {
            e = _getParentNodeByChildId(item.items, id);
            return e;
        });
    } else e = result;

    return e;
};

/***
 *  _getParentNodeByChildId()はexplorerの1段階の深さを捜索できない。
 * そのためこの関数はその部分をカバーする。
 * */
export const getParentNodeByChildId = (
    explorer: iExplorer,
    lookForId: string
) => {
    let result: iExplorer | undefined;
    const r = explorer.items.find((item) => item.id === lookForId);
    if (!r) {
        result = _getParentNodeByChildId(explorer.items, lookForId);
    } else {
        // rがundefinedでない場合、explorerが親要素
        result = explorer;
    }
    return result;
};

/****
 * `id`を元にそのidを持つexplorerをitemsから再帰的に捜索し見つけたら返す。
 *
 *  */
const _getNodeById = (
    items: iExplorer[],
    id: string
): iExplorer | undefined => {
    let e = items.find((item) => item.id === id);

    if (!e) {
        items.find((item) => {
            let el = _getNodeById(item.items, id);
            if (el) e = el;
        });
    }

    return e;
};

/****
 * `id`を元にそのidを持つexplorerをitemsから再帰的に捜索し見つけたら返す。
 * NOTE: _getNodeById()はexplorer.items以下のみしか検索できないので、
 * この関数はexplorer.idの検査を設けた。
 *  */
export const getNodeById = (
    explorer: iExplorer,
    id: string
): iExplorer | undefined => {
    return explorer.id === id ? explorer : _getNodeById(explorer.items, id);
};

/***
 * Check if `nodeId` is under `from` item.
 *
 * */
export const isNodeIncludedUnderExplorer = (
    explorer: iExplorer,
    nodeId: string,
    from: string
) => {
    // DEBUG:

    const startPoint = getNodeById(explorer, from);

    if (startPoint && getParentNodeByChildId(startPoint, nodeId)) {
        return true;
    }

    return false;
};

/***
 * Collect all descendant explorers of `_explorer`.
 * Return array of them.
 * */
export const getAllDescendants = (_explorer: iExplorer): iExplorer[] => {
    const descendants: iExplorer[] = [];

    function getAllDescendantsRecursively(exp: iExplorer) {
        exp.items.forEach((item) => {
            descendants.push(item);
            if (item.items.length) {
                getAllDescendantsRecursively(item);
            }
        });
    }

    getAllDescendantsRecursively(_explorer);

    return descendants;
};

// DEPLICATED:
//
// export const retrieveFromExplorer = (explorer: iExplorer, id: string): iExplorer | undefined => {

//     const parent = getParentNodeByChildId(explorer, id);
//     const retrieved = parent && parent.items.find(item => item.id === id);
//     const index = parent && parent.items.map(item => item.id).indexOf(id);

//     if(index! > -1) parent && parent.items.splice(index!, 1);
//     return retrieved;
// };

// export const pushIntoExplorer = (explorer: iExplorer, toBePushed: iExplorer, destinationId: string): iExplorer => {
//     const destination = getNodeById(explorer, destinationId);

//     destination && destination.items.push(toBePushed);

//     if(!destination) throw new Error("something went wrong but destinationId is not belong to any explorer.");

//     return explorer;
// };
