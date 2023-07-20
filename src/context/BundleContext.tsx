/****
 * Dispatchいらんなぁ。
 * 
 * */ 
import React, { createContext, useContext, useReducer } from 'react';

export enum Types {
    Bundle = 'BUNDLE_CODE',
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
  
type iBundleActionPayload = {
    [Types.Bundle]: {
        code: string;
    },
};
  
type iBundleActions = ActionMap<iBundleActionPayload>[keyof ActionMap<iBundleActionPayload>];

const BundledCodeContext = createContext<string>("");
const DispatchBundledContext = createContext<Dispatch<>>(() => null);

function bundleReducer(bundledCode: string, action: iBundleActions) {
    switch(action.type) {
        case 'BUNDLE_CODE': {

        }
        default: {
          throw Error('Unknown action: ' + action.type);
        }
    }
};

const initialBundledCode: string = "";

export const BundledCodeProvider = ({ children }: { children: React.ReactNode}) => {
    const [bundledCode, dispatch] = useReducer(
        bundleReducer, initialBundledCode
    );

    return (
        <BundledCodeContext.Provider value={bundledCode}>
            <DispatchBundledContext.Provider value={dispatch}>
            {children}
            </DispatchBundledContext.Provider>
        </BundledCodeContext.Provider>
    );
};

export function useBundledCode() {
    return useContext(BundledCodeContext);
};

export function useBundledCodeDispatch() {
    return useContext(DispatchBundledContext);
};