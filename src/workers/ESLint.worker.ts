import ESLint from 'eslint';    // TODO: need bundle
import config from '../config/eslint.json';

interface iRequestESLint {
    code: string;
    version: number;
};


// bundle eslint
self.onmessage = (e: MessageEvent<iRequestESLint>) => {
    const { code, version } = e.data;

    try {
        const markers = ESLint.verify(code, config).map(err => ({
            startLineNumber: err.line,
            endLineNumber: err.line,
            startColumn: err.column,
            endColumn: err.column,
            message: `${err.message} (${err.ruleId})`,
            severity: 3,
            source: 'ESLint',
        }));

        self.postMessage({ markers, version });
    }
    catch(e) {
        console.error(e);
    }
};