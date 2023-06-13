import type { iExplorer } from '../data/folderData';

const useTraverseTree = () => {
  // 
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

  // 
  // TODO: `explorer.id`だけで削除処理が完了するようにする
  // 
  const deleteNode = (
    tree: iExplorer,
    folderId: string, // 削除されるアイテムが含まれているフォルダのid
    itemId: string, // 削除するアイテムのid
  ): iExplorer => {

    if (tree.id === folderId) {
      console.log(`Delete item`);
      return {
        id: tree.id,
        name: tree.name,
        isFolder: tree.isFolder,
        items: tree.items.filter(item => item.id !== itemId)
      };
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return deleteNode(ob, folderId, itemId);
    });

    return { ...tree, items: latestNode };
  };

  // NOTE: developing...
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
    }
    else if(tree.id === folderId && !tree.isFolder) {
      // TODO: mpdify file
    }

    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return updateNode(ob, folderId, item, isFolder);
    });


    return { ...tree, items: latestNode };
  };

  return { insertNode, deleteNode, updateNode };
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