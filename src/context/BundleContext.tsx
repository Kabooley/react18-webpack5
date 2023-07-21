/****
 * bundledCodeを提供する。
 * 更新されたbundledCodeを送信するdispatchを提供する。
 * 
 * */ 
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

export enum Types {
    Update = 'UPDATE_BUNDLED_CODE',
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
  
type iBundledCodeActionsPayload = {
    [Types.Update]: {
        bundledCode: string;
    },
};
  
type iBundledCodeActions = ActionMap<iBundledCodeActionsPayload>[keyof ActionMap<iBundledCodeActionsPayload>];

const BundledCodeContext = createContext<string>("");
const DispatchBundledCodeContext = createContext<Dispatch<iBundledCodeActions>>(() => null);

function bundledCodeReducer(bundledCode: string, action: iBundledCodeActions) {
    switch(action.type) {
        case Types.Update: {
            return action.payload.bundledCode;
        }
        default: {
          throw Error('Unknown action: ' + action.type);
        }
    }
};

const initialBundledCode: string = "";

export const BundledCodeProvider = ({ children }: { children: React.ReactNode}) => {
    const [bundledCode, dispatch] = useReducer(
        bundledCodeReducer, initialBundledCode
    );

    return (
        <BundledCodeContext.Provider value={bundledCode}>
            <DispatchBundledCodeContext.Provider value={dispatch}>
            {children}
            </DispatchBundledCodeContext.Provider>
        </BundledCodeContext.Provider>
    );
};

export function useBundledCode() {
    return useContext(BundledCodeContext);
};

export function useBundledCodeDispatch() {
    return useContext(DispatchBundledCodeContext);
};