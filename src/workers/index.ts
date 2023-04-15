/**
 * webworkerではselfやthisなどのグローバルオブジェクトがそのまま使えるぞ！
 * */ 
self.onmessage = (e: MessageEvent<string>) => {
    const data = e.data;

    const response = {
        // ...
    };

    self.postMessage(response);
};
