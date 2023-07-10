import React, { useState } from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import Header from "./Header";
import MainContainer from "./MainContainer";
import NavigationSection from "./NavigationSection";
import SplitPane from "./SplitPane";
import Pane from "./PaneSection";
import { FilesProvider } from "../context/FilesContext";

/***
 * FilesProvider provides `files` and its action `dispatch`.
 * 
 * 
 * */ 
const Layout = (): JSX.Element => {

  // NOTE: temporary, manage bundledcode here.
  // TODO: move this logic to reducer and context.
  const [bundledCode, setBundledCode] = useState<string>("");

  const onBundled = (code: string) => {
    setBundledCode(code);
  };
  
  return (
    <>
      <Header />
      <MainContainer>
        <NavigationSection />
        <SplitPane>
          <FilesProvider>
            <Pane />
            <EditorSection onBundled={onBundled} />
            <PreviewSection bundledCode={bundledCode} />
          </FilesProvider>
        </SplitPane>
      </MainContainer>
    </>
  );
};

export default Layout;
