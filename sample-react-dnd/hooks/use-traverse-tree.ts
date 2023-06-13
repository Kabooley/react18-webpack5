import type { iExplorer } from "../data/folderData";

const useTraverseTree = () => {
  function insertNode(
    tree: iExplorer,
    folderId: string,
    item: string,
    isFolder: boolean
  ): iExplorer {
    // Add folder or file:
    if (tree.id === folderId && tree.isFolder) {
      tree.items.unshift({
        id: "" + new Date().getTime(),
        name: item,
        isFolder,
        items: []
      });

      return tree;
    }

    // update its tree's items property.
    let latestNode: iExplorer[] = [];
    latestNode = tree.items.map((ob) => {
      return insertNode(ob, folderId, item, isFolder);
    });

    return { ...tree, items: latestNode };
  }

  // TODO: implement this yourself.
  const deleteNode = () => {};

  // TODO: implement this yourself.
  const updateNode = () => {};

  return { insertNode };
};

export default useTraverseTree;
