/********************************************************
 * monaco.editor.ICodeEditorViewStateを保存しておくための場所。
 * modelのuri.path: そのmodelのIViewStateをペアにして補完する。
 * 
 * Reactの理の外に置きたいために作成した。
 * 再レンダリングを起こしたくない、
 * かつデータはアプリケーションが起動中は維持しておきたい
 * ******************************************************/ 
import monaco from 'monaco-editor';

// uri: monaco.Uri.path
interface iViewStateFile {
    [uriPath: string]: monaco.editor.ICodeEditorViewState;
};

// このリストは生成されたmodelに基づいて生成されるべきである。
const viewStateFiles = (() => {
    let _files: iViewStateFile = {};

    return {
        set: (file: iViewStateFile): void => {
            // NOTE: shallow copy
            // fileを直接渡すのではなく、そのコピーをいったん生成して渡す方法はどうだろうか？
            _files = Object.assign({}, _files, file);
        },
        get: (uriPath: string): monaco.editor.ICodeEditorViewState => {
            const _uri = Object.keys(_files).find(f => f === uriPath);
            return _files[_uri!];
        }
    }
})();

export default viewStateFiles;
 