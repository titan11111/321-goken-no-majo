import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
await p.locator('#practice').tap();await p.waitForTimeout(400);
await p.evaluate(()=>{const T=__iron.test,S=T.state,W=__iron.snapshot().W;T.beginWave(1);S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.place({x:S.cam+40,z:.6});
 T.setEnemies([{type:'ember',x:S.cam+W*.8,z:.3},{type:'frost',x:S.cam+W*.8,z:.9}]);S.enemies.forEach(e=>e.cool=99);
 T.shot({x:S.cam+W*.35,z:.6,vx:-1,vz:0,life:99,r:10,col:'#ffac72'});T.shot({x:S.cam+W*.62,z:.85,vx:-1,vz:0,life:99,r:10,col:'#8edce8'});S.mode='test'});
await p.waitForTimeout(400);await p.screenshot({path:out+'fx-close.png',clip:{x:0,y:200,width:390,height:330}});await b.close();
