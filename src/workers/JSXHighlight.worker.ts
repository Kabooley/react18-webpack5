interface iMessage {
    code: string;
    err: string;
};

self.onmessage = (e: MessageEvent<iMessage>) => {

    const { code, err } = e.data;

    if(err.length || code === undefined) return;

    self.postMessage({
        signal: "",
        error: "[jsx-highlighter webworker] Error: Something went wrong but there is no signal has been sent."
      });
      
    self.postMessage({
      signal: "This is jsx-highlighter webworker. I've got your message.",
      error: ""
    });
  
  
    setTimeout(() => {
      self.postMessage({
        signal: "This is jsx-highlighter webworker. Delayed message has been sent.",
        error: ""
      });
    }, 10000);
  
    setTimeout(() => {
      self.postMessage({
        signal: "This is jsx-highlighter webworker. Second Delayed message has been sent.",
        error: ""
      });
    }, 30000);

};