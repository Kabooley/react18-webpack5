import type { iExplorer } from '../../data/types';
import { File } from '../../data/files';

export const generateTreeNodeData = (
    entries: File[] = [],
    root: string = 'root'
): iExplorer => {
    entries.sort(function (a: File, b: File) {
        let aPath = a.getPath().toLowerCase(); // ignore upper and lowercase
        let bPath = b.getPath().toLowerCase(); // ignore upper and lowercase
        if (aPath < bPath) return -1;
        if (aPath > bPath) return 1;
        return 0;
    });

    let currentKey = 1;
    const rootNode = {
        id: `${currentKey}`,
        name: root,
        isFolder: true,
        items: [],
        path: '',
    };

    //create the folders
    entries.forEach((entry: File) => {
        if (entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        for (let i = 0; i < pathLen; i++) {
            let name = pathArr[i];
            let index = i;

            // If the child node doesn't exist, create it
            let child = current.items.find((item) => item.name === name);

            // if(child === undefined && index < ( pathLen - 1) && entry.isFolder()){
            if (child === undefined && index < pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: true,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                };
                current.items.push(child);
            }
            current = child!;
        }
    });

    //create the files
    entries.forEach((entry: File) => {
        if (entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        if (pathLen === 1) {
            let name = pathArr[0];
            currentKey = currentKey += 1;
            let node = {
                id: `${currentKey}`,
                name: name,
                isFolder: false,
                items: [],
                path: pathArr[0],
            };
            current.items.push(node);
            return;
        }

        pathArr.forEach((name, index) => {
            let child = current.items.find((item) => item.name === name);

            if (child === undefined && index === pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: false,
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                };
                current.items.push(child);
            } else if (child === undefined) {
                return;
            } else {
                current = child;
            }
        });
    });

    /**
     * Generate empty folders.
     *
     * NOTE: Run below loop after finishing generate non-empty folders and files.
     *
     * */
    entries.forEach((entry: File) => {
        if (!entry.isFolder()) return;

        const pathArr = entry.getPath().split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;

        // DEBUG:

        pathArr.forEach((name, index) => {
            let child: iExplorer | undefined = current.items.find(
                (item) => item.name === name
            );

            if (child === undefined && index === pathLen - 1) {
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: !index ? pathArr[0] : pathArr[index],
                    isFolder: true, // As this is folder.
                    items: [],
                    path: pathArr.slice(0, index + 1).join('/'),
                };
                current.items.push(child);
            } else if (child === undefined) {
                return;
            } else {
                current = child;
            }
        });
    });

    // DEBUG:

    return rootNode;
};

// /***
//  * TODO: - path情報だけを基に生成しないで、File[]から生成する
//  * TODO: - 空フォルダを認める
//  *
//  * */
// export const generateTreeNodeData = (
//     entries: File[] = [],
//     root: string = "root"
// ): iExplorer => {

//     /**
//      * return -1 then sort a after b
//      * return 1 then sort a before b
//      *
//      * */
//     entries.sort(function(a: File, b: File) {
//         let aPath = a.getPath().toLowerCase(); // ignore upper and lowercase
//         let bPath = b.getPath().toLowerCase(); // ignore upper and lowercase
//         if (aPath < bPath)  return -1;
//         if (aPath > bPath) return 1;
//         return 0;
//     });

//     let currentKey = 1;
//     const rootNode = {
//         id: `${currentKey}`,
//         name: root,
//         isFolder: true,
//         items: [],
//         path: "/"
//     };

//     //create the folders
//     entries.forEach((entry: File) => {

//         const pathArr = entry.getPath().split('/');
//         const pathLen = pathArr.length;
//         let current: iExplorer = rootNode;

//         for(let i = 0; i < pathLen; i++){
//             let name = pathArr[i];
//             let index = i;

//             // If the child node doesn't exist, create it
//             let child = current.items.find(item => item.name === name);

