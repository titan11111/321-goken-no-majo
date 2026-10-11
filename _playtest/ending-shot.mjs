import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
const which=process.argv[2]||'phone';const vps={phone:{width:390,height:844},land:{width:844,height:390}};
const ctx=await b.newContext({viewport:vps[which],hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes','dawn'].every(k=>__iron.snapshot().art.ready[k]));
await p.locator('#practice').tap();await p.waitForTimeout(300);
await p.evaluate(()=>{const T=__iron.test,S=T.state;T.beginWave(__iron.snapshot().waveCount-1);S.training=false;S.mode='play';T.finish(true)});
const times=(process.argv[3]||'0.8,2.6,7,12,17,21.5,25.5,32').split(',').map(Number);
for(const t of times){await p.evaluate(t=>__iron.test.endSeek(t),t);await p.waitForTimeout(260);await p.screenshot({path:out+`end-${which}-${String(t).replace('.','_')}.png`})}
console.log(which,errs,await p.evaluate(()=>__iron.snapshot().mode));await b.close();
