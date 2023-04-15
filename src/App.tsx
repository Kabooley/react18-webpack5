import React, { useState, useEffect, useRef, useMemo } from "react";



const App = () => {
    const count = useState<number>(0);
    // TODO: URLは正しいか検証
    // webpack5のドキュメントより、URLオブジェクトしか受け付けないとのこと
    const worker: Worker = useMemo(() => new Worker(
        new URL(
            "./worker/index.ts", 
            import.meta.url
        )
    ), []);

    // Only post message
    useEffect(() => {
        if(window.Worker) {
            const request = {

            };

            worker.postMessage(request);
        }
    }, [worker]);

    // Only receive message
    useEffect(() => {
        if(window.Worker) {
            worker.onmessage = (e) => {

            };
        }
    }, [worker]);

    // Only handles error occured in webworker
    useEffect(() => {
        if(window.Worker) {
            const onError = (e: ErrorEvent) => {
                // UI に表示するなど
            };
            
            worker.addEventListener('error', onError, false);

            return () => {
                worker.removeEventListener('error', onError, false);
            }
        }
    }, [worker]);

    return (<div>APP</div>);
};

export default App;