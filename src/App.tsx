import React, { useState } from "react";
// import Folder from "./components/Folder";
import Folder from "./components/Folder/index2";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./styles.css";
import { DragDropContext } from "react-beautiful-dnd";
import type * as typeOfRBD from "react-beautiful-dnd";
import { reorder } from './Tree';

export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);

  const { insertNode, deleteNode, updateNode } = useTraverseTree();

  const handleInsertNode = (
    folderId: string,
    item: string,
    isFolder: boolean
  ) => {
    const finalTree = insertNode(explorerData, folderId, item, isFolder);
    setExplorerData(finalTree);
  };

  /*****
   * どのフォルダのどのアイテムなのか、idで指定すれば削除する
   *
   * @param {string} itemId - 削除するアイテムの名前
   * @param {boolean} isFolder - 削除するアイテムはフォルダかファイルか   多分要らない。
   * */
  const handleDeleteNode = (itemId: string, isFolder: boolean) => {
    const updatedTree = deleteNode(explorer, itemId, isFolder);
    setExplorerData(updatedTree);
    console.log(updatedTree);
  };


  // TODO: implement on drag start process
  // https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md#ondragstart
  /**
   * TODO: Note about properties of ondragstart
   * 
   * @param {typeOfRBD.DragStart extends DraggableRubric} start - 
   *  DragStart.mode: MovementMode,   // 'FLUID' | 'SNAP'
   *  DraggableRubric.draggableId: DraggableId
   *  DraggableRubric.type: TypeId
   *  DraggableRubric.source: DraggableLocation
   * 
   *  DraggableLocation.droppableId: DroppableId,
   *  DraggableLocation.index: number,
   * 
   *  
   * @param {typeOfRBD.ResponderProvided} provided - 
   * */ 
  const onDragStart: typeOfRBD.OnDragStartResponder = (start, provided) => {
    console.log("[App] on drag start");


  };

  /***
   * @param {typeOfRBD.DragUpdate} update - 
   *    DragStart,
   *    DragUpdate.destination?: DraggableLocation,
   *    DragUpdate.combine?: Combine, 
   * 
   *    DragUpdate.destination: the location of where the dragging item is now.
   *    This can be null if the user is currently not dragging over any <Droppable />.
   * */ 
  const onDragUpdate: typeOfRBD.OnDragUpdateResponder = (update, provided) => {
    console.log("[App] on drag start");

  }

  // TODO: implement on drag end process
  /**
   * @param {typeOfRBD.DropResult} result -
   *    DropResult extends DragUpdate extends DragStart extends DraggableRubric
   * 
   * */ 
  const onDragEnd: typeOfRBD.OnDragEndResponder = (result) => {
    console.log("[App] on drag end");
    console.log(result);

    const { destination, source, draggableId, reason, type } = result;

    if (!destination) {
      return;
    }

    const sourceCategoryId = source.droppableId
    const destinationCategoryId = destination.droppableId

    // Reordering items
    if (type === 'droppable-item') {
      // If reordering within the same category
      if (sourceCategoryId === destinationCategoryId) {
        const updatedOrder = reorder(
          categories.find((category) => category.id === sourceCategoryId).items,
          source.index,
          destination.index
        )
        const updatedCategories = categories.map((category) =>
          category.id !== sourceCategoryId ? category : { ...category, items: updatedOrder }
        )

        setCategories(updatedCategories)
      } else {
        // Dragging to a different category
        const sourceOrder = categories.find((category) => category.id === sourceCategoryId).items
        const destinationOrder = categories.find(
          (category) => category.id === destinationCategoryId
        ).items

        const [removed] = sourceOrder.splice(source.index, 1)
        destinationOrder.splice(destination.index, 0, removed)

        destinationOrder[removed] = sourceOrder[removed]
        delete sourceOrder[removed]

        const updatedCategories = categories.map((category) =>
          category.id === sourceCategoryId
            ? { ...category, items: sourceOrder }
            : category.id === destinationCategoryId
            ? { ...category, items: destinationOrder }
            : category
        )

        setCategories(updatedCategories)
      }
    }

    // Reordering categories
    if (type === 'droppable-category') {
      const updatedCategories = reorder(categories, source.index, destination.index)

      setCategories(updatedCategories)
    }
    // ...
  };

  return (
    <div className="App">
      <DragDropContext 
        onDragEnd={onDragEnd} onDragStart={onDragStart}
        onDragUpdate={onDragUpdate} 
      >
        <Folder
          handleInsertNode={handleInsertNode}
          handleDeleteNode={handleDeleteNode}
          explorer={explorerData}
        />
      </DragDropContext>
    </div>
  );
};
