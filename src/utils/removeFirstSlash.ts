const matchFirstSlashPattern = /^\//g;

export const removeFirstSlash = (str: string): string => {
  if(matchFirstSlashPattern.test(str)) return str.replace(matchFirstSlashPattern, '');
  return str;
};

// USAGE
// const paths = [
//     "/model/16",
//     "/src/index.tsx",
//     "/src/index.tsx",
//     "/public/js/jctajr.min.js",
//     "public/js/jctajr.min.js",
//   ];

// paths.forEach(p => console.log(removeFirstSlash(p)));