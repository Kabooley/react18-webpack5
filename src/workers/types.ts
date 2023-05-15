/*************************************
 * Definitions of message types
 * ***********************************/
import type { iFetchedPaths } from "./FetchLibs.worker";

export type iOrder = "bundle" | "tokenize" | "fetch-libs" | "ready";

export interface iMessage {
    order: iOrder;
    err?: Error;
};

// FetchLibs.worker.ts
export interface iOrderFetchLibs extends iMessage {
    name: string;       // module name about to fetch
    version: string;    // module version
    typings?: iFetchedPaths; // Results of fetch
};

// -------------------------------------------
//  USAGE
// -------------------------------------------
// 
// Standard way to send-and-receive message
// mainthread --> worker
// worker.postMessage({
//     order: "fetch-libs",
//     name: "react",
//     version: "18.0.4"
// });

// // In worker, check order
// self.onmessage = (e: MessageEvent<iOrderFetchLibs>) => {
//     const { order, name, version } = e.data;
//     if(order !== "fetch-libs") return;
//     // ...

//     if(err) {
//         self.postMessage({
//             name, version,
//             typings: {},
//             err
//         });
//     }
//     self.postMessage({
//         name, version,
//         typings: typings, 
//     });
// }:

// // mainthread receive
// worker.onmessage = (e: EventMessage<iOrderFetchLibs>) => {
    
//     const { order, name, version, err } = e.data;
//     if(err) {
//         // handle error
//     }

// };
