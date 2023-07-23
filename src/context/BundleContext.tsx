/****
 * bundledCodeを提供する。
 * 更新されたbundledCodeを送信するdispatchを提供する。
 * 
 * */ 
import React, { createContext, useContext, useReducer, Dispatch } from 'react';

interface iBundledState {
    bundledCode: string;
    error: Error | null;
};

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
        error: Error | null;
    },
};
  
export type iBundledCodeActions = ActionMap<iBundledCodeActionsPayload>[keyof ActionMap<iBundledCodeActionsPayload>];

const BundledCodeContext = createContext<iBundledState>({ bundledCode: "", error: null });
const DispatchBundledCodeContext = createContext<Dispatch<iBundledCodeActions>>(() => null);

function bundledCodeReducer(bundledCode: iBundledState, action: iBundledCodeActions) {
    switch(action.type) {
        case Types.Update: {
            const { bundledCode, error } = action.payload;
            return {
                bundledCode: bundledCode, error: error
            };
        }
        default: {
          throw Error('Unknown action: ' + action.type);
        }
    }
};

const initialBundledCode: iBundledState = { bundledCode: "", error: null };

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