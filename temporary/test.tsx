
import { useState } from 'react';
import "./styles.css";
import { Resizable, ResizableBox } from 'react-resizable';




/*** 
 * resizable wraps...
 * - pane: horizotal
 * - editor-section: horizontal
 * 
 * */ 
export default function App() {
  const [paneWidth, setPaneWidth] = useState<number>(100);

  const onPaneResize = (event, {node, size, handle}) => {
    setPaneWidth({ width: size.width});
  };

  return (
    <div className="App">
      <div className="header">HEADER</div>
      <div className="main-container">
        <nav className="navigation">NAV</nav>
        <div className="split-pane">
          <Resizable 
            width={400} height={600} 
            minConstraints={[100, 100]} 
            maxConstraints={[300, 300]}
            onResize={onPaneResize}
          >
            <div className="pane" style={{}}>pane</div>
          </Resizable>
          <div className="editor-section">
            <div className="monaco-container">
              <div className="tabs-area">TABS</div>
              <div className="monaco-editor">EDITOR</div>
            </div>
          </div>
          <div className="preview">PREVIEW</div>
        </div>
      </div>
    </div>
  );
}
