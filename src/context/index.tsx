import { createContext } from 'react';

interface iCurrentFilePathContext {
    currentFilePath: string;
    setCurrentFilePath: (p: string) => void;
};

export const currentFilePathContext = createContext<iCurrentFilePathContext>({
    currentFilePath: "",
    setCurrentFilePath: () => {}
});

/**
 * Note: How to update context value from inside a child component
 * 
 * https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component
 * 
 * 
 * */ 