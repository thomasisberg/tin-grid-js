/*! For license information please see main.js.LICENSE.txt */
(()=>{var e={641:function(e){e.exports=function(){function e(e){return null==e||""===e}function t(e,t){return e.classList.contains(t)}function r(e,r){t(e,r)||e.classList.add(r)}function i(e,r){t(e,r)&&e.classList.remove(r)}return function(o,n){var s,a={columnBreakpoints:[470,660,930,1200,1560,1880],wideColSpan:2,itemHeightType:"auto",itemHeight:null,wideItemHeight:null,useTransition:!1,transitionTime:"400ms",transitionEasing:"cubic-bezier(.48,.01,.21,1)",minOffsetYNextColumn:0,useOptimizedPositions:!0,normalizationOffsetYThreshold:0,normalizationOffsetYThresholdPercent:0};if("object"==typeof(s=n)&&null!==s)for(var l in a)void 0!==n[l]&&(a[l]=n[l]);if(Array.isArray(a.wideColSpan)&&a.wideColSpan.length!==a.columnBreakpoints.length+1)console.error("TinGrid: When specifying wide col spans for break points, you must specify exactly one col span per breakpoint. Expected "+(a.columnBreakpoints.length+1)+" but found "+a.wideColSpan.length);else if("auto"===a.itemHeightType||"number"==typeof a.itemHeight)if(null===a.wideItemHeight||"number"==typeof a.wideItemHeight){if(null===a.wideItemHeight&&(a.wideItemHeight=a.itemHeight),a.normalizationOffsetYThreshold){var c=a.normalizationOffsetYThreshold;if("string"==typeof c){var u=c.indexOf("%");if(!1===u)return void console.error('TinGrid: When specifying normalizationOffsetYThreshold as a string you must include the percent character, for example "50%".');if(a.normalizationOffsetYThresholdPercent=parseInt(c.substr(0,u),10)/100,isNaN(a.normalizationOffsetYThresholdPercent))return void console.error("TinGrid: Could not calculate normalizationOffsetYThreshold in percent.")}}if(!a.normalizationOffsetYThresholdPercent||"number"==typeof a.normalizationOffsetYThresholdPercent){var f,d=0,p=[],h=1;return m(o),p.length&&(v(),window.addEventListener("resize",v)),{add:m,remove:g,removeAll:function(){for(;p.length;)g(0)},update:v,sorted:function(){var e,t,r,i,o;for(t=0;t<p.length;t++){for(i=[],o=(r=p[t]).ul.children,e=0;e<o.length;e++)i.push(o[e]);r.items=i}}}}console.error("TinGrid: normalizationOffsetYThresholdPercent must be defined as a Number.")}else console.error("TinGrid: You must specify wideItemHeight as null or a Number");else console.error("TinGrid: You must specify itemHeight as a Number.");function m(e){var t,r,i,o,n=e.querySelector("ul");n||(n=e.querySelector(".container"));var s=[],l=n.children;for(t=0;t<l.length;t++){var c=l[t];if(c.style.position="absolute",a.useTransition){var u="top "+a.transitionTime+" "+a.transitionEasing+", left "+a.transitionTime+" "+a.transitionEasing;"auto"!==a.itemHeightType&&(u+=", width "+a.transitionTime+" "+a.transitionEasing+", height "+a.transitionTime+" "+a.transitionEasing),c.style.transition=u}s.push(c)}if(function(e){return!0===e||"true"===e||1===e||"1"===e}(e.getAttribute("data-randomized"))){s=function(e){for(t=e.length;t;r=Math.floor(Math.random()*t),i=e[--t],e[t]=e[r],e[r]=i);return e}(s)}p.push({tableau:e,ul:n,items:s,cols:[],cols_real:[],cols_normalization:[],cols_items:[]});var f=e.querySelectorAll("img");for(t=0,o=f.length;t<o;t++)f[t].addEventListener("load",v)}function g(e){if(p.length>e){const t=p.splice(e,1)[0].tableau.querySelectorAll("img"),r=t.length;for(let e=0;e<r;e++)t[e].removeEventListener("load",v)}}function v(){var o,n,s,l,c,u,m,g,y,x,T,w;for(clearTimeout(d),d=setTimeout(v,3e3),c=0;c<p.length;c++){const d=(u=p[c]).tableau;for(o=d.offsetWidth,f=1,n=0,s=a.columnBreakpoints.length;n<s&&!(o<a.columnBreakpoints[n]);n++)f++;d.setAttribute("tin-grid-cols",f),(h=Array.isArray(a.wideColSpan)?a.wideColSpan[f-1]:a.wideColSpan)>f&&(h=f);var _=100/f,A=Math.floor(1/f*o),z=a.normalizationOffsetYThreshold;for(a.normalizationOffsetYThresholdPercent&&(z=a.normalizationOffsetYThresholdPercent*A),u.cols=[],u.cols_real=[],u.cols_normalization=[],u.cols_items=[],n=0;n<f;n++)u.cols[n]=0,u.cols_real[n]=0,u.cols_normalization[n]=0,u.cols_items[n]=[];for(g=[],n=0,B=u.items.length;n<B;n++)t(m=u.items[n],"off")||g.push(m);for(g.length&&!e(g[0].getAttribute("tin-grid-sort"))&&g.sort((function(e,t){return parseInt(e.getAttribute("tin-grid-sort"),10)-parseInt(t.getAttribute("tin-grid-sort"),10)})),y=0,x=-1,n=0;n<g.length;n++){m=g[n];var H=f>1&&t(m,"wide");T=H?h:1,m.style.width=_*T+"%";var O=b(m,H,A),k=x=(x+1)%f;if(a.useOptimizedPositions)for(k=0,w=Number.MAX_VALUE,s=0;s<f-(T-1);s++){var I=u.cols[s];for(l=1;l<T;l++)u.cols[s+l]>I&&(I=u.cols[s+l]);I<w-a.minOffsetYNextColumn&&(k=s,w=I)}else for(w=0,s=0;s<T;s++)u.cols[k+s]>w&&(w=u.cols[k+s]);if(!e(m.getAttribute("tin-grid-position"))){var C=m.getAttribute("tin-grid-position");"left"===C?k=0:"center"===C?k=Math.floor((f-T)/2):"right"===C&&(k=f-T)}if(T>1&&a.useOptimizedPositions)for(s=n+1;s<g.length;s++){var E=u.cols[k+1]-u.cols[k],S=E>0?E:-E,Y=g[s],N=f>1&&t(Y,"wide");if(!N){Y.style.width=_+"%";var P=b(Y,N,A);if(!(P<1.5*S))break;g.splice(s,1),s--;var q=E>0?k:k+1;Y.style.top=u.cols[q]+"px",Y.style.left=q*(100/f)+"%",u.cols[q]+=P,w=u.cols_real[k]>u.cols_real[k+1]?u.cols_real[k]:u.cols_real[k+1]}}u.cols_items[k].push(m);var M=O;for(f>T&&!e(m.getAttribute("tin-grid-solo"))&&(M=Number.MAX_VALUE),s=0;s<T;s++)u.cols[k+s]=w+M,u.cols_real[k+s]=w+O;if(m.style.top=w+"px",m.style.left=k*(100/f)+"%",k+T>y&&(y=k+T),z){var L=u.cols[k];for(s=0;s<f;s++)(s<k||s>k+T-1)&&u.cols[s]>u.cols[k]&&u.cols[s]-u.cols[k]<z&&u.cols[s]>L&&(L=u.cols[s]);for(s=0;s<T;s++)u.cols[k+s]=L,u.cols_real[k+s]=L;for(s=0;s<f;s++)(s<k||s>k+T-1)&&u.cols[s]<w&&w-u.cols[s]<z&&(u.cols[s]=w,u.cols_real[s]=w);for(s=0;s<f;s++)for(l=0;l<f;l++)if(s!==l&&!(l>s)){var G=u.cols[s],j=u.cols[l];j<G&&G-j<z&&(u.cols[l]=G,u.cols_real[l]=G)}}}for(n=0;n<f;n++){var B=u.cols_items[n].length;for(s=0;s<B;s++)0===s?r(u.cols_items[n][s],"tin-grid-first"):i(u.cols_items[n][s],"tin-grid-first"),s===B-1?r(u.cols_items[n][s],"tin-grid-last"):i(u.cols_items[n][s],"tin-grid-last")}var Z=0;for(n=0;n<f;n++)u.cols_real[n]>Z&&(Z=u.cols_real[n]);u.ul.style.height=Z+"px"}}function b(t,r,i){var o=null;if(e(t.getAttribute("data-ratio"))){if(!e(t.getAttribute("data-height"))){var n=parseInt(t.getAttribute("data-height"),10);isNaN(n)||(o=n,t.style.height=o+"px")}}else{var s=t.getAttribute("data-ratio").split(":");if(2===s.length){var l=s[1]/s[0];isNaN(l)||(o=o=i*(r?h:1)*l,t.style.height=o+"px")}}return null===o&&("auto"===a.itemHeightType?o=t.offsetHeight:"fixed"===a.itemHeightType?(o=r?a.wideItemHeight:a.itemHeight,t.style.height=o+"px"):"ratio"===a.itemHeightType&&(o=i*(r?h:1)*(r?a.wideItemHeight:a.itemHeight),t.style.height=o+"px")),o}}}()},949:(e,t,r)=>{"use strict";r.d(t,{Z:()=>a});var i=r(81),o=r.n(i),n=r(645),s=r.n(n)()(o());s.push([e.id,'html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:"";content:none}table{border-collapse:collapse;border-spacing:0}*{box-sizing:border-box}body{font-family:sans-serif}h1{font-size:2em;text-align:center;margin:40px 20px 1em 20px;font-weight:700}h2{font-weight:700;text-align:center;margin:1em 20px 40px 20px}#TinGrid{max-width:1200px;margin-left:auto;margin-right:auto}ul{position:relative;display:flex}li{display:flex;flex-direction:column;padding:5px}li:after{display:block;content:"";background-color:red;margin:5px;flex-grow:1}.lorem{display:block}',""]);const a=s},645:e=>{"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var r="",i=void 0!==t[5];return t[4]&&(r+="@supports (".concat(t[4],") {")),t[2]&&(r+="@media ".concat(t[2]," {")),i&&(r+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),r+=e(t),i&&(r+="}"),t[2]&&(r+="}"),t[4]&&(r+="}"),r})).join("")},t.i=function(e,r,i,o,n){"string"==typeof e&&(e=[[null,e,void 0]]);var s={};if(i)for(var a=0;a<this.length;a++){var l=this[a][0];null!=l&&(s[l]=!0)}for(var c=0;c<e.length;c++){var u=[].concat(e[c]);i&&s[u[0]]||(void 0!==n&&(void 0===u[5]||(u[1]="@layer".concat(u[5].length>0?" ".concat(u[5]):""," {").concat(u[1],"}")),u[5]=n),r&&(u[2]?(u[1]="@media ".concat(u[2]," {").concat(u[1],"}"),u[2]=r):u[2]=r),o&&(u[4]?(u[1]="@supports (".concat(u[4],") {").concat(u[1],"}"),u[4]=o):u[4]="".concat(o)),t.push(u))}},t}},81:e=>{"use strict";e.exports=function(e){return e[1]}},379:e=>{"use strict";var t=[];function r(e){for(var r=-1,i=0;i<t.length;i++)if(t[i].identifier===e){r=i;break}return r}function i(e,i){for(var n={},s=[],a=0;a<e.length;a++){var l=e[a],c=i.base?l[0]+i.base:l[0],u=n[c]||0,f="".concat(c," ").concat(u);n[c]=u+1;var d=r(f),p={css:l[1],media:l[2],sourceMap:l[3],supports:l[4],layer:l[5]};if(-1!==d)t[d].references++,t[d].updater(p);else{var h=o(p,i);i.byIndex=a,t.splice(a,0,{identifier:f,updater:h,references:1})}s.push(f)}return s}function o(e,t){var r=t.domAPI(t);return r.update(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap&&t.supports===e.supports&&t.layer===e.layer)return;r.update(e=t)}else r.remove()}}e.exports=function(e,o){var n=i(e=e||[],o=o||{});return function(e){e=e||[];for(var s=0;s<n.length;s++){var a=r(n[s]);t[a].references--}for(var l=i(e,o),c=0;c<n.length;c++){var u=r(n[c]);0===t[u].references&&(t[u].updater(),t.splice(u,1))}n=l}}},569:e=>{"use strict";var t={};e.exports=function(e,r){var i=function(e){if(void 0===t[e]){var r=document.querySelector(e);if(window.HTMLIFrameElement&&r instanceof window.HTMLIFrameElement)try{r=r.contentDocument.head}catch(e){r=null}t[e]=r}return t[e]}(e);if(!i)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");i.appendChild(r)}},216:e=>{"use strict";e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},565:(e,t,r)=>{"use strict";e.exports=function(e){var t=r.nc;t&&e.setAttribute("nonce",t)}},795:e=>{"use strict";e.exports=function(e){var t=e.insertStyleElement(e);return{update:function(r){!function(e,t,r){var i="";r.supports&&(i+="@supports (".concat(r.supports,") {")),r.media&&(i+="@media ".concat(r.media," {"));var o=void 0!==r.layer;o&&(i+="@layer".concat(r.layer.length>0?" ".concat(r.layer):""," {")),i+=r.css,o&&(i+="}"),r.media&&(i+="}"),r.supports&&(i+="}");var n=r.sourceMap;n&&"undefined"!=typeof btoa&&(i+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(n))))," */")),t.styleTagTransform(i,e,t.options)}(t,e,r)},remove:function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)}}}},589:e=>{"use strict";e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}}},t={};function r(i){var o=t[i];if(void 0!==o)return o.exports;var n=t[i]={id:i,exports:{}};return e[i].call(n.exports,n,n.exports,r),n.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=r(641),t=r.n(e),i=r(379),o=r.n(i),n=r(795),s=r.n(n),a=r(569),l=r.n(a),c=r(565),u=r.n(c),f=r(216),d=r.n(f),p=r(589),h=r.n(p),m=r(949),g={};g.styleTagTransform=h(),g.setAttributes=u(),g.insert=l().bind(null,"head"),g.domAPI=s(),g.insertStyleElement=d(),o()(m.Z,g),m.Z&&m.Z.locals&&m.Z.locals,t()(document.getElementById("TinGrid"),{itemHeightType:"ratio",itemHeight:1,useTransition:!0})})()})();