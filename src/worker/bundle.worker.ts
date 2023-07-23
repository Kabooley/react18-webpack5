import * as esbuild from 'esbuild-wasm';
import { fetchPlugins, unpkgPathPlugin } from '../Bundle';
import type { iMessageBundleWorker } from './types';

/**
 * This must be same as 
 * iBundledState.payload object.
 * */ 
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
const bundler = async (rawCode: string): Promise<iBuildResult> => {
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
            plugins: [fetchPlugins(rawCode), unpkgPathPlugin()],
        };

        const result = await esbuild.build(buildOptions);

        if (result === undefined) throw new Error();

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

/***
 * NOTE: Validate MessageEvent.origin is unavailable because origin is always empty string...
 *
 * */
self.onmessage = (e: MessageEvent<iMessageBundleWorker>): void => {
    // DEBUG:
    console.log('[bundle.worker.ts] got message on onmessage()');
    console.log(e);

    // Filter necessary message
    if (e.data.order !== 'bundle') return;

    // DEBUG:
    console.log('[bundle.worker.ts] start bundle process...');

    const { rawCode } = e.data;

    if (rawCode) {
        bundler(rawCode)
            .then((result: iBuildResult) => {
                if (result.err instanceof Error) throw result.err;

                // DEBUG:
                console.log('[budle.worker.ts] sending bundled code');

                self.postMessage({
                    bundledCode: result.bundledCode,
                    err: null,
                });
            })
            .catch((e) => {
                // DEBUG:
                console.log('[budle.worker.ts] sending Error');

                self.postMessage({
                    bundledCode: '',
                    err: e,
                });
            });
    }
};
