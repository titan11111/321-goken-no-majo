import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;
const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:390,height:844}],['land',{width:844,height:390}]]){
 const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
 await p.locator('#practice').tap();await p.waitForTimeout(400);
 await p.evaluate(()=>{const T=__iron.test,S=T.state,W=__iron.snapshot().W;T.beginWave(5);S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.place({x:S.cam+60,z:.6,hp:120});
  T.setEnemies([{type:'boss',x:S.cam+W*.85,z:.5},{type:'ember',x:S.cam+W*.7,z:.25},{type:'frost',x:S.cam+W*.55,z:.9}]);
  S.enemies[1].cast=.6;S.enemies[1].castTotal=1;S.enemies[2].cast=.35;S.enemies[2].castTotal=1;S.enemies[0].cool=9;
  T.shot({x:S.cam+W*.34,z:.62,vx:-1,vz:0,life:99,r:10,col:'#ffac72'});T.shot({x:S.cam+W*.6,z:.3,vx:-1,vz:0,life:99,r:13,col:'#90efc8'});T.shot({x:S.cam+W*.5,z:.9,vx:1,vz:0,life:99,r:10,col:'#ffe6a7',reflected:true});S.blasts.push({x:S.cam+W*.3,y:300,col:'#8edce8',m:1.4,t:.1,life:2});
  S.hazards.push({x:S.cam+W*.2,z:.5,t:1.0,delay:.95,r:55});S.mode='test'});
 // keep charge state frozen: re-assert cast each frame
 await p.evaluate(()=>{const S=__iron.test.state;setInterval(()=>{S.enemies[1].cast=.6;S.enemies[2].cast=.35},10);S.hazards[0].t=1.05});
 await p.waitForTimeout(500);await p.screenshot({path:out+`fx-${name}.png`});console.log(name,errs);
 await ctx.close();
}
await b.close();
