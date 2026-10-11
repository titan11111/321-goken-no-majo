import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:390,height:844}],['small',{width:320,height:568}],['land',{width:844,height:390}]]){
 const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
 await p.locator('#practice').tap();await p.waitForTimeout(300);
 for(const [wave,extra] of [[0,''],[2,''],[4,'danger'],[5,'boss']]){
  await p.evaluate(([wave,extra])=>{const T=__iron.test,S=T.state,W=__iron.snapshot().W;T.beginWave(wave);S.cam=S.gate.lock;S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.place({x:S.cam+90,z:.6,hp:extra==='danger'?25:120,rage:extra==='boss'?100:55,inv:0});
   const t=wave===5?'boss':wave===4?'guard':'ember';T.setEnemies([{type:t,x:S.cam+W*.72,z:.45,cool:5},{type:'frost',x:S.cam+W*.55,z:.8,cool:5}]);S.mode='play';S.combo=extra==='boss'?6:0;S.comboLife=9;},[wave,extra]);
  await p.waitForTimeout(700);await p.screenshot({path:out+`ui-${name}-w${wave}.png`});
 }
 console.log(name,errs);await ctx.close();
}
await b.close();
