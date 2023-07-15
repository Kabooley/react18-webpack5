// /**
//  * 
//  * 
//  * 
//  * */ 
// import React from 'react';
// import { iExplorer } from '../../data/types';
// // Icons
// // import editPencil from '../../assets/pencil-edit.svg';
// import addFolder from '../../assets/add-folder.svg';
// import addFile from '../../assets/add-file.svg';
// import closeButton from '../../assets/close-button.svg';

// interface iTreeItem {
//     explorer: iExplorer;
//     setExpand: (expand: boolean) => void;
//     onDelete: (e: React.MouseEvent<HTMLDivElement>) => void;
//     handleNewItem: (e: React.MouseEvent<HTMLDivElement>,isFolder: boolean) => void;
//     onAddItem: (e: React.KeyboardEvent<HTMLInputElement>, addTo: string) => void;
//     handleNewItemNameInput: (e: React.ChangeEvent<HTMLInputElement>,isFolder: boolean) => void;
// }

// const TreeItem = ({
//     explorer,
//     setExpand,
//     onDelete,
//     handleNewItem,
//     onAddItem,
//     handleNewItemNameInput
// }: iTreeItem) => {

//     const folderFunctions = () => {
//         return (
//             <div className="folder--function">
//                 <div
//                     onClick={(e: React.MouseEvent<HTMLDivElement>) =>
//                     handleNewItem(e, true)
//                     }
//                 >
//                     <img src={addFolder} alt="add folder" />
//                 </div>
//                 <div
//                     onClick={(e: React.MouseEvent<HTMLDivElement>) =>
//                     handleNewItem(e, false)
//                     }
//                 >
//                 <img src={addFile} alt="add file" />
//                 </div>
//                 <div onClick={(e) => onDelete(e)}>
//                     <img src={closeButton} alt="delete folder" />
//                 </div>
//             </div>
//         );
//     }

//     if(explorer.isFolder) {
//         return (
//             <div className="folder" onClick={() => setExpand(!expand)}>
//                 <span>📁 {explorer.name}</span>
//                 {folderFunctions()}
//             </div>
//         );
//     }
//     else {

//     }
// };

// export default TreeItem;