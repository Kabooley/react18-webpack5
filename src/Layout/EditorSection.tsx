import React, { useState, useRef } from "react";
import MonacoContainer from "../components/MonacoContainer";
import { ResizableBox } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import '../index.css';

const EditorSection = (): JSX.Element => {
  const [editorSectionWidth, setEditorSectionWidth] = useState<number>(500);

  const onEditorSecResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    setEditorSectionWidth(size.width);
  };

  // NOTE: temporary. onBundled will be removed to another.
  const onBundled = (bundledCode: string) => {
    // manage bundled code.
  };

  return (
    <ResizableBox
      width={editorSectionWidth}
      height={Infinity}
      minConstraints={[200, Infinity]}
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
        <MonacoContainer onBundled={onBundled}/>
      </div>
    </ResizableBox>
  );
};
  
export default EditorSection;