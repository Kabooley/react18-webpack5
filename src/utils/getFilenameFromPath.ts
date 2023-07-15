export const getFilenameFromPath = (path: string): string => {
    return path.replace(/^.*[\\\/]/,'');
};