import React, { useRef, useEffect } from 'react';

interface iProps {
    bundledCode: string;
    err?: string;
};

const allowedOrigin = "http://localhost:8080";

const html: string = `
    <html>
      <head>
        <style>html { background-color: white; }</style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          const handleError = (err) => {
            const root = document.querySelector('#root');
            root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
            console.error(err);
          };

          window.addEventListener('error', (event) => {
            event.preventDefault();
            handleError(event.error);
          });

          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              handleError(err);
            }
          }, false);
        </script>
      </body>
    </html>
  `;

const Preview = ({ bundledCode, err }: iProps) => {
    const _refIframe = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // DEBUG: 
        console.log("[Preview] got bundled code");
        
        _refIframe.current && (_refIframe.current.srcdoc = html);
        setTimeout(() => {
            _refIframe.current && _refIframe.current.contentWindow!.postMessage(bundledCode, "*")
        }, 50);
    }, [bundledCode]);

    return (
        <div className="preview-container">
            <iframe
                title="preview"
                ref={_refIframe}
                sandbox="allow-scripts"
                srcDoc={html}
            />
            {err && <div className="preview-error">{err}</div>}
        </div>
    );
};

export default Preview;