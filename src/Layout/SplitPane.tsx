import React from 'react';
import { PropsWithChildren } from "react";
import "../index.css";

/***
 * Wraps pane, editor-section, preview
 * 
 * */ 
const SplitPane = (props: PropsWithChildren): JSX.Element => {
  return <div className="split-pane">{props.children}</div>;
};

export default SplitPane;