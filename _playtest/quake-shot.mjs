import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:390,height:844}],['land',{width:844,height:390}]]){
 const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:1.5});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
 await p.locator('#practice').tap();await p.waitForTimeout(300);
 await p.evaluate(()=>{const T=__iron.test,S=T.state,W=__iron.snapshot().W;T.beginWave(1);S.cam=S.gate.lock;T.place({x:S.cam+W*.3,z:.62,rage:100,inv:0});T.setEnemies([{type:'guard',x:S.cam+W*.45,z:.55,cool:9},{type:'ember',x:S.cam+W*.62,z:.3,cool:9},{type:'frost',x:S.cam+W*.8,z:.75,cool:9},{type:'guard',x:S.cam+W*.92,z:.5,cool:9}]);S.chapter=0;document.getElementById('chapter').classList.add('hidden');S.mode='play';window.__hp=S.enemies.map(e=>e.hp);T.burst()});
 await p.waitForTimeout(60);await p.evaluate(()=>{__iron.test.setMode('pause')});
 for(const [i,t] of [[0,.06],[1,.15],[2,.3],[3,.55]]){await p.evaluate(t=>{const S=__iron.test.state;S.quakes[0].t=t;S.blasts.forEach(b=>b.t=Math.min(t,b.life*.95))},t);await p.waitForTimeout(80);await p.screenshot({path:out+`quake-${name}-${i}.png`})}
 console.log(name,await p.evaluate(()=>__iron.test.state.enemies.map((e,i)=>[e.type,__hp[i],e.hp])),errs);await ctx.close();
}
await b.close();
