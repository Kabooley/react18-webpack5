import React from "react";
import MonacoContainer from "../components/MonacoContainer";

const EditorSection = (): JSX.Element => {

  // NOTE: temporary. onBundled will be removed to another.
  const onBundled = (bundledCode: string) => {
    // manage bundled code.
  };

    return (
      <div className="editor-section">
        <MonacoContainer onBundled={onBundled}/>
      </div>);
};
  
export default EditorSection;