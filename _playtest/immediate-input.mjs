import {chromium,webkit} from '../../playwright-test/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const results=[];
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const b=await engine.launch();const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await p.goto('http://127.0.0.1:8890/?test=1');await p.locator('#practice').tap();
 const r=await p.evaluate(()=>{
  const T=__iron.test,G=T.state;
  const send=(id,n)=>{const e=document.getElementById(id);e.dispatchEvent(new PointerEvent('pointerdown',{pointerId:n,button:0,pointerType:'touch',bubbles:true}));e.dispatchEvent(new PointerEvent('pointerup',{pointerId:n,button:0,pointerType:'touch',bubbles:true}))};
  T.start(true);T.resetEnemies();send('punch',501);
  const immediate=!!G.p.attack&&G.p.attack.t===0&&Input.queue.length===0;
  const anticipationCancelable=G.p.attack.t===0;send('dash',502);
  const cancel=anticipationCancelable&&G.p.attack===null&&G.p.dash>0;
  T.place({attack:null,dash:0,dashCD:0,stun:0});G.hitstop=.045;send('dash',503);
  const hitstop=G.hitstop===0&&G.p.dash>0;
  T.place({attack:null,dash:0,dashCD:0,stun:0,stepK:2,chainLife:1});send('kick',504);send('punch',505);
  const buffer=G.p.buffer?.kind==='punch'&&G.p.buffer.until-performance.now()>600;
  const pressed=document.querySelectorAll('.pressed').length===0;
  return {immediate,cancel,hitstop,buffer,pressed,metrics:__iron.snapshot().inputMetrics};
 });
 for(const key of ['immediate','cancel','hitstop','buffer','pressed'])results.push({name:name+'-'+key,pass:r[key]});
 console.log(name,JSON.stringify(r));await b.close();
}
await writeFile(new URL('immediate-input.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),results},null,2));
if(results.some(r=>!r.pass))process.exitCode=1;
