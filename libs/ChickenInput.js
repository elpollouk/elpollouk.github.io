// ChickenInput
// Version: 0.1.0-dev
// Built: 2016-11-28T00:26:21.102Z
// Commit: 482d6b6eb6fcc92c8a6d13afc6e4173479d4fccd

"use strict";Chicken.register("ChickenInput.pointerHook",["ChickenFW.resolveElement"],function(n){return function(o,e){o=n(o),o.onmousedown=function(n){0===n.button&&e.onPointerDown&&e.onPointerDown(n.clientX-o.offsetLeft,n.clientY-o.offsetTop)},o.onmouseup=function(n){0===n.button&&e.onPointerUp&&e.onPointerUp(n.clientX-o.offsetLeft,n.clientY-o.offsetTop)};var t,i=-1;return o.onmousemove=function(n){if(e.onPointerMove){var u,f,r=n.clientX-o.offsetLeft,c=n.clientY-o.offsetTop;-1===i?(u=0,f=0):(u=r-t,f=c-i),e.onPointerMove(r,c,u,f),t=r,i=c}},function(){o.onmousedown=null,o.onmouseup=null,o.onmousemove=null}}});