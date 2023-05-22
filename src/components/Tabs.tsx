import React, { useRef, useState } from 'react';
import { files } from '../data/files';
import type { iFile } from '../data/files';
import './Tabs.css';

interface iJSXNode extends Node {
    className?: string;
};


/***
 * - filesのすべてのタブをひとまず表示させている
 * 
 * TODO: propsからfiles情報を取得すること
 * TODO: filesの情報を基にタブを生成すること
 * TODO: filesの情報を基にrefを生成すること
 * 
 * mount時のアクティブタブは、files配列の一番初めのタブにする
 * */ 
const Tabs = () => {
    const _refTabArea = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<string>(files['react-typescript'].path);
    const _refTabs = useRef(
        Object.keys(files).map(() => React.createRef<HTMLSpanElement>())
    );

    const changeTab = (selectedTabNode: HTMLSpanElement, desiredFilePath: string) => {
        // 一旦すべてのtabのclassNameを'tab'にする
        for (var i = 0; i < _refTabArea.current!.childNodes.length; i++) {
            // NOTE: 無理やり型を合わせている。
            // 本来`child: Node`でclassNameというpropertyを持たないが、iJSXNode.classNameをoptionalにすることによって
            // 回避している
            var child: iJSXNode = _refTabArea.current!.childNodes[i];
            if (/tab/.test(child.className!)) {
                child.className = 'tab';
            }
        }
        // 選択されたtabのみclassName='tab active'にする
        selectedTabNode.className = 'tab active';
    };


    return (
        <div className="tab-area" ref={_refTabArea}>
            {
                Object.keys(files).map((key, index) => {
                    const file: iFile = files[key];
                        return (
                            <span 
                                className={file.path === activeTab ? "tab active": "tab"}
                                ref={_refTabs.current[index]}
                                onClick={() => changeTab(_refTabs.current[index].current!, file.path)}
                            >
                                {/*
                                 TODO: "/main.js"なので一番初めの'/'を取り除きたい 
                                 参考：
                                 https://stackoverflow.com/questions/10396074/remove-specific-characters-from-a-string-in-javascript
                                 */}
                                {file.path}
                            </span>
                        );
                })
            }
        </div>
    );
};

export default Tabs;