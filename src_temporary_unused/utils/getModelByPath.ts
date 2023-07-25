import * as monaco from 'monaco-editor';

export const getModelByPath = (m: typeof monaco, path: string): monaco.editor.ITextModel | undefined=> {
    return monaco.editor.getModels().find(
        m => m.uri.path === path
    );
};