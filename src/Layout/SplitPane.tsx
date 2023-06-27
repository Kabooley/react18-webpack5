import React, { useState } from 'react';
import { PropsWithChildren } from "react";


const SplitPane = (props: PropsWithChildren): JSX.Element => {

  return <div className="split-pane">{props.children}</div>;
};

export default SplitPane;