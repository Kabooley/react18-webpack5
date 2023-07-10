import "./styles.css";
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { files, File } from './files';

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
};

/*** 
 * FilesContext
 * 
 * Managing File state and provide its context.
 * 
 * 大いに参考になったサイト：
 * https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
 * 
 * */ 

// --- Types ---

export enum Types {
  Reorder = 'REORDER_FILE',     // 名称が適切でないかも。結局のところ特定のファイルのパスを変更するだけだから。
  Delete = 'DELETE_FILE',
  Add = 'ADD_FILE',
};

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      }
};

// NOTE: 内容はひと先ずである！
type iFilesActionPayload = {
  [Types.Add]: {
    requiredPath: string;
    isFolder: boolean;
  },
  [Types.Delete]: {
    deletionExplorer: iExplorer 
  },
  [Types.Reorder]: {
    path: string;
    isFolder: boolean;
  }
};

type iFilesActions = ActionMap<iFilesActionPayload>[keyof ActionMap<iFilesActionPayload>];


// --- Definitions ---

const FilesContext = createContext<File[]>([]);
const FilesDispatchContext = createContext<Dispatch<iFilesActions>>(() => null);

function filesReducer(files: File[], action: iFilesActions) {
  switch (action.type) {
    case 'ADD_FILE': {
      const { requiredPath, isFolder } = action.payload;
          // Make sure requiredPath is already exist.
        if(files.map(f => f.getPath()).find(p => p === requiredPath)) {
          throw new Error("[ADD_FILE] The required path is already exist");
      }
      const language = isFolder ? "" : getFileLanguage(requiredPath);
      return [
        ...files,
        new File(
          requiredPath, "", 
          language ? "" : (language === undefined ? "" : language), 
          isFolder
        )
      ];
    }
    // Explorerからactionを受け取らないという前提のもと
    // Explorerデータを取得する
    case 'DELETE_FILE': {
      const { deletionExplorer } = action.payload;
      const isDeletionTargetFolder = deletionExplorer.isFolder;
      const descendantPaths: string[] = getAllDescendants(deletionExplorer).map(d => d.path) as string[];
    
      // DEBUG:
      console.log('[DELETE_FILE] descendants:');
      console.log(descendantPaths);
    
      const deletionTargetPathArr = deletionExplorer.path.split('/');
    
      // DEBUG:
      console.log('[DELETE_FILE] deletionTartgetPathArr');
      console.log(deletionTargetPathArr);
    
      const updatedFiles: File[] = files.filter(f => {
          // In case deletion target is folder and f is also folder.
          if(f.isFolder() && isDeletionTargetFolder) {
            const comparandPathArr = f.getPath().split('/');
            if(deletionTargetPathArr.length > comparandPathArr.length) return true;
            
            
            let completeMatch: boolean = true;
            deletionTargetPathArr.forEach((p, index) => {
              completeMatch = (p === comparandPathArr[index]) && completeMatch;
            });
    
            // DEBUG:
            console.log(comparandPathArr);
            console.log(completeMatch);
    
            return completeMatch ? false : true;
          }
          // In case deletion target is a file, not any folder.
          else if(!descendantPaths.length){
            return f.getPath() !== deletionExplorer.path; 
          }
          // In case deletion target is folder but f is not folder.
          return descendantPaths.find(d => d === f.getPath())
            ? false : true;
      });
    
      
      // DEBUG:
      console.log("[DELETE_FILE] updatedFiles: ");
      updatedFiles.forEach(u => console.log(u.getPath()));

      return [...updatedFiles];
    }
    // Explorerからactionを受け取らないという前提のもと
    // Explorerデータを取得する
    case 'REORDER_FILE': {
      // TODO: Define what to do
      return [...files];
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};


const initialFiles: File[] = files.map(f => new File(f.path, f.value, f.language, f.isFolder));

// 
// https://stackoverflow.com/a/57253387/22007575
export const FilesProvider = ({ children }: { children: React.ReactNode }) => {
  const [files, dispatch] = useReducer(
    filesReducer,
    initialFiles
  );

  return (
    <FilesContext.Provider value={files}>
      <FilesDispatchContext.Provider value={dispatch}>
        {children}
      </FilesDispatchContext.Provider>
    </FilesContext.Provider>
  );
}

// --- Hooks ---

export function useFiles() {
  return useContext(FilesContext);
};

export function useFilesDispatch() {
  return useContext(FilesDispatchContext);
};


