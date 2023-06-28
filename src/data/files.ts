export interface iFiles {
    [path: string]: iFile
};

export interface iFile {
    path: string;
    language: string;
    value: string;
};

export const files: iFiles = {
    'javascript': {
        path: '/main.js',
        language: 'javascript',
        value: `var salute = "salute!!";`
    },
    'typescript': {
        path: '/main.ts',
        language: 'typescript',
        value: `const jungleBeats: string = "Holla at me, boo";`
    },
    'react': {
        path: '/main.jsx',
        language: 'javascript',
        value: ``
    },
    'react-typescript': {
        path: '/main.tsx',
        language: 'typescript',
        value: `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`
    },
};

export const filesTemporary: iFile[] = [
    {
        path: '/main.js',
        language: 'javascript',
        value: `var salute = "salute!!";`
    },
    {
        path: '/main.ts',
        language: 'typescript',
        value: `const jungleBeats: string = "Holla at me, boo";`
    },
    {
        path: '/main.jsx',
        language: 'javascript',
        value: ``
    },
    {
        path: '/main.tsx',
        language: 'typescript',
        value: `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`
    },
];

class File {
    constructor(
        private _path: string,
        private _language: string,
        private _value: string
    ){};

    get path() {
        return this._path;
    };

    get language() {
        return this._language;
    };

    get value() {
        return this._value;
    };

    // // 必須ではないけどあったら便利かも
    // get name() {
    //     // 正規表現を使ってpathの「ファイル名.拡張子」部分を返す
    // };

    set updatePath(p: string) {
        this._path = p;
    };

    set changeLanguage(l: string) {
        this._language = l;
    };

    set updateValue(v: string) {
        this._value = v;
    };
};

// -- USAGE --
// 
// In case you need treat them as array.
const genFiles: File[] = filesTemporary.map(f => new File(
    f.path, f.language, f.value
));