//             if(child === undefined && index < ( pathLen - 1) && entry.isFolder()){
//                 currentKey = currentKey += 1;
//                 child = {
//                     id: `${currentKey}`,
//                     name: name,
//                     isFolder: true,
//                     items: [],
//                     path: entry.getPath()
//                 };
//                 current.items.push(child);
//             }
//             current = child!;
//         }
//     });

//     //create the files
//     entries.forEach((entry: File) => {

//         if(entry.isFolder()) return;

//         const pathArr = entry.getPath().split('/');
//         const pathLen = pathArr.length;
//         let current: iExplorer = rootNode;

//         if(pathLen === 1){
//             let name = pathArr[0];
//             currentKey = currentKey += 1;
//             let node = {
//                 id: `${currentKey}`,
//                 name: name,
//                 isFolder: false,
//                 items: [],
//                 path: pathArr[0]
//             };
//             current.items.push(node);
//             return;
//         }

//         pathArr.forEach( (name, index) => {
//             let child = current.items.find(item => item.name === name);

//             if(child === undefined && index === ( pathLen - 1)){
//                 currentKey = currentKey += 1;
//                 child = {
//                     id: `${currentKey}`,
//                     name: name,
//                     isFolder: false,
//                     items: [],
//                     path: pathArr.slice(0, index + 1).join('/')
//                 };
//                 current.items.push(child);
//             }
//             else if( child === undefined ){
//                 return;
//             }
//             else
//             {
//                 current = child;
//             }
//         });
//     });
//     return rootNode;
// };

// export const generateTreeNodeData = (
//     entries: string[] = [],
//     root: string = "root"
// ): iExplorer => {
//
//
//     entries.sort(function(a, b) {
//         a = a.toLowerCase(); // ignore upper and lowercase
//         b = b.toLowerCase(); // ignore upper and lowercase
//         if (a < b)  return -1;
//         if (a > b) return 1;
//         return 0;
//     });

//     let currentKey = 1;
//     const rootNode = {
//         id: `${currentKey}`,
//         name: root,
//         isFolder: true,
//         items: [],
//         path: "/"
//     };

//     //create the folders
//     entries.forEach(pathStr => {

//         const pathArr = pathStr.split('/');
//         const pathLen = pathArr.length;
//         let current: iExplorer = rootNode;

//         for(let i = 0; i < pathLen; i++){
//             let name = pathArr[i];
//             let index = i;

//             // If the child node doesn't exist, create it
//             let child = current.items.find(item => item.name === name);

//             if(child === undefined && index < ( pathLen - 1) ){
//                 currentKey = currentKey += 1;
//                 child = {
//                     id: `${currentKey}`,
//                     name: name,
//                     isFolder: true,
//                     items: [],
//                     path: pathArr.slice(0, index + 1).join('/')
//                 };
//                 current.items.push(child);
//             }
//             current = child!;
//         }
//     });

//     //create the files
//     entries.forEach(pathStr => {

//         const pathArr = pathStr.split('/');
//         const pathLen = pathArr.length;
//         let current: iExplorer = rootNode;

//         if(pathLen === 1){
//             let name = pathArr[0];
//             currentKey = currentKey += 1;
//             let node = {
//                 id: `${currentKey}`,
//                 name: name,
//                 isFolder: false,
//                 items: [],
//                 path: pathArr[0]
//             };
//             current.items.push(node);
//             return;
//         }

//         pathArr.forEach( (name, index) => {
//             let child = current.items.find(item => item.name === name);

//             if(child === undefined && index === ( pathLen - 1)){
//                 currentKey = currentKey += 1;
//                 child = {
//                     id: `${currentKey}`,
//                     name: name,
//                     isFolder: false,
//                     items: [],
//                     path: pathArr.slice(0, index + 1).join('/')
//                 };
//                 current.items.push(child);
//             }
//             else if( child === undefined ){
//                 return;
//             }
//             else
//             {
//                 current = child;
//             }
//         });
//     });
//     return rootNode;
// };
