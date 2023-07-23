/***
 * To use multiple context in Editor component,
 *
 *
 * TODO: Rename this componet to `EditorContext.tsx`.
 * */
import React from 'react';
import { useFiles, useFilesDispatch } from './FilesContext';
import { useBundledCodeDispatch } from './BundleContext';
import EditorContainer from '../components/EditorContainer';

const EditorContext = () => {
    const files = useFiles();
    const dispatchFiles = useFilesDispatch();
    const dispatchBundledCode = useBundledCodeDispatch();

    // DEBUG:

    return (
        <EditorContainer
            files={files}
            dispatchFiles={dispatchFiles}
            dispatchBundledCode={dispatchBundledCode}
        />
    );
};

export default EditorContext;
