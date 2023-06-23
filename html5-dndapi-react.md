# Note: HTML5 Drag n Drop API with React

MDN:

https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

その他：

https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/


## 手順

https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#dragstart

まずHTML要素をdraggaleにするために：

- `draggable`属性に`true`を与える
- `dragstart`イベントのリスナを定義する
- リスナで`DataTransfer:setData()`を呼び出す

