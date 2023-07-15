// https://stackoverflow.com/questions/6222215/regex-for-validating-folder-name-file-name

const foldernmaeRegexp = /^[^\\\/?%*:|"'<>\.]+$/;

export const isFolderNameValid = (name: string): boolean => {
    return foldernmaeRegexp.test(name);
};
  