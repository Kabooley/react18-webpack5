export class File {
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
// const genFiles: File[] = filesTemporary.map(f => new File(
//     f.path, f.language, f.value
// ));