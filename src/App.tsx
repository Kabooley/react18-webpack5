import React, { useState, useEffect } from "react";
import Folder from "./components/Folder";
import useTraverseTree from "./hooks/use-traverse-tree";
import explorer from "./data/folderData";
import "./styles.css";
import { DragDropContext } from "react-beautiful-dnd";
import type * as typeOfRBD from "react-beautiful-dnd";
import { 
    getParentNodeByChildId, 
    retrieveFromExplorer, 
    pushIntoExplorer 
  } from './Tree';

export default function App() {
  const [explorerData, setExplorerData] = useState(explorer);
  
  useEffect(() => {
    console.log("[App] component did update");
  }, []);

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
    console.log(start);
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
    console.log("[App] on drag update");
    console.log(update);    // drag中ホバーしたdroppableをdestinaitonとして確認できる

  }

  /**
   * @param {typeOfRBD.DropResult} result -
   * 
   * 
   * */ 
  const onDragEnd: typeOfRBD.OnDragEndResponder = (result) => {
    console.log("[App] on drag end");
    console.log(result);

    const { destination, source, draggableId, reason } = result;

    if (!destination) {
      return;
    }


    // Check which folder draggable has been belonged.
    const prevFolder =  getParentNodeByChildId(explorerData, draggableId);
    const droppedFolder = getParentNodeByChildId(explorerData, destination.droppableId);
    if(!prevFolder || !droppedFolder) throw new Error("[App] draggableId/destination.droppableId is not belongs to any parent explorer object.");

    // DEBUG:
    console.log(prevFolder);
    console.log(droppedFolder);

    if(prevFolder.id === droppedFolder.id) {return;}

    console.log("[onDragEnd] reorder item");
    
    const retrieved = retrieveFromExplorer(explorerData, draggableId);
    console.log("[onDragEnd] retrieved:");
    console.log(retrieved);
    const exp = retrieved && pushIntoExplorer(explorerData, retrieved, droppedFolder.id);
    
    console.log(exp);

    // NOTE: なんでか知らんが更新されん
    setExplorerData(exp!);
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
