import * as esbuild from 'esbuild-wasm';
import { fetchPlugins, unpkgPathPlugin } from '../Bundle';
import type { iMessageBundleWorker } from './types';

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
            entryPoints: ['index.js'],
            // explicitly specify bundle: true
            bundle: true,
            // To not to write result in filesystem.
            write: false,
            // To use plugins which solves import modules.
            plugins: [fetchPlugins(rawCode), unpkgPathPlugin()],
        };
        

       const result = await esbuild.build(buildOptions);

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


/***
 * NOTE: Validate MessageEvent.origin is unavailable because origin is always empty string...
 * 
 * */ 
self.onmessage = (e:MessageEvent<iMessageBundleWorker>): void => {

        
    // DEBUG: 
    console.log("[bundle.worker.ts] got message on onmessage()");
    console.log(e);

    // Filter necessary message
    if(e.data.order !== "bundle") return;

    // DEBUG: 
    console.log("[bundle.worker.ts] start bundle process...");

    const { code } = e.data;

    if(code) {
        bundler(code)
        .then((result: iBuildResult) => {
            if(result.err.length) throw new Error(result.err);

            // DEBUG:
            console.log("[budle.worker.ts] sending bundled code");

            self.postMessage({
                bundledCode: result.code,
                err: null
            });
        })
        .catch((e) => {
            
            // DEBUG:
            console.log("[budle.worker.ts] sending Error");
            
            self.postMessage({
                bundledCode: "",
                err: e
            });
        });
    }
};
