import React, { useRef } from 'react';

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

const Tabs = () => {
    const _refTabArea = useRef<HTMLDivElement>(null);
    // ハードコーディング
    const _refJSTab = useRef<HTMLSpanElement>(null);
    const _refJSTab2 = useRef<HTMLSpanElement>(null);
    const _refCSSTab = useRef<HTMLSpanElement>(null);
    const _refHTMLTab = useRef<HTMLSpanElement>(null);

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

        // 以下の処理は親コンポーネントから引っ張ってくる関数に任せてもいいかも
        // -------
            // 切り替える前のeditorのviewstateヲ取り出して
            var currentState = editor.saveViewState();

            // 切り替える前のmodelのstateを保存しておく
            var currentModel = editor.getModel();
            if (currentModel === data.js.model) {
                data.js.state = currentState;
            } else if (currentModel === data.css.model) {
                data.css.state = currentState;
            } else if (currentModel === data.html.model) {
                data.html.state = currentState;
            }

            // modelを切り替えて...
            editor.setModel(data[desiredModelId].model);
            // 切り替わったmodelのstateを適用する
            editor.restoreViewState(data[desiredModelId].state);
            editor.focus();
        // -----------
    };

    return (
        <div className="tabArea" ref={_refTabArea}>
            <span 
                className="tab active" 
                ref={_refJSTab} 
                onClick={() => changeTab(_refJSTab.current!, "js")}
            >jstab</span>
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