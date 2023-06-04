import React from 'react';
import { PropsWithChildren } from "react";
import "../index.css";


const SplitPane = (props: PropsWithChildren): JSX.Element => {
  return <div className="split-pane">{props.children}</div>;
};

export default SplitPane;