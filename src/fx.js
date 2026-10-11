// Magic effects: projectiles, charge-up, impact blasts, light pillars, glows and runes.
// Everything is vector-drawn ONCE into small offscreen sprites (per colour), then composited with
// additive blending. No gradient is created per frame, which was the main fill/CPU cost before.
const MagicFx=(()=>{
 const TAU=Math.PI*2,K=2,sets=new Map(),glows=new Map(),runes=new Map();
 function canvas(w,h,k=K){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*k));c.height=Math.max(1,Math.ceil(h*k));const x=c.getContext('2d');x.scale(k,k);return [c,x]}
 function rgba(hex){let h=String(hex).replace('#','');if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16)||0;return{r:n>>16&255,g:n>>8&255,b:n&255,a:h.length>=8?parseInt(h.slice(6,8),16)/255:1}}
 const mix=(c,t,to)=>({r:Math.round(c.r+(to-c.r)*t),g:Math.round(c.g+(to-c.g)*t),b:Math.round(c.b+(to-c.b)*t),a:c.a});
 const css=(c,a=1)=>`rgba(${c.r},${c.g},${c.b},${a})`;
 const hash=(a,b)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s)};
 function radial(x,R,stops){const g=x.createRadialGradient(R,R,0,R,R,R);for(const[o,c]of stops)g.addColorStop(o,c);x.fillStyle=g;x.fillRect(0,0,R*2,R*2)}
 function makeSet(col){
  const base=rgba(col),light=mix(base,.38,255),hot=mix(base,.66,255),S={};
  {const R=S.haloR=64,[c,x]=canvas(R*2,R*2);radial(x,R,[[0,css(hot,.95)],[.14,css(light,.72)],[.4,css(base,.42)],[.7,css(base,.14)],[1,css(base,0)]]);S.halo=c}
  {const R=S.auraR=60,d=mix(base,.3,0),[c,x]=canvas(R*2,R*2);radial(x,R,[[0,css(d,.0)],[.25,css(d,.5)],[.55,css(d,.4)],[1,css(d,0)]]);S.aura=c}
  {const R=S.coreR=18,[c,x]=canvas(R*2,R*2);radial(x,R,[[0,'rgba(255,255,255,1)'],[.4,css(hot,1)],[.72,css(light,.85)],[1,css(base,0)]]);S.core=c}
  {const R=S.starR=56,[c,x]=canvas(R*2,R*2);x.translate(R,R);const g=x.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,css(hot,1));g.addColorStop(.55,css(light,.75));g.addColorStop(1,css(base,0));x.fillStyle=g;
   for(let i=0;i<8;i++){const a=i*TAU/8,L=i%2?R*.62:R,w=i%2?3.2:4.6;x.beginPath();x.moveTo(Math.cos(a-Math.PI/2)*w,Math.sin(a-Math.PI/2)*w);x.lineTo(Math.cos(a)*L,Math.sin(a)*L);x.lineTo(Math.cos(a+Math.PI/2)*w,Math.sin(a+Math.PI/2)*w);x.closePath();x.fill()}S.star=c}
  {const R=S.ringR=34,[c,x]=canvas(R*2,R*2);x.translate(R,R);x.lineCap='round';x.strokeStyle=css(light,.95);x.lineWidth=3.4;for(let i=0;i<3;i++){x.beginPath();x.arc(0,0,R-4,i*TAU/3,i*TAU/3+1.25);x.stroke()}
   x.strokeStyle=css(base,.45);x.lineWidth=1;x.beginPath();x.arc(0,0,R-4,0,TAU);x.stroke();x.strokeStyle=css(hot,.7);x.lineWidth=1.6;for(let i=0;i<2;i++){x.beginPath();x.arc(0,0,R*.6,i*Math.PI+.4,i*Math.PI+1.5);x.stroke()}S.ring=c}
  {const TW=170,TH=58,cy=TH/2,[c,x]=canvas(TW,TH);let g=x.createLinearGradient(0,0,TW,0);g.addColorStop(0,css(base,0));g.addColorStop(.55,css(base,.32));g.addColorStop(1,css(light,.9));x.fillStyle=g;
   x.beginPath();x.moveTo(TW-4,cy-20);x.bezierCurveTo(TW*.62,cy-20,TW*.4,cy-8,0,cy);x.bezierCurveTo(TW*.4,cy+8,TW*.62,cy+20,TW-4,cy+20);x.closePath();x.fill();
   g=x.createLinearGradient(0,0,TW,0);g.addColorStop(0,css(hot,0));g.addColorStop(1,css(hot,.95));x.fillStyle=g;x.beginPath();x.moveTo(TW-4,cy-9);x.bezierCurveTo(TW*.7,cy-8,TW*.5,cy-2,TW*.12,cy);x.bezierCurveTo(TW*.5,cy+2,TW*.7,cy+8,TW-4,cy+9);x.closePath();x.fill();
   let seed=7;const rn=()=>(seed=(seed*16807)%2147483647)/2147483647;x.lineCap='round';
   for(let i=0;i<7;i++){const y0=cy+(rn()-.5)*30,len=TW*(.35+rn()*.6);x.strokeStyle=css(i%2?hot:light,.35+rn()*.4);x.lineWidth=.8+rn()*1.4;x.beginPath();x.moveTo(TW-8,y0);x.quadraticCurveTo(TW-len*.5,y0+(rn()-.5)*14,TW-len,cy+(rn()-.5)*6);x.stroke()}S.tail=c}
  {const [c,x]=canvas(40,200,1.5);let g=x.createLinearGradient(0,0,40,0);g.addColorStop(0,css(base,0));g.addColorStop(.3,css(base,.55));g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(.7,css(base,.55));g.addColorStop(1,css(base,0));x.fillStyle=g;x.fillRect(0,0,40,200);
   x.globalCompositeOperation='destination-in';g=x.createLinearGradient(0,0,0,200);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.3,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=g;x.fillRect(0,0,40,200);S.beam=c}
  S.light=light;return S;
 }
 function set(col){let s=sets.get(col);if(!s){s=makeSet(col);sets.set(col,s)}return s}
 const put=(ctx,img,r,a)=>{ctx.globalAlpha=a;ctx.drawImage(img,-r,-r,r*2,r*2)};
 // Energy bolt: floor-lane glow, braided comet tail, pulsing halo, counter-rotating stars, ring, hot core, crackle.
 // lod 0 = light (phones under load), 1 = medium, 2 = full.
 function shot(ctx,x,y,floorY,dir,t,id,col,m,lod){
  const S=set(col),ph=t*19+id*1.7,pulse=1+Math.sin(ph)*.09;ctx.save();
  ctx.globalAlpha=.9;{const ar=S.auraR*m*1.15*pulse;ctx.drawImage(S.aura,x-ar,y-ar,ar*2,ar*2)}ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=.5;const fw=S.haloR*1.5*m;ctx.drawImage(S.halo,x-fw,floorY-fw*.17,fw*2,fw*.34);
  ctx.translate(x,y);
  ctx.save();ctx.scale(dir,1);const tl=170*m*(1+Math.sin(ph*1.3)*.1),th=58*m*(1+Math.sin(ph*2.1)*.14);ctx.globalAlpha=.95;ctx.drawImage(S.tail,-tl,-th/2,tl,th);
  if(lod>=1){const l2=tl*1.45,h2=th*.55;ctx.rotate(Math.sin(ph*.9)*.05);ctx.globalAlpha=.5;ctx.drawImage(S.tail,-l2,-h2/2,l2,h2)}ctx.restore();
  put(ctx,S.halo,S.haloR*m*pulse,.8);
  if(lod>=1){ctx.save();ctx.rotate(t*3.2+id);put(ctx,S.ring,S.ringR*m*1.05,.9);ctx.restore()}
  ctx.save();ctx.rotate(t*5.5+id);const sr=S.starR*m*pulse;put(ctx,S.star,sr,.85);ctx.rotate(-t*11-.4);put(ctx,S.star,sr*.62,.7);ctx.restore();
  put(ctx,S.core,S.coreR*m*(1+Math.sin(ph*1.7)*.07),1);
  if(lod>=2){const step=Math.floor(t*22)+id*13;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   for(let b=0;b<3;b++){let a=hash(step,b)*TAU;ctx.moveTo(0,0);for(let j=1;j<=4;j++){a+=(hash(step,b*7+j)-.5)*1.6;const r=26*m*j/4;ctx.lineTo(Math.cos(a)*r+(hash(step,b*5+j+9)-.5)*6,Math.sin(a)*r+(hash(step,b*3+j+4)-.5)*6)}}
   ctx.globalAlpha=.55;ctx.strokeStyle=css(S.light,1);ctx.lineWidth=3.2;ctx.stroke();ctx.globalAlpha=.95;ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.stroke()}
  ctx.restore();
 }
 // Gathering energy at the caster's hand: rings contract inward while the orb swells (fr 0..1).
 function charge(ctx,x,y,fr,col,t,m,lod){
  const S=set(col),e=fr*fr*(3-2*fr),a=.35+.65*fr;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);
  put(ctx,S.halo,S.haloR*m*(.25+e*.95)*(1+Math.sin(t*26)*.06),a*.9);
  for(let i=0;i<2;i++){const k=(t*1.5+i*.5)%1;ctx.save();ctx.rotate(t*4*(i?-1:1));put(ctx,S.ring,S.ringR*m*(2.4-1.7*k)*(.7+.3*fr),a*k*.9);ctx.restore()}
  ctx.save();ctx.rotate(t*7);put(ctx,S.star,S.starR*m*(.15+e*.7),a*.8);ctx.restore();
  put(ctx,S.core,S.coreR*m*(.15+e*.85),a);
  if(lod>=1)for(let i=0;i<8;i++){const k=(t*1.7+i/8)%1,ang=i*2.399+t*1.3,d=(1-k)*64*m,sr=S.coreR*m*.28;ctx.globalAlpha=a*k;ctx.drawImage(S.core,Math.cos(ang)*d-sr,Math.sin(ang)*d*.8-sr,sr*2,sr*2)}
  ctx.restore();
 }
 // Impact / muzzle burst, k = progress 0..1.
 function blast(ctx,x,y,k,col,m){
  const S=set(col),f=1-k,e1=1-f*f;ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);
  put(ctx,S.halo,S.haloR*m*(.5+e1*2.4),Math.min(1,f*1.4));
  ctx.save();ctx.rotate(k*2.2);put(ctx,S.star,S.starR*m*(.5+e1*1.9),f);ctx.restore();
  put(ctx,S.ring,S.ringR*m*(.8+e1*3.4),f);
  put(ctx,S.core,S.coreR*m*(1.7-k*1.1),Math.pow(f,.6));ctx.restore();
 }
 // Column of light for ground magic (k = fade 0..1).
 function pillar(ctx,x,y,h,w,col,k,t){
  const S=set(col),f=1-k,wob=1+Math.sin(t*40)*.06;ctx.save();ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=f;ctx.drawImage(S.beam,x-w*wob*.5,y-h,w*wob,h);ctx.globalAlpha=f*.9;ctx.drawImage(S.beam,x-w*.17,y-h,w*.34,h);
  const R=w*1.6;ctx.globalAlpha=f;ctx.drawImage(S.halo,x-R,y-R*.3,R*2,R*.6);ctx.restore();
 }
 function glow(ctx,x,y,r,col){let g=glows.get(col);if(!g){const b=rgba(col),[c,x2]=canvas(64,64,1.5);radial(x2,32,[[0,css(b,b.a)],[1,css(b,0)]]);glows.set(col,c);g=c}ctx.drawImage(g,x-r,y-r,r*2,r*2)}
 // Floor rune: drawn once per (colour, size bucket) and then rotated/squashed like the old per-frame strokes.
 function rune(ctx,x,y,r,col,t){
  const q=Math.max(8,Math.round(r/4)*4),key=col+'|'+q;let c=runes.get(key);
  if(!c){if(runes.size>80)runes.clear();const D=Math.ceil(q*1.12*2+4),[cv,g]=canvas(D,D);c=cv;g.translate(D/2,D/2);g.strokeStyle=col;g.lineCap='round';
   g.lineWidth=1.5;g.beginPath();g.arc(0,0,q,0,TAU);g.stroke();g.lineWidth=.8;g.beginPath();g.arc(0,0,q*.8,0,TAU);g.stroke();
   for(let i=0;i<6;i++){const a=i*TAU/6;g.lineWidth=.8;g.beginPath();g.moveTo(Math.cos(a)*q*.8,Math.sin(a)*q*.8);g.lineTo(Math.cos(a+TAU/3)*q*.8,Math.sin(a+TAU/3)*q*.8);g.stroke();g.lineWidth=1.5;g.beginPath();g.moveTo(Math.cos(a)*q*.88,Math.sin(a)*q*.88);g.lineTo(Math.cos(a)*q*1.12,Math.sin(a)*q*1.12);g.stroke()}
   c.logical=D;runes.set(key,c)}
  const k=r/q,D=c.logical*k;ctx.save();ctx.translate(x,y);ctx.scale(1,.43);ctx.rotate(t*.3);ctx.drawImage(c,-D/2,-D/2,D,D);ctx.restore();
 }
 for(const c of['#ffac72','#8edce8','#90efc8','#ffe6a7','#9ee8ff','#fff3b8'])set(c);
 return{shot,charge,blast,pillar,glow,rune};
})();
