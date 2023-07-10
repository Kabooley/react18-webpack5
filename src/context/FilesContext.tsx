import React, { createContext, useContext, useReducer } from 'react';
import { files, File } from '../data/files';

type iFileActionTypes = { type: 'ADD' } | { type: 'DELETE' } | { type: 'REORDER' };

interface iFilesAction {
  type: 'ADD' | 'REORDER' | 'DELETE';
}


const FilesContext = createContext(null);
const FilesDispatchContext = createContext(null);

// 
// https://stackoverflow.com/a/57253387/22007575
export const FilesProvider = ({ children }: { children: React.ReactNode }) => {
  // useReducer<Reducer<STORE, ACTIONTYPE>>
  const [files, dispatch] = useReducer<React.Reducer<File[], iFileActionTypes>>(
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

export function useTasks() {
  return useContext(FilesContext);
}

export function useTasksDispatch() {
  return useContext(FilesDispatchContext);
}

function filesReducer(files: File[], action: iFilesAction) {
  switch (action.type) {
    case 'ADD': {
      return [...files];
    }
    case 'DELETE': {
      return [...files];
    }
    case 'REORDER': {
      return [...files];
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
};


const initialFiles: File[] = files.map(f => new File(f.path, f.value, f.language, f.isFolder));
