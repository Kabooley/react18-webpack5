# Note about webworker

## TypeError:`self.importScripts` is not a function

参考：

https://stackoverflow.com/questions/14500091/uncaught-referenceerror-importscripts-is-not-defined

workerは2度実行される！

```JavaScript
if('function' === typeof self.importScripts) {
    // worker content
}
```