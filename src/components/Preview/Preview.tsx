/********************************************************
 * TODO: 修正が必要なのはBundledCode.tsxだけど、Bundling processが失敗したときの場合に対応したaction.payloadに変更すること。
 *
 *
 * ******************************************************/
import React, { useRef, useEffect } from 'react';
import { useBundledCode } from '../../context/BundleContext';

// const allowedOrigin = "http://localhost:8080";

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

const Preview = () => {
    const bundledCode = useBundledCode();
    const _refIframe = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        // DEBUG:

        _refIframe.current && (_refIframe.current.srcdoc = html);
        setTimeout(() => {
            _refIframe.current &&
                _refIframe.current.contentWindow!.postMessage(
                    bundledCode.bundledCode,
                    '*'
                );
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
            {bundledCode.error && (
                <div className="preview-error">{bundledCode.error.message}</div>
            )}
        </div>
    );
};

export default Preview;
