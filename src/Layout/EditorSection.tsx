import React, { useState, useRef } from "react";
import MonacoContainer from "../components/MonacoContainer";
// import { ResizableBox } from "react-resizable";

const EditorSection = (): JSX.Element => {

    return (
      <div className="editor-section">
        <MonacoContainer />
      </div>
    );
};
  
export default EditorSection;