import * as monaco from 'monaco-editor';

export const getModelByPath = (m: typeof monaco, path: string): monaco.editor.ITextModel | undefined=> {
    console.log(`[getModelByPath] lookin for ${path}`);
    return monaco.editor.getModels().find((_m, index) => {
        console.log(`${index}:`);
        console.log(`model.uri.path: ${_m.uri.path}`);
        const result = _m.uri.path === path;
        console.log(`result: ${result}`);
        return result;
    });
    // return monaco.editor.getModels().find(
    //     m => m.uri.path === path
    // );
};

// path: `src/index.tsx`
// m.uri.path: `/src/index.tsx`

// 原因は上記の通り