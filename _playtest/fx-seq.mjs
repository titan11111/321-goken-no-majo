import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
await p.locator('#practice').tap();await p.waitForTimeout(300);
await p.evaluate(()=>{const T=__iron.test,S=T.state;T.beginWave(5);S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.place({x:S.cam+30,z:.55,hp:120,inv:99});
 T.setEnemies([{type:'boss',x:S.cam+300,z:.5,cool:.2}]);});
for(let i=0;i<10;i++){await p.waitForTimeout(170);await p.screenshot({path:out+`seq-${i}.png`,clip:{x:0,y:150,width:390,height:330}})}
await b.close();
