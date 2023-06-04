import React, { useState } from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import Header from "./Header";
import MainContainer from "./MainContainer";
import NavigationSection from "./NavigationSection";
import SplitPane from "./SplitPane";
import Pane from "./PaneSection";

const Layout = (): JSX.Element => {

  // NOTE: temporary, manage bundledcode til app adopted react-redux.
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
          <Pane />
          {/* NOTE: props: onBundled and bundledCode are temporarily til react-redux. */}
          <EditorSection onBundled={onBundled} />
          <PreviewSection bundledCode={bundledCode} />
        </SplitPane>
      </MainContainer>
    </>
  );
};

export default Layout;
