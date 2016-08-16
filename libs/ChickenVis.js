// ChickenVis
// Version: 0.1.0-dev
// Built: 2016-08-16T22:23:01.153Z
// Commit: 47174a5f7daea765a26ae7cdc647c6de603b4a46

Chicken.register("ChickenVis.createElement",function(t){return document.createElement(t)}),Chicken.register("ChickenVis.requestAnimationFrame",function(t){return window.requestAnimationFrame(t)}),Chicken.register("ChickenVis.resolveElement",function(t){switch(typeof t){case"string":return document.getElementById(t);case"function":return t();default:return t}}),Chicken.register("ChickenVis.Loader",["ChickenVis.createElement"],function(t){var e={},i=Chicken.Class(function(){this.numReady=0,this.numTotal=0,this.failed=[],this.a={}},{queue:function(t,e){var n=this;n.numTotal+=t.length;for(var s=0;s<t.length;s++){var r=i.load(t[s].source,t[s].type,function(t){switch(t.state){case i.STATE_READY:n.numReady++;break;case i.STATE_ERROR:n.failed.push(t)}e(t,n)});r.id=t[s].id,n.a[r.id]=r}},getInfo:function(t){return this.a[t]},getData:function(t){var e=this.a[t];if(e)return e.state!==i.STATE_READY?null:e.data}},{},{TYPE_IMAGE:"img",STATE_QUEUED:0,STATE_READY:1,STATE_ERROR:-1,load:function(t,n,s){var r={type:n,source:t,state:i.STATE_QUEUED,onStateChange:s};return e[n](r),r}});return e[i.TYPE_IMAGE]=function(e){e.data=t("img"),e.data.src=e.source,e.data.onload=function(){e.state=i.STATE_READY,e.onStateChange(e)},e.data.onerror=function(){e.state=i.STATE_ERROR,e.onStateChange(e)}},i}),Chicken.register("ChickenVis.UpdateLoop",["ChickenVis.requestAnimationFrame","Date.now"],function(t,e){"use strict";var i=10,n=Chicken.Class(function(n){if(!n)throw new Error("No update function specified");var s=this,r=function(){var h=e(),a=(h-s.b)/1e3;s.b=h;var c=s.c;c.push(a),c.length===i&&c.shift(),s.d||(n(a),t(r))};this.d=!0,this.e=0,this.f=r,this.g=n,this.c=[]},{step:function(t){this.g(t)}},{paused:{get:function(){return this.d},set:function(t){return t==this.d?t:(this.d=t,t||(this.b=e(),this.f()),t)},enumerable:!0},fps:{get:function(){for(var t=0,e=this.c,i=0;i<e.length;i++)t+=e[i];return 0===e?0:e.length/t},enumerable:!0}});return n}),Chicken.register("ChickenVis.Draw",["ChickenVis.resolveElement"],function(t){"use strict";var e="black",i="10px Courier",n=2*Math.PI,s=function(){return!1},r=Chicken.Class(function(e,i,n){e=t(e),this.h=i||e.clientWidth,this.i=n||e.clientHeight,this.j=0,this.k=0,this.l=document.createElement("canvas"),this.l.setAttribute("width",this.h),this.l.setAttribute("height",this.i),this.l.onselectstart=s,e.appendChild(this.l),this.m=this.l.getContext("2d"),this.m.textBaseline="top"},{setOrigin:function(t,e){this.j=-t,this.k=-e,this.m.translate(t,e)},line:function(t,i,n,s,r){r=r||e,this.m.beginPath(),this.m.moveTo(t,i),this.m.lineTo(n,s),this.m.strokeStyle=r,this.m.stroke()},path:function(t,i){i=i||e;var n=this.m;n.beginPath(),n.moveTo(t[0].x,t[0].y);for(var s=t.length,r=1;s>r;r++)n.lineTo(t[r].x,t[r].y);n.strokeStyle=i,n.stroke()},circle:function(t,i,s,r,h){r=r||e,this.m.beginPath(),this.m.arc(t,i,s,0,n),h?(this.m.strokeStyle=r,this.m.stroke()):(this.m.fillStyle=r,this.m.fill())},rect:function(t,i,n,s,r,h){r=r||e,h?(this.m.beginPath(),this.m.rect(t,i,n,s),this.m.strokeStyle=r,this.m.stroke()):(this.m.fillStyle=r,this.m.fillRect(t,i,n,s))},image:function(t,e,i){this.m.drawImage(t,e,i)},imageEx:function(t,e,i,n,s,r,h,a,c){this.m.drawImage(t,e,i,n,s,r,h,a,c)},text:function(t,n,s,r,h){r=r||e,h=h||i,this.m.font=h,this.m.fillStyle=r,this.m.fillText(t,n,s)},clear:function(){this.m.clearRect(this.j,this.k,this.h,this.i)}},{canvas:{get:function(){return this.l},enumerable:!0},context:{get:function(){return this.m},enumerable:!0},width:{get:function(){return this.h},enumerable:!0},height:{get:function(){return this.i},enumerable:!0}});return r}),Chicken.register("ChickenVis.FixedDeltaUpdater",[],function(){"use strict";var t=Chicken.Class(function(t,e){this.g=t,this.n=e,this.reset()},{reset:function(){this.o=0,this.p=0},update:function(t){for(this.p+=t,t=this.n;this.p>=t;)this.g(t,this.o),this.o+=t,this.p-=t}},{deltaTime:{get:function(){return this.n},enumerable:!0},currentTime:{get:function(){return this.o},enumerable:!0}});return t});