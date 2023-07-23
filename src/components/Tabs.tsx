import React, { useRef, useState } from 'react';
import { useFiles } from '../context/FilesContext';
import { getFilenameFromPath } from '../utils';

// NOTE: 無理やり型を合わせている。
// 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
// 回避している
interface iJSXNode extends Node {
    className?: string;
}

interface iProps {
    // Selected file path
    path: string;
    onChangeSelectedTab: (path: string) => void;
}

/***
 *
 * */
const Tabs = ({ path, onChangeSelectedTab }: iProps) => {
    const [selectedTabs, setSelectedTabs] = useState<string[]>([path]);
    const files = useFiles();
    const _refTabArea = useRef<HTMLDivElement>(null);
    const _refTabs = useRef(
        files.map(() => React.createRef<HTMLSpanElement>())
    );

    const changeTab = (
        selectedTabNode: HTMLSpanElement,
        desiredFilePath: string
    ) => {
        // 一旦すべてのtabのclassNameを'tab'にする
        for (var i = 0; i < _refTabArea.current!.childNodes.length; i++) {
            var child: iJSXNode = _refTabArea.current!.childNodes[i];
            if (/tab/.test(child.className!)) {
                child.className = 'tab';
            }
        }
        // 選択されたtabのみclassName='tab active'にする
        selectedTabNode.className = 'tab active';
        onChangeSelectedTab(desiredFilePath);
    };

    return (
        <div className="tabs-area" ref={_refTabArea}>
            {
                //
                files.map((file, index) => {
                    const _path = file.getPath();
                    return file.isFolder() ? null : (
                        <span
                            className={_path === path ? 'tab active' : 'tab'}
                            ref={_refTabs.current[index]}
                            onClick={() =>
                                changeTab(
                                    _refTabs.current[index].current!,
                                    _path
                                )
                            }
                            key={index}
                        >
                            {getFilenameFromPath(_path)}
                        </span>
                    );
                })
            }
        </div>
    );
};

export default Tabs;
