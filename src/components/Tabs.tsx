import React, { useRef } from 'react';
import { files } from '../data/files';
import type { iFile } from '../data/files';

var data = {
	js: {
		model: null,
		state: null
	},
	css: {
		model: null,
		state: null
	},
	html: {
		model: null,
		state: null
	}
};

interface iJSXNode extends Node {
    className?: string;
};


/***
 * TODO: propsからfiles情報を取得すること
 * TODO: filesの情報を基にタブを生成すること
 * TODO: filesの情報を基にrefを生成すること
 * 
 * */ 
const Tabs = () => {
    const _refTabArea = useRef<HTMLDivElement>(null);
    // ハードコーディング
    const _refJSTab = useRef<HTMLSpanElement>(null);
    const _refJSTab2 = useRef<HTMLSpanElement>(null);
    const _refCSSTab = useRef<HTMLSpanElement>(null);
    const _refHTMLTab = useRef<HTMLSpanElement>(null);

    const _refCurrentTab = useRef<HTMLSpanElement>(null);

    const changeTab = (selectedTabNode: HTMLSpanElement, desiredModelId: string) => {
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
        <div className="tabArea" ref={_refTabArea}>
            {
                Object.keys(files).map((key, index) => {
                    const file: iFile = files[key];
                    return (
                        <span 
                            className={ index ? "tab" : "tab active"} 
                            ref={} 
                            onClick={() => changeTab(_refJSTab.current!, "js")}
                        >{}</span>
                    )
                })
            }

            <span 
                className="tab" 
                ref={_refJSTab2} 
                onClick={() => changeTab(_refJSTab2.current!, "js")}
            >jstab2</span>
            <span 
                className="tab" 
                ref={_refCSSTab} 
                onClick={() => changeTab(_refCSSTab.current!, "css")}
            >csstab</span>
            <span 
                className="tab" 
                ref={_refHTMLTab} 
                onClick={() => changeTab(_refHTMLTab.current!, "js")}
            >htmltab</span>
        </div>
    );
};

export default Tabs;