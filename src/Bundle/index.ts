import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from '../Bundle/plugins/unpgkPathPlugin';
import { fetchPlugins } from '../Bundle/plugins/fetchPlugins';

interface iBuildResult {
    code: string;
    err: string;
};

const initializeOptions: esbuild.InitializeOptions = {
    // wasmURL:  '/esbuild.wasm',
    worker: true,
    wasmURL: 'http://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm'
};

let isInitialized: boolean = false;

/**
 * @param { string } rawCode - The code that user typed and submitted.
 * 
 * */ 
const bundler = async (rawCode: string): Promise<iBuildResult> => {
    try {
        console.log(isInitialized);
        
        // 必ずesbuildAPIを使い始める前に呼出す
        if(!isInitialized) {
            await esbuild.initialize(initializeOptions);
            isInitialized = true;
            console.log("initialized");
        }

        const buildOptions: esbuild.BuildOptions = {
            // `index.js`というファイルが出力されるよ
            entryPoints: ['index.js'],
            // explicitly specify bundle: true
            bundle: true,
            // To not to write result in filesystem.
            write: false,
            // To use plugins which solves import modules.
            plugins: [fetchPlugins(rawCode), unpkgPathPlugin()],
        };
        

       const result = await esbuild.build(buildOptions);

       console.log(result);

       // TODO: エラー内容を詳細にして
       if(result === undefined) throw new Error;

       return {
        code: result.outputFiles![0].text,
        err: ''
       }
    }
    catch(e) {
        if(e instanceof Error) {
            return {
              code: '',
              err: e.message,
            };
          }
          else throw e;
    }
};

export default bundler;