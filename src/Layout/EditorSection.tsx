import React, { useState, useRef } from "react";
import { ResizableBox } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";
import EditorContext from "../context/BundledConsumer";


const EditorSection = (): JSX.Element => {
  const [editorSectionWidth, setEditorSectionWidth] = useState<number>(500);

  const onEditorSecResize: (
    e: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => any = (event, { node, size, handle }) => {
    setEditorSectionWidth(size.width);
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
        <EditorContext />
      </div>
    </ResizableBox>
  );
};
  
export default EditorSection;