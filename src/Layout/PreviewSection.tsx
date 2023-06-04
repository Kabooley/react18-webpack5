import React from "react";
import Preview from "../components/Preview";


// NOTE: temporarily til react-redux.
interface iProps {
  bundledCode: string;
};

const PreviewSection = ({ bundledCode }: iProps): JSX.Element => {
    return (
      <div className="preview-section">
        <Preview bundledCode={bundledCode} />
      </div>);
};
  
export default PreviewSection;