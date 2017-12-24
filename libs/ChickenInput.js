// ChickenInput
// Version: 0.1.0-dev
// Built: 2016-12-02T02:44:03.877Z
// Commit: 482d6b6eb6fcc92c8a6d13afc6e4173479d4fccd

"use strict";Chicken.register("ChickenInput.pointerHook",["ChickenFW.resolveElement"],function(n){var o=function(n){return n.stopPropagation(),n.stopImmediatePropagation(),!1};return function(e,t){e=n(e),e.onmousedown=function(n){return 0===n.button&&t.onPointerDown&&t.onPointerDown(n.clientX-e.offsetLeft,n.clientY-e.offsetTop),o(n)},e.onmouseup=function(n){return 0===n.button&&t.onPointerUp&&t.onPointerUp(n.clientX-e.offsetLeft,n.clientY-e.offsetTop),o(n)};var i,u=-1;return e.onmousemove=function(n){if(t.onPointerMove){var r,f,c=n.clientX-e.offsetLeft,s=n.clientY-e.offsetTop;-1===u?(r=0,f=0):(r=c-i,f=s-u),t.onPointerMove(c,s,r,f),i=c,u=s}return o(n)},e.oncontextmenu=o,function(){e.onmousedown=null,e.onmouseup=null,e.onmousemove=null}}});