import React, { useState } from "react";
import "./styles.css";
import "./react-resizable-essentials.css";
import { Resizable, ResizableBox } from "react-resizable";
import type { ResizeCallbackData, ResizeHandle } from "react-resizable";

/***
 * resizable wraps...
 * - pane: horizotal
 * - editor-section: horizontal
 *
 *
 * 真っ暗で全然わからんけど、
 * 実はResizableBoxにハンドルはちゃんとついている
 * あとはハンドルを右辺全体に変更すること
 *
 *
 * TODO: react-resizable-essentials.cssは本当に必要か確認
 * TODO: 辺全体をハンドルにできるようにする
 * */
export default function App() {
  const [paneWidth, setPaneWidth] = useState<number>(300);
  const [editorSectionWidth, setEditorSectionWidth] = useState<number>(500);

  const onPaneResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    setPaneWidth(size.width);
  };

  const onEditorSecResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    setEditorSectionWidth(size.width);
  };

  return (
    <div className="App">
      <div className="header">HEADER</div>
      <div className="main-container">
        <nav className="navigation">NAV</nav>
        <div className="split-pane">
          <ResizableBox
            width={paneWidth}
            height={Infinity}
            minConstraints={[100, 100]}
            onResize={onPaneResize}
            // Expresses s: south, e: east, n: borth, w: west
            // resizeHandles={["sw", "se", "nw", "ne", "w", "e", "n", "s"]}
            resizeHandles={["e"]}
            handle={(h, ref) => (
              <span className={`custom-handle custom-handle-${h}`} ref={ref} />
            )}
          >
            <div className="pane" style={{ width: paneWidth }}>
              pane
            </div>
          </ResizableBox>
          <ResizableBox
            width={editorSectionWidth}
            height={Infinity}
            minConstraints={[100, 100]}
            onResize={onEditorSecResize}
            resizeHandles={["e"]}
            handle={(h, ref) => (
              <span className={`custom-handle custom-handle-${h}`} ref={ref} />
            )}
          >
            <div
              className="editor-section"
              style={{ width: editorSectionWidth }}
            >
              <div className="monaco-container">
                <div className="tabs-area">TABS</div>
                <div className="monaco-editor">EDITOR</div>
              </div>
            </div>
          </ResizableBox>
          <div className="preview">PREVIEW</div>
        </div>
      </div>
    </div>
  );
}
