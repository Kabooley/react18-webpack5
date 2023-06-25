import React, { useRef, useEffect } from 'react';
import type { iFiles } from '../../data/files';

interface iProps {
    files: iFiles
};

/***
 * files[""].pathに基づいて各ファイルを描画する
 * 
 * viewはvscodeを参考にする
 * 
 * rootDir
 *  - directories
 *      - files
 *      - subdirectories
 *          - files
 *          - subdirectories
 *  - files
 * */ 
const Explorer = ({ files }: iProps) => {

    return (
        <div className="explorer">
            EXPLORER
        </div>
    );
};

export default Explorer;