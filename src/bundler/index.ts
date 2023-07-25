import * as esbuild from 'esbuild-wasm';
import { fetchPlugin } from './plugins/fetch-plugin';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

interface iBuildResult {
    bundledCode: string;
    err: Error | null;
};

const initializeOptions: esbuild.InitializeOptions = {
    // wasmURL:  '/esbuild.wasm',
    worker: true,
    wasmURL: 'http://unpkg.com/esbuild-wasm@0.17.19/esbuild.wasm',
};

let isInitialized: boolean = false;

/**
 * @param { string } rawCode - The code that user typed and submitted.
 *
 * */
export const bundler = async (rawCode: string): Promise<iBuildResult> => {
    try {
        // 必ずesbuildAPIを使い始める前に一度だけ呼出す
        if (!isInitialized) {
            await esbuild.initialize(initializeOptions);
            isInitialized = true;
            console.log('initialized');
        }

        const buildOptions: esbuild.BuildOptions = {
            entryPoints: ['index.js'],
            // explicitly specify bundle: true
            bundle: true,
            // To not to write result in filesystem.
            write: false,
            // To use plugins which solves import modules.
            plugins: [fetchPlugin(rawCode), unpkgPathPlugin()],
        };

        const result = await esbuild.build(buildOptions);

        if (result === undefined) throw new Error();

        
        console.log("bundled code files:");
        console.log(result);

        return {
            bundledCode: result.outputFiles![0].text,
            err: null,
        };
    } catch (e) {
        if (e instanceof Error) {
            return {
                bundledCode: '',
                err: e,
            };
        } else throw e;
    }
};