import type { iFile } from './types';
// import { isFilenameValid } from '../utils/isFilenameValid';
import { getFileLanguage } from '../utils';

export const files: iFile[] = [
  {
    path: 'public',
    language: '',
    value: '',
    isFolder: true
  },
  {
    path: 'public/index.html',
    language: 'html',
    value: `<!DOCTYPE html>\r\n<html>\r\n<head>\r\n<meta charset="utf-8" />\r\n<title>Monaco Editor Sample</title>\r\n</head>\r\n<body>\r\n<div id="root"></div>\r\n</body>\r\n</html>`,
    isFolder: false
  },
  {
    path: 'public/js',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'public/js/default.js',
      language: 'javascript',
      value: `var val = "This is public/js/default.js";`,
      isFolder: false
  },
  {
      path: 'public/js/jctajr.min.js',
      language: 'javascript',
      value: `var val = "This is public/js/jctajr.min.js";`, 
      isFolder: false
  },
  {
    path: 'public/css',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'public/css/default.css',
      language: 'css',
      value: `html {\r\n// This defines what 1rem is\r\nfont-size: 62.5%; //1 rem = 10px; 10px/16px = 62.5%\r\n}`,
      isFolder: false
  },
  {
    path: 'src',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'src/vanilla.ts',
      language: 'typescript',
      value: `const jungleBeats: string = "Holla at me, boo";`,
      isFolder: false
  },
  {
    path: 'src/react',
    language: '',
    value: '',
    isFolder: true
  },
  {
      path: 'src/react/some.jsx',
      language: 'javascript',
      value: ``,
      isFolder: false
  },
  {
      path: 'src/index.tsx',
      language: 'typescript',
      value: `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`,
      isFolder: false
  },
  {
    path: 'src/temporary',
    language: '',
    value: '',
    isFolder: true
  },
  {
    path: 'temporary',
    language: '',
    value: '',
    isFolder: true
  },
];

export class File {
  constructor(
      private _path: string,
      private _value: string,
      private _language: string,
      private _isFolder: boolean,

      // NOTE: experimental
      private _selected: boolean = false
  ){};

  _isPathValid(path: string): boolean {
      // TODO: make sure path is valid
      return true;
  };

  setPath(path: string) {
      // TODO: make sure path is not include non exist folder
      // if(isFilenameValid(path)){
      if(this._isPathValid(path)){
          this._path = path;
          const language = getFileLanguage(path);
          this._language = language !== undefined ? language : "";
      }
  };

  setValue(value: string) {
      this._value = value;
  };

  getPath(): string {
      return this._path;
  };

  getValue(): string {
      return this._value;
  };

  isFolder(): boolean {
      return this._isFolder;
  };

  // temporary
  getLanguage(): string {
    return this._language;
  };

  setSelected(): void {
    this._selected = true;
  };

  unselected(): void {
    this._selected = false;
  };
  
  isSelected(): boolean {
    return this._selected;
  };
};


// interface iFileWithId extends iFile {
//   id: number;
// }

/***
 * Property `id' is only for inside of this proxy.
 * Reason adding `id` property is mainly for _updateFile method.
 * 
 * */ 
// export const filesProxy = (function(files: iFile[]) {
//   // 参照を持たせないため
//   let _files: iFileWithId[] = files.map((d, index) => {
//       return {...d, id: index};
//   });

//   const _addFile = (newFile: iFile) => {
//       if(!_files.find(_f => _f.path === newFile.path)){
//           _files.push({
//               ...newFile, id: new Date().getTime()
//           });
//       }
//   };

//   const _getFile = (path: string) => {
//       const f = _files.find(_f => _f.path === path);
//       return {
//           path: f?.path,
//           language: f?.language,
//           value: f?.value,
//           id: f?.id
//       };
//   };

//   const _getFiles = () => {
//     return _files.map(f => {
//       return {
//         path: f?.path,
//         language: f?.language,
//         value: f?.value,
//         id: f?.id
//       }
//     });
//   };

//   const _getNumberOfFiles = () => {
//     return _files.length;
//   };

//   const _getAllPaths = () => {
//     return _files.map(f => f.path);
//   };

//   const _removeFile = (path: string) => {
//       if(_files.find(_f => _f.path === path)) {
//           _files = _files.filter(f => f.path !== path);
//       }
//   };

//   const _updateFile = (
//       id: number,
//       {path, language, value}
//       :{path?: string, language?: string, value?: string}) => {
//           let found = _files.find(_f => _f.id === id);
//           if(found) {
//               found.path = path !== undefined ? path : found.path;
//               found.language = language !== undefined ? language : found.language;
//               found.value = value !== undefined ? value : found.value;
//           }
//   };

//   return {
//       addFile: _addFile,
//       getFile: _getFile,
//       getFiles: _getFiles,
//       removeFile: _removeFile,
//       updateFile: _updateFile,
//       getNumberOfFiles: _getNumberOfFiles,
//       getAllPaths: _getAllPaths
//   };
// })(files);

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




// interface iFiles {
//     [path: string]: iFile
// };

// const files: iFiles = {
//     'javascript': {
//         path: '/main.js',
//         language: 'javascript',
//         value: `var salute = "salute!!";`
//     },
//     'typescript': {
//         path: '/main.ts',
//         language: 'typescript',
//         value: `const jungleBeats: string = "Holla at me, boo";`
//     },
//     'react': {
//         path: '/main.jsx',
//         language: 'javascript',
//         value: ``
//     },
//     'react-typescript': {
//         path: '/main.tsx',
//         language: 'typescript',
//         value: `import { createRoot } from 'react-dom/client';\r\nimport React from 'react';\r\nimport 'bulma/css/bulma.css';\r\n\r\nconst App = () => {\r\n    return (\r\n        <div className=\"container\">\r\n          <span>REACT</span>\r\n        </div>\r\n    );\r\n};\r\n\r\nconst root = createRoot(document.getElementById('root'));\r\nroot.render(<App />);`
//     },
// };


// export class File {
//     constructor(
//         private _path: string,
//         private _language: string,
//         private _value: string
//     ){};

//     get path() {
//         return this._path;
//     };

//     get language() {
//         return this._language;
//     };

//     get value() {
//         return this._value;
//     };

//     // // 必須ではないけどあったら便利かも
//     // get name() {
//     //     // 正規表現を使ってpathの「ファイル名.拡張子」部分を返す
//     // };

//     set updatePath(p: string) {
//         this._path = p;
//     };

//     set changeLanguage(l: string) {
//         this._language = l;
//     };

//     set updateValue(v: string) {
//         this._value = v;
//     };
// };


