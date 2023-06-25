import React from 'react';
import { PropsWithChildren } from "react";

const MainContainer = (props: PropsWithChildren): JSX.Element => {
  return <div className="main-container">{props.children}</div>;
};

export default MainContainer;