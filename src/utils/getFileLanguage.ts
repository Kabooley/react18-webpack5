type Language = 'javascript' | 'typescript' | 'json' | 'css' | 'html' | 'markdown';

// https://stackoverflow.com/a/190878
export const getFileLanguage = (path: string): Language | undefined => {
  if(path.includes('.')) {
    switch (path.split('.').pop()) {
          case 'js':
            return 'javascript';
          case 'ts':
          case 'tsx':
            return 'typescript';
          case 'json':
            return 'json';
          case 'css':
            return 'css';
          case 'html':
            return 'html';
          case 'md':
            return 'markdown';
          default:
            return undefined;
        }
    }
  return undefined;
};