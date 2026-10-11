import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1.5});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));await p.locator('#practice').tap();await p.waitForTimeout(300);
await p.evaluate(()=>{const T=__iron.test,S=T.state,W=__iron.snapshot().W;S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.setEnemies([{type:'guard',x:S.p.x+W*.38,z:.62,cool:.3,hp:60},{type:'ember',x:S.p.x+W*.62,z:.4,cool:.05,hp:30},{type:'frost',x:S.p.x+W*.8,z:.8,cool:9}]);S.training=true;S.p.x-=60});
await p.waitForTimeout(500);await p.screenshot({path:out+'guard-v1.png'});console.log(errs);await b.close();
