/*** 
 * FilesContext
 * 
 * Managing File state and provide its context.
 * 
 * 大いに参考になったサイト：
 * https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
 * 
 * */ 
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { files, File } from '../data/files';
import type { iExplorer } from '../data/types';
import { getFileLanguage } from "../utils";

// --- Types ---

export enum Types {
  Reorder = 'REORDER_FILE',     // 名称が適切でないかも。結局のところ特定のファイルのパスを変更するだけだから。
  Delete = 'DELETE_FILE',
  DeleteMultiple = 'DELETE_MULTIPLE_FILES',
  Add = 'ADD_FILE',
  ChangeFile = 'CHANGE_FILE'
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
    requiredPath: string; 
  },
  [Types.DeleteMultiple]: {
    requiredPaths: string[]; 
  },
  [Types.Reorder]: {
    droppedId: string;
    draggableId: string;
    isFolder: boolean;
    entireTree: iExplorer;
  }
};

type iFilesActions = ActionMap<iFilesActionPayload>[keyof ActionMap<iFilesActionPayload>];


// --- Definitions ---

const FilesContext = createContext<File[]>([]);
const FilesDispatchContext = createContext<Dispatch<iFilesActions>>(() => null);

function filesReducer(files: File[], action: iFilesActions) {
  switch (action.type) {
    // Add single file.
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
    // Delete single File
    case 'DELETE_FILE': {
      const { requiredPath } = action.payload;
      const updatedFiles: File[] = files.filter(f => f.getPath() !== requiredPath);
      return [...updatedFiles];
    }
    // Delete more than one file.
    case 'DELETE_MULTIPLE_FILES' : {
      const { requiredPaths } = action.payload;
      const updatedFiles: File[] = files.filter(f => {
        return requiredPaths.find(r => r === f.getPath()) === undefined ? true : false;
      });
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


