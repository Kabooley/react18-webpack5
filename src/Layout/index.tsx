import React from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import Header from "./Header";
import MainContainer from "./MainContainer";

const Layout = (): JSX.Element => {
  return (
    <div>
      <Header />
      <MainContainer>
        <EditorSection />
        <PreviewSection />
      </MainContainer>
    </div>
  );
};

export default Layout;
