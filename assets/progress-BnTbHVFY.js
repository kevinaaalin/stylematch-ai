import{c as f,r as u,j as l,k,l as m,d as C}from"./index-CXNMGNIj.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],S=f("CircleCheckBig",_);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]],U=f("UserCheck",I);var c="Progress",d=100,[w]=k(c),[E,M]=w(c),g=u.forwardRef((e,r)=>{const{__scopeProgress:n,value:o=null,max:a,getValueLabel:N=R,...b}=e;(a||a===0)&&!p(a)&&console.error(j(`${a}`,"Progress"));const t=p(a)?a:d;o!==null&&!v(o,t)&&console.error(A(`${o}`,"Progress"));const s=v(o,t)?o:null,$=i(s)?N(s,t):void 0;return l.jsx(E,{scope:n,value:s,max:t,children:l.jsx(m.div,{"aria-valuemax":t,"aria-valuemin":0,"aria-valuenow":i(s)?s:void 0,"aria-valuetext":$,role:"progressbar","data-state":y(s,t),"data-value":s??void 0,"data-max":t,...b,ref:r})})});g.displayName=c;var x="ProgressIndicator",P=u.forwardRef((e,r)=>{const{__scopeProgress:n,...o}=e,a=M(x,n);return l.jsx(m.div,{"data-state":y(a.value,a.max),"data-value":a.value??void 0,"data-max":a.max,...o,ref:r})});P.displayName=x;function R(e,r){return`${Math.round(e/r*100)}%`}function y(e,r){return e==null?"indeterminate":e===r?"complete":"loading"}function i(e){return typeof e=="number"}function p(e){return i(e)&&!isNaN(e)&&e>0}function v(e,r){return i(e)&&!isNaN(e)&&e<=r&&e>=0}function j(e,r){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${r}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${d}\`.`}function A(e,r){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${r}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${d} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var h=g,L=P;const V=u.forwardRef(({className:e,value:r,...n},o)=>l.jsx(h,{ref:o,className:C("relative h-2 w-full overflow-hidden rounded-full bg-primary/20",e),...n,children:l.jsx(L,{className:"h-full w-full flex-1 bg-primary transition-all",style:{transform:`translateX(-${100-(r||0)}%)`}})}));V.displayName=h.displayName;export{S as C,V as P,U};
