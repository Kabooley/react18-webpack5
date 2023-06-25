type iOrder = "order" | "bundle" | "jsxhighlight" | "eslint" | "featch-libs";

/***
 * Common property which must be included in any messages.
 * 
 * 
 * @property {Error | null} err - Error occured amoung bundling process.
 * */ 
interface iMessage {
    order: iOrder;
    err?: Error;
};

/***
 * @property {string} code - Code sent from main thread and about to be bundled.
 * @property {string} bundledCode - Bundled code to be send to main thread.
 * 
 * */ 
export interface iMessageBundleWorker extends iMessage {
    code?: string;
    bundledCode?: string;
}