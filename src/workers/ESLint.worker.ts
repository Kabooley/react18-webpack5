// import ESLint from 'eslint';    // TODO: need bundle
// import config from '../config/eslint.json';

// interface iRequestESLint {
//     code: string;
//     version: number;
// };


// // bundle eslint
// self.onmessage = (e: MessageEvent<iRequestESLint>) => {
//     const { code, version } = e.data;

//     try {
//         const markers = ESLint.verify(code, config).map(err => ({
//             startLineNumber: err.line,
//             endLineNumber: err.line,
//             startColumn: err.column,
//             endColumn: err.column,
//             message: `${err.message} (${err.ruleId})`,
//             severity: 3,
//             source: 'ESLint',
//         }));

//         self.postMessage({ markers, version });
//     }
//     catch(e) {
//         console.error(e);
//     }
// };

interface iMessage {
    code: string;
    err: string;
};

self.onmessage = (e: MessageEvent<iMessage>) => {

    const { code, err } = e.data;

    if(err.length || code === undefined) return;

    self.postMessage({
        signal: "",
        error: "[ESLint webworker] Error: Something went wrong but there is no signal has been sent."
      });
      
    self.postMessage({
      signal: "This is ESLint webworker. I've got your message.",
      error: ""
    });
  
  
    setTimeout(() => {
      self.postMessage({
        signal: "This is ESLint webworker. Delayed message has been sent.",
        error: ""
      });
    }, 10000);
  
    setTimeout(() => {
      self.postMessage({
        signal: "This is ESLint webworker. Second Delayed message has been sent.",
        error: ""
      });
    }, 30000);

};