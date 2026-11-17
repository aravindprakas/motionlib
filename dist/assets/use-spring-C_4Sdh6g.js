import{c as o,u as d,M as h}from"./useReducedMotion-BmAmdBJi.js";import{r as n}from"./index-BZ5_8Oo4.js";import{m as g,k as l,f as k,u as L,b as S,l as C}from"./proxy-BAN1gSAH.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=o("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=o("Compass",[["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=o("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=o("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);function M(t){const r=d(()=>g(t)),{isStatic:u}=n.useContext(h);if(u){const[,s]=n.useState(t);n.useEffect(()=>r.on("change",s),[])}return r}function f(t){return typeof t=="number"?t:parseFloat(t)}function E(t,r={}){const{isStatic:u}=n.useContext(h),s=n.useRef(null),e=M(l(t)?f(t.get()):t),c=n.useRef(e.get()),i=n.useRef(()=>{}),y=()=>{const a=s.current;a&&a.time===0&&a.sample(S.delta),p(),s.current=C({keyframes:[e.get(),c.current],velocity:e.getVelocity(),type:"spring",restDelta:.001,restSpeed:.01,...r,onUpdate:i.current})},p=()=>{s.current&&s.current.stop()};return n.useInsertionEffect(()=>e.attach((a,m)=>u?m(a):(c.current=a,i.current=m,k.update(y),e.get()),p),[JSON.stringify(r)]),L(()=>{if(l(t))return t.on("change",a=>e.set(f(a)))},[e]),e}export{V as C,R as L,z as S,E as a,b,M as u};
