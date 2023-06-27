import type { iExplorer } from '../../data/explorerData';


export const generateTreeNodeData = (
    entries: string[] = [], 
    root: string = "root"
): iExplorer => {


    entries.sort(function(a, b) {
        a = a.toLowerCase(); // ignore upper and lowercase
        b = b.toLowerCase(); // ignore upper and lowercase
        if (a < b)  return -1;
        if (a > b) return 1;
        return 0;
    });

    let currentKey = 1;
    const rootNode = {
        id: `${currentKey}`,
        name: root,
        isFolder: true,
        items: []
    };


    //create the folders
    entries.forEach(pathStr => {

        const pathArr = pathStr.split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode;  

        for(let i = 0; i < pathLen; i++){
            let name = pathArr[i];
            let index = i;
            
            // If the child node doesn't exist, create it
            let child = current.items.find(item => item.name === name);

            if(child === undefined && index < ( pathLen - 1) ){
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: true,
                    items: []
                };
                current.items.push(child);
            }
            current = child!;
        }
    });


    //create the files
    entries.forEach(pathStr => {
    
        const pathArr = pathStr.split('/');
        const pathLen = pathArr.length;
        let current: iExplorer = rootNode; 
    
        if(pathLen === 1){
            let name = pathArr[0];
            currentKey = currentKey += 1;
            let node = {
                id: `${currentKey}`,
                name: name,
                isFolder: false,
                items: []
            };
            current.items.push(node);
            return;
        }  
        
        pathArr.forEach( (name, index) => {
            let child = current.items.find(item => item.name === name);

            if(child === undefined && index === ( pathLen - 1)){
                currentKey = currentKey += 1;
                child = {
                    id: `${currentKey}`,
                    name: name,
                    isFolder: false,
                    items: []
                };
                current.items.push(child);
            }
            else if( child === undefined ){
                return;
            }
            else
            {
                current = child;
            }
        });
    });
    return rootNode;
};
