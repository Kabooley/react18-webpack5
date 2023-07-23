export enum OrderTypes {
    Bundle = "bundle",
    JsxHighlight = "jsxhighlight",
    FetchLibs = "featch-libs"
};

type iOrder = "order" | "bundle" | "jsxhighlight" | "eslint" | "featch-libs";

/***
 * Common property which must be included in any messages.
 * 
 * 
 * @property {Error | null} err - Error occured amoung bundling process.
 * */ 
interface iMessage {
    order: iOrder;
};

export interface iBuildResult {
    bundledCode: string;
    err: Error | null;
};

/***
 * Message through Main thread to bundle.worker.ts must be follow interface below.
 * 
 * @property {string} rawCode - Code sent from main thread and about to be bundled.
 * @property {string} bundledCode - Bundled code to be send to main thread.
 * @property {Error | null} err - Error occured during bundling.
 * */ 
interface iOrderBundle extends iMessage {
    rawCode: string;
};

// Message through bundle.worker.ts to main thread 
// must be follow interface.
export interface iOrderBundleResult extends iBuildResult {};