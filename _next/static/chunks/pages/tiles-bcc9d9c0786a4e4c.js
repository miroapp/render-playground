(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4],{8661:function(t,e,i){(window.__NEXT_P=window.__NEXT_P||[]).push(["/tiles",function(){return i(108)}])},108:function(t,e,i){"use strict";i.r(e),i.d(e,{default:function(){return nt}});var n=i(5893),r=i(7294),s=i(1752);function o(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function a(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var h=function(){function t(e){var i=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.renderer=e,this._lastCursorPosition={x:0,y:0},this._navigationStartCursorPosition=void 0,this._isInvalid=!0,this._isZooming=!1,this._deltaPan={x:0,y:0},this._time=0,this._frames=0,this.onMouseWheel=function(t){t.preventDefault();var e=i.renderer.getMousePosition();i._navigationStartCursorPosition=function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{},n=Object.keys(i);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(i).filter((function(t){return Object.getOwnPropertyDescriptor(i,t).enumerable})))),n.forEach((function(e){a(t,e,i[e])}))}return t}({},e);var n=1===t.deltaMode?t.deltaY/-1:t.deltaY/-10;i.zoomBy(n,i._navigationStartCursorPosition)},this._startNavigation=function(t){var e=i.renderer.container,n=i.renderer.getMousePosition();i._lastCursorPosition.x=n.x,i._lastCursorPosition.y=n.y,e.addEventListener("pointermove",i._navigate,!1),e.addEventListener("pointerup",i._endNavigation,!1),e.removeEventListener("pointerdown",i._startNavigation,!1)},this._endNavigation=function(t){var e=i.renderer.container;e.removeEventListener("pointermove",i._navigate,!1),e.removeEventListener("pointerup",i._endNavigation,!1),e.addEventListener("pointerdown",i._startNavigation,!1)},this._navigate=function(t){var e=i._lastCursorPosition,n=i.renderer.getMousePosition(),r=e.x-n.x,s=e.y-n.y;i._lastCursorPosition.x=n.x,i._lastCursorPosition.y=n.y,i.panBy(r,s)};var n=this.renderer.container;this.position={x:.5*n.width,y:.5*n.height},this.scale=1,n.addEventListener("pointerdown",this._startNavigation,!1),n.addEventListener("wheel",this.onMouseWheel,!1)}var e,i,n;return e=t,(i=[{key:"refresh",value:function(){var t=this._isInvalid||this._isZooming;return this._isInvalid&&(this.position.x=this.position.x+this._deltaPan.x,this.position.y=this.position.y+this._deltaPan.y,this._deltaPan.x=0,this._deltaPan.y=0,this._isInvalid=!1),t}},{key:"zoomBy",value:function(t,e){if(Math.min(Math.max(this.scale*(1+.01*t),.04),4)!==this.scale){var i=this;this.scale=Math.min(Math.max(this.scale*(1+.01*t),.04),4),clearTimeout(this._endZoomTimeout),this._endZoomTimeout=setTimeout((function(){i.renderer.reset(),i.renderer.render({canvasOffset:i.position,scale:i.scale}),i._isZooming=!1}),100),this._isZooming=!0}return this}},{key:"panBy",value:function(t,e){return this._deltaPan.x=t/this.scale,this._deltaPan.y=e/this.scale,this._isInvalid=!0,this}},{key:"zoomOutAutomation",value:function(){var t=this;this.position={x:0,y:0},this.scale=4,this._time=performance.now(),this._frames=0;var e=function(){t.scale>.04?(t.zoomBy(-1),t._frames+=1,requestAnimationFrame((function(){return e()}))):console.log(1e3*t._frames/(performance.now()-t._time),"fps")};e()}},{key:"zoomInAutomation",value:function(){var t=this;this.position={x:0,y:0},this.scale=.04,this._time=performance.now(),this._frames=0;var e=function(){t.scale<4?(t.zoomBy(1),t._frames+=1,requestAnimationFrame((function(){return e()}))):console.log(1e3*t._frames/(performance.now()-t._time),"fps")};e()}},{key:"panAutomation",value:function(){var t=this;this.scale=.04,this.position={x:-37.5*c,y:-37.5*u},this._time=performance.now(),this._frames=0;var e=function(){t.position.x<37.5*c?(t.panBy(.01*c,.01*u),t._frames+=1,requestAnimationFrame((function(){return e()}))):console.log(1e3*t._frames/(performance.now()-t._time),"fps")};e()}},{key:"destroy",value:function(){var t=this.renderer.container;t.removeEventListener("pointermove",this._navigate,!1),t.removeEventListener("pointerup",this._endNavigation,!1),t.removeEventListener("pointerdown",this._startNavigation,!1),t.removeEventListener("wheel",this.onMouseWheel,!1)}}])&&o(e.prototype,i),n&&o(e,n),t}();function l(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var c=1280,u=800,f=function(){function t(e){var i=e.canvas,n=e.widgetManager,r=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.renderedWidgets=0,this.renderedTiles=0,this._location={x:0,y:0},this.refresh=function(){r.navigationManager&&(r.navigationManager.refresh()&&r.render({canvasOffset:r.navigationManager.position,scale:r.navigationManager.scale}),r._requestID=requestAnimationFrame(r.refresh))},this.dispatchMouseOrWheelOverEvent=function(t){r.setMousePosition(t.clientX,t.clientY)};var s=i.getContext("2d");if(null===s)throw new Error("Canvas2D renderer is uninitialized!");i.width=c,i.height=u,this._container=i,this._context=s,this.widgetManager=n,this.navigationManager=new h(this),this._container.addEventListener("pointerover",this.dispatchMouseOrWheelOverEvent),this._container.addEventListener("pointermove",this.dispatchMouseOrWheelOverEvent),this._container.addEventListener("wheel",this.dispatchMouseOrWheelOverEvent,{capture:!0}),window.addEventListener("scroll",this.captureLocation.bind(this)),this.captureLocation(),setTimeout(this.refresh,1e3)}var e,i,n;return e=t,(i=[{key:"container",get:function(){return this._container}},{key:"context",get:function(){return this._context}},{key:"background",value:function(t){var e=this._context;e.fillStyle=t,e.fillRect(0,0,e.canvas.width,e.canvas.height)}},{key:"render",value:function(t){this._render(t),document.getElementById("widgetInfo").innerText="\n      Total widgets: ".concat(this.widgetManager.numWidgets,"\n      rendered widgets: ").concat(this.renderedWidgets,"\n      rendered tiles: ").concat(this.renderedTiles,"\n    ")}},{key:"onViewportUpdate",value:function(t){}},{key:"destroy",value:function(){cancelAnimationFrame(this._requestID),this.navigationManager.destroy(),this.navigationManager=null}},{key:"clientToEngineSpace",value:function(t,e){return{x:t-this._location.x,y:e-this._location.y}}},{key:"setMousePosition",value:function(t,e){var i=this.clientToEngineSpace(t,e);return this._lastMousePosition=i,this._lastMousePosition}},{key:"getMousePosition",value:function(){return this._lastMousePosition}},{key:"drawContext",value:function(t,e,i,n){var r=this.widgetManager.getWidgets(e,n);t.clearRect(0,0,this._container.width,this._container.width),r.forEach((function(n){t.drawImage(n.image,(n.position.x-e.x)*i,(n.position.y-e.y)*i,n.image.width*i/4,n.image.height*i/4)})),this.renderedWidgets+=r.length,this.renderedTiles+=1}},{key:"getVisualUpdateParamsBox",value:function(t){var e=this._container.width/t.scale,i=this._container.height/t.scale;return{x:t.canvasOffset.x-e/2,y:t.canvasOffset.y-i/2,width:e,height:i}}},{key:"captureLocation",value:function(){var t=this._container.getBoundingClientRect(),e=t.left,i=t.top;this._location.x=e,this._location.y=i}}])&&l(e.prototype,i),n&&l(e,n),t}();function d(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function v(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function y(t){return(y=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function g(t,e){return!e||"object"!==p(e)&&"function"!==typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function m(t,e){return(m=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var p=function(t){return t&&"undefined"!==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t};function w(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,n=y(t);if(e){var r=y(this).constructor;i=Reflect.construct(n,arguments,r)}else i=n.apply(this,arguments);return g(this,i)}}var x=function(t){!function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&m(t,e)}(s,t);var e,i,n,r=w(s);function s(){return d(this,s),r.apply(this,arguments)}return e=s,(i=[{key:"_render",value:function(t){var e=this.getVisualUpdateParamsBox(t);this.renderedWidgets=0,this.drawContext(this.context,e,t.scale)}},{key:"reset",value:function(){}}])&&v(e.prototype,i),n&&v(e,n),s}(f);function _(t,e){var i=t.x,n=t.y,r=e.x,s=e.y,o=e.x+e.width,a=e.y+e.height;return i>r&&i<o&&n>s&&n<a}function b(t,e){var i=t.x,n=t.y,r=t.x+t.width,s=t.y+t.height,o=e.x,a=e.y,h=e.x+e.width,l=e.y+e.height;return h>i&&o<r&&l>n&&a<s}function T(t,e){var i=t.x,n=t.y,r=t.x+t.width,s=t.y+t.height,o=e.x,a=e.y,h=e.x+e.width,l=e.y+e.height;return o>i&&h<r&&a>n&&l<s}function k(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function O(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function P(t){return(P=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function E(t,e){return!e||"object"!==R(e)&&"function"!==typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function M(t,e){return(M=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var R=function(t){return t&&"undefined"!==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t};function L(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,n=P(t);if(e){var r=P(this).constructor;i=Reflect.construct(n,arguments,r)}else i=n.apply(this,arguments);return E(this,i)}}var j=[0,1,2,3],W=function t(e,i){k(this,t),this.needsRender=!1,this.canvas=document.createElement("canvas"),this.canvas.width=e,this.canvas.height=i,this.ctx=this.canvas.getContext("2d")},S=function(t){!function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&M(t,e)}(s,t);var e,i,n,r=L(s);function s(t){var e;return k(this,s),(e=r.call(this,t)).x=0,e.y=0,e.width=0,e.height=0,e.scale=0,e.tileWidth=0,e.tileHeight=0,e.tiles=j.map((function(){return new W(e.container.width,e.container.height)})),e}return e=s,(i=[{key:"_render",value:function(t){var e,i=this.getVisualUpdateParamsBox(t);t.scale===this.scale?b(this,i)?(i.x<this.x?this.moveTilesLeft():i.x>this.x+this.tileWidth&&this.moveTilesRight(),i.y<this.y?this.moveTilesUp():i.y>this.y+this.tileHeight&&this.moveTilesDown()):this.resetTiles(i,t.scale):(!T(this,i)||i.width<this.tileWidth/2)&&this.resetTiles(i,t.scale),this.tiles.map((function(t){return t.needsRender})).some((function(t){return t}))&&(this.renderedWidgets=0,e=this.widgetManager.getWidgets(this)),this.renderTiles(e),this.renderViewport(i,t.scale)}},{key:"reset",value:function(){this.x=0,this.y=0,this.width=0,this.height=0,this.scale=0,this.tileWidth=0,this.tileHeight=0}},{key:"renderTile",value:function(t,e){var i=this.tiles[t];if(i.needsRender){var n={x:t%2===0?this.x:this.x+this.tileWidth,y:t<2?this.y:this.y+this.tileHeight,width:this.tileWidth,height:this.tileHeight};this.drawContext(i.ctx,n,this.scale,e),i.needsRender=!1}}},{key:"renderTiles",value:function(t){var e=this;j.forEach((function(i){return e.renderTile(i,t)}))}},{key:"renderViewport",value:function(t,e){var i=t.width*this.scale,n=t.height*this.scale,r=(t.x-this.x)*this.scale,s=Math.min(i,this.container.width-r),o=i-s,a=(t.y-this.y)*this.scale,h=Math.min(n,this.container.height-a),l=n-h,c=e/this.scale,u=s*c,f=o*c,d=h*c,v=l*c;this.context.clearRect(0,0,this.container.width,this.container.height),this.context.drawImage(this.tiles[0].canvas,r,a,s,h,0,0,u,d),this.context.drawImage(this.tiles[1].canvas,0,a,o,h,u,0,f,d),this.context.drawImage(this.tiles[2].canvas,r,0,s,l,0,d,u,v),this.context.drawImage(this.tiles[3].canvas,0,0,o,l,u,d,f,v),this.context.strokeStyle="#FF0000",this.context.strokeRect(0,0,u,d),this.context.strokeRect(u,0,f,d),this.context.strokeRect(0,d,u,v),this.context.strokeRect(u,d,f,v)}},{key:"invalidateTiles",value:function(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];var n=this;e.forEach((function(t){return n.tiles[t].needsRender=!0}))}},{key:"swapTilesX",value:function(){this.tiles=[this.tiles[1],this.tiles[0],this.tiles[3],this.tiles[2]]}},{key:"swapTilesY",value:function(){this.tiles=[this.tiles[2],this.tiles[3],this.tiles[0],this.tiles[1]]}},{key:"moveTilesLeft",value:function(){this.swapTilesX(),this.invalidateTiles(0,2),this.x-=this.tileWidth}},{key:"moveTilesRight",value:function(){this.swapTilesX(),this.invalidateTiles(1,3),this.x+=this.tileWidth}},{key:"moveTilesUp",value:function(){this.swapTilesY(),this.invalidateTiles(0,1),this.y-=this.tileHeight}},{key:"moveTilesDown",value:function(){this.swapTilesY(),this.invalidateTiles(2,3),this.y+=this.tileHeight}},{key:"resetTiles",value:function(t,e){this.invalidateTiles(0,1,2,3),this.x=t.x-t.width/2,this.y=t.y-t.height/2,this.width=2*t.width,this.height=2*t.height,this.scale=e,this.tileWidth=t.width,this.tileHeight=t.height}}])&&O(e.prototype,i),n&&O(e,n),s}(f);function C(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function Z(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function B(t,e,i){return e&&Z(t.prototype,e),i&&Z(t,i),t}function I(t){return(I=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function N(t,e){return!e||"object"!==H(e)&&"function"!==typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function A(t,e){return(A=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var H=function(t){return t&&"undefined"!==typeof Symbol&&t.constructor===Symbol?"symbol":typeof t};function z(t){var e=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var i,n=I(t);if(e){var r=I(this).constructor;i=Reflect.construct(n,arguments,r)}else i=n.apply(this,arguments);return N(this,i)}}var D=[0,1,2,3],X=function t(e,i){C(this,t),this.needsRender=!1,this.canvas=document.createElement("canvas"),this.canvas.width=e,this.canvas.height=i,this.ctx=this.canvas.getContext("2d")},U=function(t){!function(t,e){if("function"!==typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&A(t,e)}(i,t);var e=z(i);function i(t){var n;return C(this,i),(n=e.call(this,t)).x=0,n.y=0,n.width=0,n.height=0,n.scale=0,n.minZoomLevel=1,n.maxZoomLevel=20,n.currentZoomLevel=1,n.numberOfTilesWide=0,n.numberOfTilesHigh=0,n.tileWidth=0,n.tileHeight=0,n.minZoomLevel=t.minZoomLevel||1,n.maxZoomLevel=t.maxZoomLevel||20,n.minZoomLevel>n.maxZoomLevel&&(n.minZoomLevel=n.maxZoomLevel),n.currentZoomLevel=n.minZoomLevel,n.numberOfTilesWide=Math.pow(2,n.currentZoomLevel),n.numberOfTilesHigh=n.numberOfTilesWide,n.tiles=D.map((function(){return new X(n.container.width,n.container.height)})),n}return B(i,[{key:"_render",value:function(t){var e,i=this.getVisualUpdateParamsBox(t);t.scale===this.scale?b(this,i)?(i.x<this.x?this.moveTilesLeft():i.x>this.x+this.tileWidth&&this.moveTilesRight(),i.y<this.y?this.moveTilesUp():i.y>this.y+this.tileHeight&&this.moveTilesDown()):this.resetTiles(i,t.scale):(!T(this,i)||i.width<this.tileWidth/2)&&this.resetTiles(i,t.scale),this.tiles.map((function(t){return t.needsRender})).some((function(t){return t}))&&(this.renderedWidgets=0,e=this.widgetManager.getWidgets(this)),this.renderTiles(e),this.renderViewport(i,t.scale)}},{key:"reset",value:function(){this.x=0,this.y=0,this.width=0,this.height=0,this.scale=0,this.tileWidth=0,this.tileHeight=0}},{key:"renderTile",value:function(t,e){var i=this.tiles[t];if(i.needsRender){var n={x:t%2===0?this.x:this.x+this.tileWidth,y:t<2?this.y:this.y+this.tileHeight,width:this.tileWidth,height:this.tileHeight};this.drawContext(i.ctx,n,this.scale,e),i.needsRender=!1}}},{key:"renderTiles",value:function(t){var e=this;D.forEach((function(i){return e.renderTile(i,t)}))}},{key:"renderViewport",value:function(t,e){var i=t.width*this.scale,n=t.height*this.scale,r=(t.x-this.x)*this.scale,s=Math.min(i,this.container.width-r),o=i-s,a=(t.y-this.y)*this.scale,h=Math.min(n,this.container.height-a),l=n-h,c=e/this.scale,u=s*c,f=o*c,d=h*c,v=l*c;this.context.clearRect(0,0,this.container.width,this.container.height),this.context.drawImage(this.tiles[0].canvas,r,a,s,h,0,0,u,d),this.context.drawImage(this.tiles[1].canvas,0,a,o,h,u,0,f,d),this.context.drawImage(this.tiles[2].canvas,r,0,s,l,0,d,u,v),this.context.drawImage(this.tiles[3].canvas,0,0,o,l,u,d,f,v),this.context.strokeStyle="#ff0000",this.context.strokeRect(0,0,u,d),this.context.strokeRect(u,0,f,d),this.context.strokeRect(0,d,u,v),this.context.strokeRect(u,d,f,v)}},{key:"invalidateTiles",value:function(){for(var t=arguments.length,e=new Array(t),i=0;i<t;i++)e[i]=arguments[i];var n=this;e.forEach((function(t){return n.tiles[t].needsRender=!0}))}},{key:"swapTilesX",value:function(){this.tiles=[this.tiles[1],this.tiles[0],this.tiles[3],this.tiles[2]]}},{key:"swapTilesY",value:function(){this.tiles=[this.tiles[2],this.tiles[3],this.tiles[0],this.tiles[1]]}},{key:"moveTilesLeft",value:function(){this.swapTilesX(),this.invalidateTiles(0,2),this.x-=this.tileWidth}},{key:"moveTilesRight",value:function(){this.swapTilesX(),this.invalidateTiles(1,3),this.x+=this.tileWidth}},{key:"moveTilesUp",value:function(){this.swapTilesY(),this.invalidateTiles(0,1),this.y-=this.tileHeight}},{key:"moveTilesDown",value:function(){this.swapTilesY(),this.invalidateTiles(2,3),this.y+=this.tileHeight}},{key:"resetTiles",value:function(t,e){this.invalidateTiles(0,1,2,3),this.x=t.x-t.width/2,this.y=t.y-t.height/2,this.width=2*t.width,this.height=2*t.height,this.scale=e,this.tileWidth=t.width,this.tileHeight=t.height}}]),i}(f);function V(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var Y=function(){function t(e,i){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.image=e,this.position=i}var e,i,n;return e=t,(i=[{key:"getBoundary",value:function(){return{x:this.position.x,y:this.position.y,width:this.image.width/4,height:this.image.height/4}}}])&&V(e.prototype,i),n&&V(e,n),t}();function F(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}var q,J,G=function(){function t(e){var i=(void 0===e?{}:e).assetPrefix,n=void 0===i?"":i;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.worldBox={x:0,y:0,width:0,height:0},this.assets=[],this.widgets=[];for(var r=1;r<67;r++){var s=document.createElement("img");s.src="".concat(n,"/tiles/").concat(r.toString().padStart(2,"0"),".png"),this.assets.push(s)}this.createWidgets({x:-50*c,y:-50*u,width:100*c,height:100*u})}var e,i,n;return e=t,(i=[{key:"numWidgets",get:function(){return this.widgets.length}},{key:"getWidgets",value:function(t,e){var i=void 0===e?this.widgets:e,n=[];return i.forEach((function(e){var i=e.getBoundary();b(t,i)&&n.push(e)})),n}},{key:"createWidgets",value:function(t){for(var e=Math.min(this.worldBox.x,t.x),i=Math.min(this.worldBox.y,t.y),n={x:e,y:i,width:Math.max(this.worldBox.x+this.worldBox.width,t.x+t.width)-e,height:Math.max(this.worldBox.y+this.worldBox.height,t.y+t.height)-i},r=n.x;r<n.x+n.width;){for(var s=n.y;s<n.y+n.height;){if(!_({x:r,y:s},this.worldBox)){var o=Math.floor(Math.random()*this.assets.length),a=this.assets[o];this.widgets.push(new Y(a,{x:r,y:s}))}s+=Math.floor(200*(Math.random()+.5))}r+=Math.floor(200*(Math.random()+.5))}this.worldBox=n}}])&&F(e.prototype,i),n&&F(e,n),t}(),K=i(4353),Q=i(5942),$=i.n(Q);function tt(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function et(t,e){return function(t){if(Array.isArray(t))return t}(t)||function(t,e){var i=[],n=!0,r=!1,s=void 0;try{for(var o,a=t[Symbol.iterator]();!(n=(o=a.next()).done)&&(i.push(o.value),!e||i.length!==e);n=!0);}catch(h){r=!0,s=h}finally{try{n||null==a.return||a.return()}finally{if(r)throw s}}return i}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}(J=q||(q={})).Classic="classic",J.Tiling="tiling",J.Tiling2="tiling2";var it=(0,s.default)().publicRuntimeConfig.assetPrefix,nt=function(){var t=(0,r.useState)(q.Tiling2),e=t[0],i=t[1],s=et((0,K.M4)((function(){return function(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{},n=Object.keys(i);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(i).filter((function(t){return Object.getOwnPropertyDescriptor(i,t).enumerable})))),n.forEach((function(e){tt(t,e,i[e])}))}return t}({renderingEngine:{label:"Rendering Engine",value:e,options:{Classic:"classic",Tiling:"tiling","Tiling 2":"tiling2"},onChange:i}},"tiling2"===e?{tileSize:{label:"Title Size",value:512,min:256,max:1024,step:1},minZoomLevel:{label:"Zoom Level (min)",value:1,min:1,max:20,step:1},maxZoomLevel:{label:"Zoom Level (max)",value:20,min:1,max:20,step:1},showTiles:{label:"Show Tiles",value:!0}}:{},{zoomIn:(0,K.DN)({label:"Zoom-In Automation",opts:{Start:function(){d.current.navigationManager.zoomInAutomation()},Stop:function(){}}}),zoomOut:(0,K.DN)({label:"Zoom-Out Automation",opts:{Start:function(){d.current.navigationManager.zoomOutAutomation()},Stop:function(){}}}),pan:(0,K.DN)({label:"Pan Automation",opts:{Start:function(){d.current.navigationManager.panAutomation()},Stop:function(){}}})})}),[e]),2),o=s[0],a=o.tileSize,h=o.minZoomLevel,l=o.maxZoomLevel,c=o.showTiles,u=(s[1],(0,r.useRef)(null)),f=(0,r.useRef)(null),d=(0,r.useRef)(null);return(0,r.useEffect)((function(){f.current=new G({assetPrefix:it})}),[]),(0,r.useEffect)((function(){if(u.current){switch(e){case q.Classic:d.current=new x({canvas:u.current,widgetManager:f.current});break;case q.Tiling:d.current=new S({canvas:u.current,widgetManager:f.current});break;case q.Tiling2:d.current=new U({canvas:u.current,widgetManager:f.current,tileSize:a,minZoomLevel:h,maxZoomLevel:l,showTiles:c})}return function(){d.current.destroy(),d.current=null}}}),[e,a,h,l,c]),(0,n.jsx)("div",{children:(0,n.jsxs)("div",{children:[(0,n.jsx)("h2",{className:$().title,children:"[PoC] Tiles API"}),(0,n.jsx)("canvas",{ref:u,className:$().canvas}),(0,n.jsx)("div",{id:"widgetInfo",className:$().widgetInfo}),(0,n.jsx)("div",{className:$().tweaks,children:(0,n.jsx)(K.Zf,{fill:!0})})]})})}},5942:function(t){t.exports={title:"tiles_page_style_title__1_eLA",canvas:"tiles_page_style_canvas__vTT1w",widgetInfo:"tiles_page_style_widgetInfo__9p8nX",tweaks:"tiles_page_style_tweaks__0gzJz"}}},function(t){t.O(0,[603,774,888,179],(function(){return e=8661,t(t.s=e);var e}));var e=t.O();_N_E=e}]);
//# sourceMappingURL=tiles-bcc9d9c0786a4e4c.js.map