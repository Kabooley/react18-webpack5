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




export const filesProxy = (function(filesTemporary: iFile[]) {
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

  const _getFiles = () => {
    return _files.map(f => {
      return {
        path: f?.path,
        language: f?.language,
        value: f?.value,
        id: f?.id
      }
    });
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

  return {
      addFile: _addFile,
      getFile: _getFile,
      getFiles: _getFiles,
      removeFile: _removeFile,
      updateFile: _updateFile,
  }
})(filesTemporary);

// TEST: filesProxy
// (function() {
  // 検証１：getFilesで取得したfilesのコピーは参照を持つか？
  // 結果：持たない。
  // 
  // const fff = filesProxy.getFiles();
  // fff[0].path = "unjamaramme";
  // console.log(filesProxy.getFiles());
  // console.log(filesTemporary);

  // 検証２：getFileで取得したfileは参照を持つか？
  // 結果：持たない。
  // 
  // const aFile = filesProxy.getFile('/main.jsx');
  // aFile.value = "drakengard";
  // const fff = filesProxy.getFiles();
  // console.log(fff);

  // 検証3：addFileへ渡したオブジェクトを後から変更したら、_filesの中身も変更されてしまわないか？
  // 結果：持たない。
  // 
  // const newFile = {
  //   path: "/awesome.ts", language: "typescript", value: `const awesome = "awesome"`
  // };
  // filesProxy.addFile(newFile);
  // newFile.path="aweeeohhhh";
  // console.log(filesProxy.getFiles());

  // 検証4：updateFileで渡したオブジェクトを後から変更したら、_filesの中身も変更されてしまわないか？
  // 結果：持たない。
  // 
  // const awesomeOne = filesProxy.getFile("/awesome.ts");
  // const awesome2= {
  //   path: "/likealight.ts", language: "typescript", value: `const likealight = "likealight"`
  // };
  // filesProxy.updateFile(awesomeOne.id!, awesome2);
  // awesome2.path = "astro";
  // console.log(filesProxy.getFiles());
// })();
