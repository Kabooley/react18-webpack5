export interface iFiles {
    [path: string]: iFile
};

export interface iFile {
    path: string;
    language: string;
    value: string;
};

interface iFileWithId extends iFile {
    id: number;
}

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



const filesProxy = (function(filesTemporary: iFile[]) {
    // 参照を持たせないため
    let _files: iFileWithId[] = filesTemporary.map((d, index) => {
        return {...d, id: index};
    });

    const _addFile = (newFile: iFile) => {
        if(!_files.find(_f => _f.path === newFile.path)){
            _files.push({
                ...newFile, id: new Date().getTime()
            });
        }
    };

    const _getFile = (path: string) => {
        const f = _files.find(_f => _f.path === path);
        // 
        // TODO: Make sure this way does return not a copy.
        // 
        return {
            path: f?.path,
            language: f?.language,
            value: f?.value,
            id: f?.id
        };
    };

    const _removeFile = (path: string) => {
        if(_files.find(_f => _f.path === path)) {
            _files = _files.filter(f => f.path !== path);
        }
    };

    const _updateFile = (
        id: number,
        {path, language, value}
        :{path?: string, language?: string, value?: string}) => {
            let found = _files.find(_f => _f.id === id);
            if(found) {
                found.path = path !== undefined ? path : found.path;
                found.language = language !== undefined ? language : found.language;
                found.value = value !== undefined ? value : found.value;
            }
    };


    // Check if path is same
    const _isFileAlreadyExist = (f: iFileWithId) => {
        return _files.find(_f => _f.path === f.path) === undefined
        ? true : false;
    };

    // ひとまずクリアする前に_filesをfileへ保存する。
    const clearAll = () => {
        filesTemporary = _files.map(f => f);
        // TODO: うまい配列の消し方は？
        _files = undefined;
    }


    return {
        addFile: _addFile,
        getFile: _getFile,
        removeFile: _removeFile,
        updateFile: _updateFile,
    }
})(filesTemporary);

// 要テスト