import * as monaco from 'monaco-editor';

/**
 * Get model by using path as a clue.
 * 
 * NOTE: monaco.editor.ITextModel.uri.path returns string like this:
 * `/src/index.js`.
 * On the other hand, path parameter string is like this;
 * `src/index.js`.
 * To compare them correctly, 
 * removing first slash of model.uri.path.
 * 
 * RE:
 * https://stackoverflow.com/a/3840645/22007575
 * */ 
export const getModelByPath = (path: string): monaco.editor.ITextModel | undefined=> {
    return monaco.editor.getModels().find(m => 
        m.uri.path.replace(/^\/+|\/+$/gm, '') === path
    );
};