/**
 * Check file name is valid or not.
 * 
 * NOTE: Check only file name. Not path.
 * 
 * Filename is allowed be concist of half-width alphanumeric characters.
 * Also allowed using `_`, `.`, `-` but other symbol/signs.
 * Extension is not allowed with number.
 * 
 * */ 

const filenameRegexp = /^([A-Za-z0-9\-\_\.]+)\.([a-zA-Z0-9]{1,9})$/;

export const isFilenameValid = (path: string): boolean => {
    return filenameRegexp.test(path);
};



// const filenames = [
//     "sdfsadfa/dsafsdfs.fdsjkad/sadsa.js",
//     "222222.3333",
//     "script2.js",
//     "script2.js.worker",
//     "script2._.bundled",
//     "script_3.js",
//     "-script.js",
//     "_script.js",
//     "sc'ript.js",
//     "sc&ript.js",
//     "sc^ript.js",
//     "sc\ript.js",
//   ];
  
//   filenames.forEach(f => {
//     console.log(`${f} is ${isFilenameValid(f) ? "valid" : "invalid"}`);
//   });

// sdfsadfa/dsafsdfs.fdsjkad/sadsa.js is invalid 
// 222222.3333 is valid 
// script2.js is valid 
// script2.js.worker is valid 
// script2._.bundled is valid 
// script_3.js is valid 
// -script.js is valid 
// _script.js is valid 
// sc'ript.js is invalid 
// sc&ript.js is invalid 
// sc^ript.js is invalid 
// sc
// ipt.js is invalid 