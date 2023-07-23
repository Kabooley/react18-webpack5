/**************************************************
 *
 * ************************************************/
import React, { useState } from 'react';
import TreeColumnIconName from './TreeColumnIconName';
import ValidMessage from './ValidMessage';
import DragNDrop from './DragNDrop';
import { isFilenameValid, isFolderNameValid } from '../../utils';
import type { iExplorer } from '../../data/types';

// Icons
import addFolder from '../../assets/add-folder.svg';
import addFile from '../../assets/add-file.svg';
import closeButton from '../../assets/close-button.svg';
import textFileIcon from '../../assets/text-file.svg';
import folderIcon from '../../assets/folder.svg';

interface iProps {
    nestDepth: number;
    explorer: iExplorer;
    handleInsertNode: (requiredPath: string, isFolder: boolean) => void;
    handleDeleteNode: (explorer: iExplorer) => void;
    handleReorderNode: (droppedId: string, draggableId: string) => void;
}

const defaultNewFileName = 'Untitled.file.js';
const defaultNewDirectoryName = 'Untitled';

const Tree = ({
    explorer,
    nestDepth,
    handleInsertNode,
    handleDeleteNode,
    handleReorderNode,
}: iProps) => {
    const [expand, setExpand] = useState<boolean>(false);
    const [showInput, setShowInput] = useState({
        visible: false,
        isFolder: false,
    });
    // NOTE: state管理じゃなくてもいい気がするなぁ let変数でもいいような
    //
    // Use this state while being input form for new item.
    const [isInputBegun, setIsInputBegun] = useState<boolean>(false);
    const [isNameValid, setIsNameValid] = useState<boolean>(false);
    const [isNameEmpty, setIsNameEmpty] = useState<boolean>(false);
    const [dragging, setDragging] = useState<boolean>(false);

    const handleNewItem = (
        e: React.MouseEvent<HTMLDivElement>,
        isFolder: boolean
    ) => {
        e.stopPropagation();
        setExpand(true);
        setShowInput({
            visible: true,
            isFolder,
        });
    };

    const onAddItem = (
        e: React.KeyboardEvent<HTMLInputElement>,
        addTo: string
    ) => {
        const requiredPath = addTo.length
            ? addTo + '/' + e.currentTarget.value
            : e.currentTarget.value;
        if (e.keyCode === 13 && requiredPath && isNameValid) {
            handleInsertNode(requiredPath, showInput.isFolder);
            // Clear states
            setShowInput({ ...showInput, visible: false });
            setIsInputBegun(false);
            setIsNameValid(false);
            setIsNameEmpty(false);
        }
    };

    const handleNewItemNameInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        isFolder: boolean
    ) => {
        // DEBUG:

        setIsInputBegun(true);

        // Check if input form is empty.
        e.currentTarget.value.length
            ? setIsNameEmpty(false)
            : setIsNameEmpty(true);

        // Check if value is valid
        if (isFolder && isFolderNameValid(e.currentTarget.value)) {
            setIsNameValid(true);
        } else if (isFilenameValid(e.currentTarget.value)) {
            setIsNameValid(true);
        } else {
            setIsNameValid(false);
        }
    };

    const onDelete = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        handleDeleteNode(explorer);
    };

    // DND

    /***
     * Fires when the user starts dragging an item.
     *
     * */
    const onDragStart = (e: React.DragEvent, id: string) => {
        // DEBUG:

        setDragging(true);
        e.dataTransfer.setData('draggingId', id);
    };

    /**
     * Fires when dragged item evnters a valid drop target.
     *
     * */
    const onDragEnter = (e: React.DragEvent) => {
        // DEBUG:
    };

    /***
     * Fires when a draggaed item leaves a valid drop target.
     *
     * */
    const onDragLeave = (e: React.DragEvent) => {
        // DEBUG:
    };

    /**
     * Fires when a dragged item is being dragged over a valid drop target,
     * every handred milliseconds.
     *
     * */
    const onDragOver = (e: React.DragEvent) => {
        // DEBUG:

        e.preventDefault();
    };

    /***
     * Fires when a item is dropped on a valid drop target.
     *
     * */
    const onDrop = (e: React.DragEvent, droppedId: string) => {
        // DEBUG:

        const draggedItemId = e.dataTransfer.getData('draggingId') as string;
        e.dataTransfer.clearData('draggingId');
        handleReorderNode(droppedId, draggedItemId);
        setDragging(false);
    };

    if (explorer.isFolder) {
        return (
            <div>
                <DragNDrop
                    id={explorer.id}
                    index={Number(explorer.id)}
                    isDraggable={true}
                    onDragStart={(e) => onDragStart(e, explorer.id)}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, explorer.id)}
                    onDragOver={onDragOver}
                >
                    <div
                        className="treeColumn"
                        style={{ paddingLeft: `${nestDepth * 2.4}rem` }}
                    >
                        <div
                            className="TreeItem"
                            onClick={() => setExpand(!expand)}
                        >
                            <TreeColumnIconName explorer={explorer} />
                            <div className="TreeItem--function">
                                <div
                                    onClick={(
                                        e: React.MouseEvent<HTMLDivElement>
                                    ) => handleNewItem(e, true)}
                                >
                                    <img src={addFolder} alt="add folder" />
                                </div>
                                <div
                                    onClick={(
                                        e: React.MouseEvent<HTMLDivElement>
                                    ) => handleNewItem(e, false)}
                                >
                                    <img src={addFile} alt="add file" />
                                </div>
                                <div onClick={onDelete}>
                                    <img
                                        src={closeButton}
                                        alt="delete folder"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </DragNDrop>
                <div style={{ display: expand ? 'block' : 'none' }}>
                    {showInput.visible && (
                        <div
                            className="treeColumn"
                            style={{ paddingLeft: `${nestDepth * 2.4}rem` }}
                        >
                            <div className="inputContainer">
                                <div className="inputContainer--column">
                                    <span className="treeColumn-icon-name--icon">
                                        {showInput.isFolder ? (
                                            <img
                                                src={folderIcon}
                                                alt="folder icon"
                                            />
                                        ) : (
                                            <img
                                                src={textFileIcon}
                                                alt="text file icon"
                                            />
                                        )}
                                    </span>
                                    <input
                                        type="text"
                                        className={
                                            'inputContainer--input' +
                                            ' ' +
                                            (isNameValid
                                                ? '__valid'
                                                : '__invalid')
                                        }
                                        onKeyDown={(e) =>
                                            onAddItem(e, explorer.path)
                                        }
                                        onBlur={() => {
                                            setIsInputBegun(false);
                                            setShowInput({
                                                ...showInput,
                                                visible: false,
                                            });
                                        }}
                                        onChange={(e) =>
                                            handleNewItemNameInput(
                                                e,
                                                explorer.isFolder
                                            )
                                        }
                                        autoFocus
                                        placeholder={
                                            explorer.isFolder
                                                ? defaultNewDirectoryName
                                                : defaultNewFileName
                                        }
                                    />
                                </div>
                                <ValidMessage
                                    isNameEmpty={isNameEmpty}
                                    isInputBegun={isInputBegun}
                                    isNameValid={isNameValid}
                                />
                            </div>
                        </div>
                    )}
                    {/* In case test input Container. */}
                    {/* {explorer.name === "temporary" && (
              <div
                className="treeColumn"
                style={{ paddingLeft: `${nestDepth * 2.4}rem` }}
              >
                <div className="inputContainer">
                  <div className="inputContainer--column">
                    <div
                      style={{ display: "inline-block", verticalAlign: "middle" }}
                    >
                      <span className="treeColumn-icon-name--icon">
                        {showInput.isFolder ? (
                          <img src={folderIcon} alt="folder icon" />
                        ) : (
                          <img src={textFileIcon} alt="text file icon" />
                        )}
                      </span>
                    </div>
                    <input
                      type="text"
                      className={
                        "inputContainer--input" +
                        " " +
                        (isNameValid ? "__valid" : "__invalid")
                      }
                      onKeyDown={(e) => onAddItem(e, explorer.path)}
                      onBlur={() => {
                        setIsInputBegun(false);
                        setShowInput({ ...showInput, visible: false });
                      }}
                      onChange={(e) =>
                        handleNewItemNameInput(e, explorer.isFolder)
                      }
                      autoFocus
                      placeholder={
                        explorer.isFolder
                          ? defaultNewDirectoryName
                          : defaultNewFileName
                      }
                    />
                  </div>
                  <ValidMessage isNameEmpty={isNameEmpty} isInputBegun={isInputBegun} isNameValid={isNameValid} />
                </div>
              </div>
            )} */}
                    {explorer.items.map((exp: iExplorer) => {
                        const nd = nestDepth + 1;
                        return (
                            <Tree
                                key={exp.id}
                                handleInsertNode={handleInsertNode}
                                handleDeleteNode={handleDeleteNode}
                                handleReorderNode={handleReorderNode}
                                explorer={exp}
                                nestDepth={nd}
                            />
                        );
                    })}
                </div>
            </div>
        );
    } else {
        return (
            <DragNDrop
                id={explorer.id}
                index={Number(explorer.id)}
                isDraggable={true}
                onDragStart={(e) => onDragStart(e, explorer.id)}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, explorer.id)}
                onDragOver={onDragOver}
            >
                <div
                    className="treeColumn"
                    style={{ paddingLeft: `${nestDepth * 2.4}rem` }}
                >
                    <div className="TreeItem">
                        <TreeColumnIconName explorer={explorer} />
                        <div onClick={onDelete} className="TreeItem--function">
                            <img src={closeButton} alt="delete file" />
                        </div>
                    </div>
                </div>
            </DragNDrop>
        );
    }
};

export default Tree;
