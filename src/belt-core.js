// Extracted and adapted from 313-kyonin-kagemaru/game.js: clamp, lerp,
// depth scaling, foot-plane collision, nearest-facing and wave camera locks.
const Belt=(()=>{
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 const lerp=(a,b,t)=>a+(b-a)*t;
 const depthScale=z=>.84+clamp(z,0,1)*.16;
 const sameLane=(a,b,tolerance=.15)=>Math.abs(a.z-b.z)<=tolerance;
 function nearest(p,es,range=180){let best=null,d=Infinity;for(const e of es){if(e.hp<=0)continue;const n=Math.abs(e.x-p.x)+Math.abs(e.z-p.z)*220;if(n<d&&n<range){best=e;d=n}}return best}
 class WaveGate{constructor(){this.index=0;this.active=false;this.lock=Infinity;this.min=0}begin(at){this.active=true;this.lock=at}clear(){this.active=false;this.min=this.lock;this.lock=Infinity;this.index++}camera(playerX,width){return clamp(playerX-width*.38,this.min,this.lock)}}
 return{clamp,lerp,depthScale,sameLane,nearest,WaveGate};
})();
