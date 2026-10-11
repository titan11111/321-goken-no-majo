'use strict';
const $=id=>document.getElementById(id);
const Store={get(k,d){try{return localStorage.getItem('tg.321.'+k)??d}catch{return d}},set(k,v){try{localStorage.setItem('tg.321.'+k,String(v))}catch{}}};
const Settings={mute:Store.get('mute','0')==='1',handed:Store.get('handed','right'),reduced:Store.get('reduced',matchMedia('(prefers-reduced-motion: reduce)').matches?'1':'0')==='1',quality:Store.get('quality','auto'),sensitivity:+Store.get('sensitivity','1')||1};
function applySettings(){document.body.classList.toggle('left-handed',Settings.handed==='left');document.body.classList.toggle('calm',Settings.reduced);$('mute').textContent=Settings.mute?'♪̸':'♪';$('mute').setAttribute('aria-pressed',String(Settings.mute));if(window.Sound)Sound.sync()}
const Input=(()=>{
 const sources=new Map(),queue=[],pointerSets=[];let ax=0,ay=0,pid=null;const times=[],outcomes={started:0,buffered:0,unavailable:0};
 const keys={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyJ:'punch',KeyZ:'punch',KeyK:'kick',KeyX:'kick',Space:'dash',KeyL:'dash',KeyU:'burst',KeyC:'burst',KeyI:'jump',KeyV:'jump'};
 function held(a){for(const x of sources.values())if(x===a)return true;return false}
 function press(a,source,stamp=performance.now()){const was=held(a);sources.set(source,a);if(!was&&!['up','down','left','right'].includes(a)){const cmd={a,t:stamp};if(!window.onGameAction?.(cmd)){queue.push(cmd);if(queue.length>8)queue.shift()}}if(window.Sound)Sound.unlock();}
 function release(source){sources.delete(source)}
 function clear(){sources.clear();pointerSets.forEach(s=>s.clear());queue.length=0;pid=null;ax=ay=0;$('nub').style.transform='';$('stick').classList.remove('active');document.querySelectorAll('.pressed').forEach(x=>x.classList.remove('pressed'))}
 document.querySelectorAll('[data-action]').forEach(el=>{
  const ids=new Set();pointerSets.push(ids);el.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();ids.add(e.pointerId);try{el.setPointerCapture(e.pointerId)}catch{}el.classList.add('pressed');press(el.dataset.action,'p'+e.pointerId,performance.now())},{passive:false});
  const up=e=>{ids.delete(e.pointerId);release('p'+e.pointerId);if(!ids.size)el.classList.remove('pressed')};['pointerup','pointercancel','lostpointercapture'].forEach(k=>el.addEventListener(k,up));
 });
 function move(e){if(e.pointerId!==pid)return;const r=$('stick').getBoundingClientRect();const dx=(e.clientX-r.left-r.width/2)/(r.width*.34),dy=(e.clientY-r.top-r.height/2)/(r.height*.34),l=Math.hypot(dx,dy);const strength=Math.min(1,Math.max(0,(l-.09)/.46)*Settings.sensitivity);ax=l?dx/l*strength:0;ay=l?dy/l*strength:0;$('nub').style.transform=`translate(${ax*r.width*.21}px,${ay*r.height*.21}px)`}
 $('stick').addEventListener('pointerdown',e=>{if(pid!==null)return;e.preventDefault();pid=e.pointerId;$('stick').classList.add('active');try{$('stick').setPointerCapture(pid)}catch{}move(e);window.Sound?.unlock()},{passive:false});
 const moveEvent=('onpointerrawupdate' in window)?'pointerrawupdate':'pointermove';$('stick').addEventListener(moveEvent,move,{passive:true});
 ['pointerup','pointercancel','lostpointercapture'].forEach(k=>$('stick').addEventListener(k,e=>{if(e.pointerId===pid){pid=null;ax=ay=0;$('nub').style.transform='';$('stick').classList.remove('active')}}));
 document.addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const a=keys[e.code];if(a){e.preventDefault();if(!e.repeat)press(a,'k'+e.code)}else if(!e.repeat){if(['Escape','KeyP','Enter'].includes(e.code)){e.preventDefault();window.onPause?.()}if(e.code==='KeyM')$('mute').click()}});
 document.addEventListener('keyup',e=>release('k'+e.code));
 window.addEventListener('blur',()=>{clear();window.onAutoPause?.()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();window.onAutoPause?.()}});window.addEventListener('pagehide',clear);
 document.addEventListener('dblclick',e=>e.preventDefault());document.addEventListener('contextmenu',e=>e.preventDefault());
 // Prevent multi-touch browser gestures only within gameplay controls; Pointer Events own all game actions.
 $('control-deck').addEventListener('touchstart',e=>e.preventDefault(),{passive:false});$('control-deck').addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
 return{held,clear,queue,moveEvent,get axes(){let x=ax+(held('right')?1:0)-(held('left')?1:0),y=ay+(held('down')?1:0)-(held('up')?1:0),l=Math.hypot(x,y);return l>1?{x:x/l,y:y/l}:{x,y}},drain(){return queue.splice(0)},sample(t,outcome='started'){outcomes[outcome]=(outcomes[outcome]||0)+1;times.push(performance.now()-t);if(times.length>120)times.shift()},get metrics(){const a=[...times].sort((a,b)=>a-b);return{outcomes:{...outcomes},samples:a.length,mean:a.length?a.reduce((x,y)=>x+y,0)/a.length:0,p95:a.length?a[Math.min(a.length-1,Math.floor(a.length*.95))]:0,max:a.at(-1)||0}},get latency(){return times.length?times.reduce((a,b)=>a+b,0)/times.length:0}};
})();
$('mute').addEventListener('click',()=>{Settings.mute=!Settings.mute;Store.set('mute',Settings.mute?'1':'0');applySettings();window.Sound?.unlock()});$('pause').addEventListener('click',()=>window.onPause?.());applySettings();
