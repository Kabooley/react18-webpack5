export interface iFile {
    path: string;
    language: string;
    value: string;
    isFolder: boolean
};

export interface iExplorer {
    id: string;
    name: string;
    isFolder: boolean;
    items: iExplorer[];
    path: string;
};