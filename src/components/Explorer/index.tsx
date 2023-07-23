import React from "react";
import Tree from "./Tree";
import { isNodeIncludedUnderExplorer, getNodeById, getAllDescendants, getParentNodeByChildId } from "./utils";
import type { iExplorer } from '../../data/types';
import { File } from '../../data/files';
import { generateTreeNodeData } from "./generateTree";
import { useFiles, useFilesDispatch } from "../../context/FilesContext";
import { Types } from "../../context/FilesContext";



export default function FileExplorer() {

  const files = useFiles();
  const filesDispatch = useFilesDispatch();
  const explorerData = generateTreeNodeData(files, "root");

  /***
   * 
   * */ 
  const handleInsertNode = (requiredPath: string, isFolder: boolean): void => {
    filesDispatch({
      type: Types.Add,
      payload: {
        requiredPath: requiredPath,
        isFolder: isFolder
      }
    });
  };
 
  const handleDeleteNode = (_explorer: iExplorer) => {
    const isDeletionTargetFolder = _explorer.isFolder;
    const descendantPaths: string[] = getAllDescendants(_explorer).map(d => d.path) as string[];
  
    // DEBUG:
    
    
  
    const deletionTargetPathArr = _explorer.path.split('/');
  
    // DEBUG:
    
    
  
    const deletionTargetFiles: File[] = files.filter(f => {
        // In case deletion target is folder and f is also folder.
        if(f.isFolder() && isDeletionTargetFolder) {
          const comparandPathArr = f.getPath().split('/');
          if(deletionTargetPathArr.length > comparandPathArr.length) return false;
          
          
          let completeMatch: boolean = true;
          deletionTargetPathArr.forEach((p, index) => {
            completeMatch = (p === comparandPathArr[index]) && completeMatch;
          });
  
          // DEBUG:
          
          
  
          // return completeMatch ? false : true;
          return completeMatch ? true : false;
        }
        // In case deletion target is a file, not any folder.
        else if(!descendantPaths.length){
          return f.getPath() === _explorer.path; 
        }
        // In case deletion target is folder but f is not folder.
        return descendantPaths.find(d => d === f.getPath())
          ? true : false;
    });
  

    filesDispatch({
      type: Types.DeleteMultiple,
      payload: {
        requiredPaths: deletionTargetFiles.map(d => d.getPath())
      }
    });
  };
  
  /**
   * pathを変更する対象をすべて取得する
   * pathがどう変更されるべきかを決定する
   * 変更リクエストをdispatchする
   * type: Types.Change | Types.ChangeMultiple
   * */ 
  const handleReorderNode = (droppedId: string, draggableId: string): void => {
    
    if(droppedId === draggableId) { return; }
  
    // Check if the dropped area is under dragging item
    if(isNodeIncludedUnderExplorer(explorerData, droppedId, draggableId)){
      return;
    }
    const movingItem: iExplorer | undefined = getNodeById(explorerData, draggableId);
    const droppedArea: iExplorer | undefined = getNodeById(explorerData, droppedId);
    const movingFile: File | undefined = files.find(f => f.getPath() === movingItem!.path);

    if(movingFile === undefined || droppedArea === undefined || movingItem === undefined) throw new Error("Something went wrong but File/Explorer cannot be found by draggableId/droppedId.");
    
    // NOTE: Dealing with two cases where droppedArea is folder or not.
    let appendPath = (droppedArea.isFolder ? droppedArea.path : getParentNodeByChildId(explorerData, droppedArea.id)!.path);
    if(appendPath.length) { appendPath = appendPath + '/'; }

    // DEBUG:
    
    
    
    
  

    // Dealing with three cases where movingItem is folder, empty folder, file.
    if(movingItem.isFolder) {
  
      let descendantPaths = getAllDescendants(movingItem).map(d => d.path) as string[];
      const isFolderEmpty = descendantPaths.length ? false : true;
  
      if(!isFolderEmpty) {
        // In case movingItem is folder and not empty.

        // DEBUG:
        
  
        // By pushing item, no longer `descendantPaths` is not descendant paths.
        // But keep the name in this scope.
        descendantPaths.push(movingFile.getPath());
        const movingFilePathArr = movingFile.getPath().split('/');
        const reorderingFiles = files.filter(f => descendantPaths.find(d => d === f.getPath()) );
  
        filesDispatch({
          type: Types.ChangeMultiple,
          payload: [
            ...reorderingFiles.map(r => {
              return {
                targetFilePath: r.getPath(),
                changeProp: {
                  newPath: appendPath + r.getPath().split('/').slice(movingFilePathArr.length - 1, r.getPath().length).join('/')
                }
              }
            })
          ]
        });
      }
      else {
        // In case movingItem is empty folder:

        // DEBUG:
        

        filesDispatch({
          type: Types.Change,
          payload: {
            targetFilePath: movingFile.getPath(),
            changeProp: {
              newPath: appendPath + movingFile.getPath().split('/').pop()
            }
          }
        });
      }
    }
    else {
      // In case movingItem is not folder:
      
      // DEBUG:
      

      filesDispatch({
        type: Types.Change,
        payload: {
          targetFilePath: movingFile.getPath(),
          changeProp: {
            newPath: appendPath + movingFile.getPath().split('/').pop()
          }
        }
      });
    }
  };

  return (
    <div className="file-explorer">
        <Tree
          key={explorerData.id}
          handleInsertNode={handleInsertNode}
          handleDeleteNode={handleDeleteNode}
          handleReorderNode={handleReorderNode}
          explorer={explorerData}
          nestDepth={0}
        />
    </div>
  );
};