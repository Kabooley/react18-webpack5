import React from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import Header from "./Header";
import MainContainer from "./MainContainer";
import Resizable from "../components/Resizable";

const Layout = (): JSX.Element => {
  return (
    <div>
      <Header />
      <MainContainer>
        <Resizable direction={"horizontal"} >
          <EditorSection />
        </Resizable>
        <PreviewSection />
      </MainContainer>
    </div>
  );
};

export default Layout;
