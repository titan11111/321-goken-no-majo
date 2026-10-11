import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1.5});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));await p.locator('#practice').tap();await p.waitForTimeout(300);
for(const [name,d] of [['ok',100],['great',175],['perfect',156]]){
 await p.evaluate(d=>{const T=__iron.test,S=T.state;T.setEnemies([{type:'guard',x:S.p.x-300,z:.6,cool:99}]);S.mode='test';T.place({face:1,stepP:2,chainLife:1,attack:null,stun:0,z:.6,inv:0});T.shot({x:S.p.x+d,z:.6});T.attack('punch');for(let i=0;i<14;i++)T.step(1/120);S.mode='pause'},d);
 await p.waitForTimeout(100);await p.screenshot({path:out+`reflect-${name}.png`});await p.evaluate(()=>__iron.test.setMode('play'));await p.waitForTimeout(200)}
await b.close();
