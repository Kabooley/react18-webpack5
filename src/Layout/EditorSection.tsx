import React, { useState, useRef } from "react";
import MonacoContainer from "../components/MonacoContainer";
import { ResizableBox } from "react-resizable";
import type { ResizeCallbackData } from "react-resizable";


// NOTE: onBundled is temporarily til react-redux.
interface iProps {
  onBundled: (code: string) => void;
};

const EditorSection = ({ onBundled }: iProps): JSX.Element => {
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
        <MonacoContainer onBundled={onBundled}/>
      </div>
    </ResizableBox>
  );
};
  
export default EditorSection;