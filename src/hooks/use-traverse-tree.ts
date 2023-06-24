import type { iExplorer } from "../data/folderData";

const useTraverseTree = () => {
  /**
   * 
   * 
   * */
  function insertNode(
    tree: iExplorer,
    folderId: string,
    item: string,
    isFolder: boolean
  ): iExplorer {
    // Add folder or file:
    if (tree.id === folderId && tree.isFolder) {
      console.log(`Generate new folder under ${folderId}`);
      tree.items.unshift({
        id: "" + new Date().getTime(),
        name: item,
        isFolder,
        items: []
      });

      return tree;
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return insertNode(ob, folderId, item, isFolder);
    });

    return { ...tree, items: latestNode };
  }

  // //
  // // TODO: `explorer.id`だけで削除処理が完了するようにする
  // //
  // const deleteNode = (
  //   tree: iExplorer,
  //   itemId: string, // 削除するアイテムのid
  //   isFolder: boolean
  // ): iExplorer => {
  //   // 削除したいアイテムをitemsに含んでいるか
  //   let isItemIncluded: boolean = false;
  //   tree.items.forEach((item) => {
  //     isItemIncluded = item.id === itemId || isItemIncluded;
  //   });
    

  //   // 削除したいアイテムをitemsに含んでいるフォルダならば：
  //   if (isItemIncluded && isFolder) {
  //     console.log(`Delete item`);
  //     return {
  //       id: tree.id,
  //       name: tree.name,
  //       isFolder: tree.isFolder,
  //       items: tree.items.filter((item) => item.id !== itemId)
  //     };
  //   }

  //   let latestNode: iExplorer[] = [];
  //   latestNode = tree.items.map((ob) => {
  //     return deleteNode(ob, itemId, ob.isFolder);
  //   });

  //   return { ...tree, items: latestNode };
  // };

  const updateNode = (
    tree: iExplorer,
    folderId: string,
    item: string,
    isFolder: boolean
  ) => {
    if (tree.id === folderId && tree.isFolder) {
      // TODO: modify folder
      // possibly...
      // name of item is changed,
      // dnd to move file,
    } else if (tree.id === folderId && !tree.isFolder) {
      // TODO: mpdify file
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return updateNode(ob, folderId, item, isFolder);
    });

    return { ...tree, items: latestNode };
  };

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
      const updatedItems = tree.items.map(item => item);
      updatedItems.push(toBeAdded);
      return {...tree, items: updatedItems}
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => addNode(ob, where, toBeAdded));

    return { ...tree, items: latestNode };
  };

  // TODO: 変更したitemsがtreeのitemsと異なるのでおかしな挙動になっている。
  // これの修正を。
  /**
   * tree: {id: "1"}
   * where: "2"
   * この場合、
   * w: {id: "2"}
   * updatedItems: w.itemsが更新された
   * {...tree, items: 更新されたw.items}    // ここ
   * 
   * 
   * */ 
  const addFolderNode = (
    tree: iExplorer,
    where: string,
    toBeAdded: iExplorer
  ): iExplorer => {
    // DEBUG:
    console.log("[addFolderNode]");
    console.log("tree: ");
    console.log(tree);
    console.log(`where: ${where}`);

    if (tree.id === where) {
      const updatedItems = tree.items.map(item => item);
      updatedItems.push(toBeAdded);
      
      console.log(`updatedItems:`);
      console.log(updatedItems);

      return {...tree, items: updatedItems}
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => addFolderNode(ob, where, toBeAdded));

    return { ...tree, items: latestNode };
  };


  return { insertNode, deleteNode, updateNode, addNode, addFolderNode };
};

export default useTraverseTree;

// -- USAGE --
//
// (function() {
//   const { insertNode, deleteNode, updateNode } = useTraverseTree();
//   /***
//    * どのフォルダに、何（フォルダなのかファイルなのか）を追加するのかを指定すれば
//    * それを追加してくれる
//    *
//    * @param {string} folderid - アイテム追加するフォルダのid
//    * @param {string} item - 追加するアイテムの名前
//    * @param {boolean} isFolder - フォルダかファイルか
//    * */
//   const handleInsertNode = (folderId: string, item: string, isFolder: boolean) => {
//     // @return {iExplorer} finalTree - アイテム追加が反映されたexplorerデータ
//     const finalTree = insertNode(explorer, folderId, item, isFolder);
//     console.log(finalTree);
//   };

//   /*****
//    * どのフォルダのどのアイテムなのか、idで指定すれば削除する
//    *
//    * @param {string} folderId - 削除するアイテムを所有しているフォルダのid
//    * @param {string} item - 削除するアイテムの名前
//    * @param {string} itemId - 削除するアイテムの名前
//    * @param {boolean} isFolder - 削除するアイテムはフォルダかファイルか   多分要らない。
//    * */
//   const handleDeleteNode = (folderId: string, itemId: string) => {
//     const updatedTree = deleteNode(explorer, folderId, itemId);
//     console.log(updatedTree);
//   };

//   // handleDeleteNode("7", "9");
// })();
