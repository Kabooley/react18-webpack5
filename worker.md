# Note about webworker

## TypeError:`self.importScripts` is not a function

参考：

https://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined

workerは2度実行される！

```JavaScript
if('function' === typeof self.importScripts) {
    // worker content

    self.addEventListener("message", ...)
}
```

これで解決できるかと思いきや...


## worker2度実行されることでpostMessageされたメッセージ受信できず。

流れ：

```
first mount
--> worker generated
--> mainthread sent message(this will fail) 
--> worker runs
--> worker terminated by componentWillUnmount
second mount
--> worker generated
--> mainthread sent message
--> webpack-dev-server disconnected
--> webpack-dev-server reconnected
--> worker runs 
--> worker setup message listener
```

つまり、

メインスレッドからpostMessage()されたメッセージは、

まだworkerのonmessageが有効になっていないために

workerに受信されないのである。

で、おそらく考えられる原因が、

1. webpack-dev-serverが勝手に接続切れるから
2. `self.importScripts`が有効になる「二度目」のworker実行時にworkerのリスナを初めて設置することから常にリスナ設置が後手になるから


解決のヒントがある可能性があるのが、

- addeventlistenerをonmessageにする
