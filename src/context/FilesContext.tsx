/***
 * FilesContext
 *
 * Managing File state and provide its context.
 *
 * 型付けにおいて大いに参考になったサイト：
 * https://dev.to/elisealcala/react-context-with-usereducer-and-typescript-4obm
 *
 *
 * TODO: selected file情報を持つべきか否かの検討
 *
 *
 *
 * */
import React, { createContext, useContext, useReducer, Dispatch } from 'react';
import { files, File } from '../data/files';
import { getFileLanguage } from '../utils';

// --- Types ---

export enum Types {
    Delete = 'DELETE_FILE',
    DeleteMultiple = 'DELETE_MULTIPLE_FILES',
    Add = 'ADD_FILE',
    Change = 'CHANGE_FILE',
    ChangeMultiple = 'CHANGE_MULTIPLE_FILES',

    // NOTE: Experimental
    ChangeSelectedFile = 'CHANGE_SELECTED_FILE',
}

type ActionMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: M[Key] extends undefined
        ? {
              type: Key;
          }
        : {
              type: Key;
              payload: M[Key];
          };
};

type iFilesActionPayload = {
    [Types.Add]: {
        requiredPath: string;
        isFolder: boolean;
    };
    [Types.Delete]: {
        requiredPath: string;
    };
    [Types.DeleteMultiple]: {
        requiredPaths: string[];
    };
    [Types.Change]: {
        targetFilePath: string;
        changeProp: {
            newPath?: string;
            newValue?: string;
        };
    };
    [Types.ChangeMultiple]: {
        targetFilePath: string;
        changeProp: {
            newPath?: string;
            newValue?: string;
        };
    }[];
    [Types.ChangeSelectedFile]: {
        selectedFilePath: string;
    };
};

export type iFilesActions =
    ActionMap<iFilesActionPayload>[keyof ActionMap<iFilesActionPayload>];

// --- Definitions ---

// To use context in class component,
// these created contexts are needed to be exported.
export const FilesContext = createContext<File[]>([]);
export const FilesDispatchContext = createContext<Dispatch<iFilesActions>>(
    () => null
);

function filesReducer(files: File[], action: iFilesActions) {
    // DEBUG:

    switch (action.type) {
        // Add single file.
        case 'ADD_FILE': {
            const { requiredPath, isFolder } = action.payload;
            // Make sure requiredPath is already exist.
            if (files.map((f) => f.getPath()).find((p) => p === requiredPath)) {
                throw new Error(
                    '[ADD_FILE] The required path is already exist'
                );
            }
            const language = isFolder ? '' : getFileLanguage(requiredPath);
            return [
                ...files,
                new File(
                    requiredPath,
                    '',
                    language ? '' : language === undefined ? '' : language,
                    isFolder
                ),
            ];
        }
        // Delete single File
        case 'DELETE_FILE': {
            const { requiredPath } = action.payload;
            const updatedFiles: File[] = files.filter(
                (f) => f.getPath() !== requiredPath
            );
            // DEBUG:

            return [...updatedFiles];
        }
        // Delete more than one file.
        case 'DELETE_MULTIPLE_FILES': {
            const { requiredPaths } = action.payload;
            const updatedFiles: File[] = files.filter((f) => {
                return requiredPaths.find((r) => r === f.getPath()) ===
                    undefined
                    ? true
                    : false;
            });

            return [...updatedFiles];
        }
        // Change file property.
        case 'CHANGE_FILE': {
            const { targetFilePath, changeProp } = action.payload;
            const updatedFiles = files.map((f) => {
                if (f.getPath() === targetFilePath) {
                    changeProp.newPath !== undefined &&
                        f.setPath(changeProp.newPath);
                    changeProp.newValue !== undefined &&
                        f.setValue(changeProp.newValue);
                    return f;
                } else return f;
            });

            // DEBUG:

            return [...updatedFiles];
        }
        // Change multiple files property.
        case 'CHANGE_MULTIPLE_FILES': {
            const requests = action.payload;
            const updatedFiles = files.map((f) => {
                const request = requests.find(
                    (r) => f.getPath() === r.targetFilePath
                );
                if (request !== undefined) {
                    request.changeProp.newPath !== undefined &&
                        f.setPath(request.changeProp.newPath);
                    request.changeProp.newValue !== undefined &&
                        f.setValue(request.changeProp.newValue);
                    return f;
                } else return f;
            });

            // DEBUG:

            return [...updatedFiles];
        }
        case 'CHANGE_SELECTED_FILE': {
            const { selectedFilePath } = action.payload;
            const updatedFiles = files.map((f) => {
                f.getPath() === selectedFilePath
                    ? f.setSelected()
                    : f.unselected();
                return f;
            });
            return [...updatedFiles];
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

const initialFiles: File[] = files.map(
    (f) => new File(f.path, f.value, f.language, f.isFolder)
);

// NOTE: 初期選択ファイルをここで指定する。
const defaultSelectedFilePath = 'src/index.tsx';
initialFiles
    .find((f) => f.getPath() === defaultSelectedFilePath)
    ?.setSelected();

// https://stackoverflow.com/a/57253387/22007575
export const FilesProvider = ({ children }: { children: React.ReactNode }) => {
    const [files, dispatch] = useReducer(filesReducer, initialFiles);

    return (
        <FilesContext.Provider value={files}>
            <FilesDispatchContext.Provider value={dispatch}>
                {children}
            </FilesDispatchContext.Provider>
        </FilesContext.Provider>
    );
};

// --- Hooks ---

export function useFiles() {
    return useContext(FilesContext);
}

export function useFilesDispatch() {
    return useContext(FilesDispatchContext);
}
