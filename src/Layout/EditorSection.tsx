import React from "react";
import MonacoContainer from "../components/MonacoContainer";
import Tabs from "../components/Tabs";

const EditorSection = (): JSX.Element => {
    return (
      <div className="editor-section">
        <Tabs />
        <MonacoContainer />
      </div>);
};
  
export default EditorSection;