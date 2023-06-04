import React, { useEffect } from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import Header from "./Header";
import MainContainer from "./MainContainer";
import NavigationSection from "./NavigationSection";
import SplitPane from "./SplitPane";
import Pane from "./PaneSection";

const Layout = (): JSX.Element => {

  return (
    <>
      <Header />
      <MainContainer>
        <NavigationSection />
        <SplitPane>
          <Pane />
          <EditorSection/>
          <PreviewSection />
        </SplitPane>
      </MainContainer>
    </>
  );
};

export default Layout;
