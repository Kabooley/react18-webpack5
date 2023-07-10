// DEPLICATED

// import type { iExplorer } from "../data/types";

// const useTraverseTree = () => {

//   function insertNode(
//     tree: iExplorer,
//     folderId: string,
//     item: string,
//     isFolder: boolean
//   ): iExplorer {
//     // Add folder or file:
//     if (tree.id === folderId && tree.isFolder) {
//       console.log(`Generate new folder under ${folderId}`);
//       tree.items.unshift({
//         id: "" + new Date().getTime(),
//         name: item,
//         isFolder,
//         items: []
//       });

//       return tree;
//     }

//     let latestNode: iExplorer[] = [];
//     latestNode = tree.items.map((ob) => {
//       return insertNode(ob, folderId, item, isFolder);
//     });

//     return { ...tree, items: latestNode };
//   };


//   const updateNode = (
//     tree: iExplorer,
//     folderId: string,
//     item: string,
//     isFolder: boolean
//   ) => {
//     if (tree.id === folderId && tree.isFolder) {
//       // TODO: modify folder
//       // possibly...
//       // name of item is changed,
//       // dnd to move file,
//     } else if (tree.id === folderId && !tree.isFolder) {
//       // TODO: mpdify file
//     }

//     let latestNode: iExplorer[] = [];
//     latestNode = tree.items.map((ob) => {
//       return updateNode(ob, folderId, item, isFolder);
//     });

//     return { ...tree, items: latestNode };
//   };

//   /**
//    *
//    * @param {iExplorer} tree - explorer object to be surveyed.
//    * @param {string} id - An explorer's id which is to be removed.
//    * @return {iExplorer} - Always returns new iExplorer object. No shallow copy.
//    * */
//   const deleteNode = (tree: iExplorer, id: string): iExplorer => {
//     // 引数idに一致するitemをtreeから見つけたら、
//     // 該当item削除を反映したitemsにしてtreeを返す。
//     if (tree.items.find((item) => item.id === id)) {
//       const m = tree.items.map((item) => (item.id !== id ? item : undefined));
//       const updatedTree = m.filter(
//         (item: iExplorer | undefined) => item !== undefined
//       ) as iExplorer[];
//       return { ...tree, items: updatedTree };
//     }
//     // 1. まずtree.itemsのitemすべてを呼び出し...
//     let latestNode: iExplorer[] = [];
//     latestNode = tree.items.map((ob) => deleteNode(ob, id));

//     // 2. ...常にtreeのitemsが更新されたtreeを返す
//     return { ...tree, items: latestNode };
//   };


//   const addNode = (
//     tree: iExplorer,
//     where: string,
//     toBeAdded: iExplorer
//   ): iExplorer => {
//     if (tree.items.find((item) => item.id === where)) {
//       const updatedItems = tree.items.map(item => item);
//       // 
//       // NOTE: new added
//       // 
//       toBeAdded.path = tree.path + "/" + toBeAdded.path!.split('/').slice(-1);
//       updatedItems.push(toBeAdded);
//       return {...tree, items: updatedItems}
//     }

//     let latestNode: iExplorer[] = [];
//     latestNode = tree.items.map((ob) => addNode(ob, where, toBeAdded));

//     return { ...tree, items: latestNode };
//   };


//   const addFolderNode = (
//     tree: iExplorer,
//     where: string,
//     toBeAdded: iExplorer
//   ): iExplorer => {

//     if (tree.id === where) {
//       const updatedItems = tree.items.map(item => item);
//       // 
//       // NOTE: new added
//       // 
//       toBeAdded.path = tree.path + "/" + toBeAdded.path!.split('/').slice(-1);
//       updatedItems.push(toBeAdded);
//       return {...tree, items: updatedItems}
//     }

//     let latestNode: iExplorer[] = [];
//     latestNode = tree.items.map((ob) => addFolderNode(ob, where, toBeAdded));

//     return { ...tree, items: latestNode };
//   };


//   return { insertNode, deleteNode, updateNode, addNode, addFolderNode };
// };

// export default useTraverseTree;