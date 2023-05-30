import React, { useEffect } from "react";
import EditorSection from "./EditorSection";
import PreviewSection from "./PreviewSection";
import Header from "./Header";
import MainContainer from "./MainContainer";
// import Resizable from "../components/Resizable";

const Layout = (): JSX.Element => {

  useEffect(() => {
    window.addEventListener('resize', calcElementRect);
  
    return () => {
      window.removeEventListener('resize', calcElementRect);
    }
  }, []);
  
  
  const calcElementRect = () => {
    const elementList = [
      "div.main-container",
      // "div.react-resizable",
      "div.monaco-container",
      "div.monaco-editor",
    ];
    elementList.forEach(l => {
      const el = document.querySelector(l) as HTMLDivElement;
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      console.log(l);
      console.log(`width: ${width}`);
      console.log(`height: ${height}`);
      console.log(el.getBoundingClientRect());
      console.log("-------");
    });
  };

  return (
    <div>
      <Header />
      <MainContainer>
        <EditorSection/>
        <PreviewSection />
      </MainContainer>
    </div>
  );
  // return (
  //   <div>
  //     <Header />
  //     <MainContainer>
  //       <Resizable direction={"horizontal"} >
  //         <EditorSection />
  //       </Resizable>
  //       <PreviewSection />
  //     </MainContainer>
  //   </div>
  // );
};

export default Layout;
