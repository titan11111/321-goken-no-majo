import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes','dawn'].every(k=>__iron.snapshot().art.ready[k]));
const st=()=>p.evaluate(()=>({mode:__iron.snapshot().mode,ending:!document.getElementById('ending').classList.contains('hidden'),modal:!document.getElementById('modal').classList.contains('hidden'),title:document.getElementById('endTitle').classList.contains('show'),skip:!document.getElementById('endSkip').classList.contains('hidden'),ui:document.body.classList.contains('ending')}));
const begin=async()=>{await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(false);T.beginWave(__iron.snapshot().waveCount-1);S.training=false;S.mode='play';T.finish(true)})};
await p.locator('#practice').tap();await p.waitForTimeout(300);
await begin();console.log('start',JSON.stringify(await st()));
// real-time playback of the title card
await p.evaluate(()=>__iron.test.endSeek(23.6));await p.waitForTimeout(3600);console.log('title',JSON.stringify(await st()));await p.screenshot({path:out+'end-flow-title.png'});
await p.waitForTimeout(4500);console.log('results',JSON.stringify(await st()));await p.screenshot({path:out+'end-flow-results.png'});
// retry from results
await p.getByText('もう一度').tap();await p.waitForTimeout(400);console.log('retry',JSON.stringify(await st()));
// skip button
await begin();await p.waitForTimeout(500);await p.locator('#endSkip').tap();await p.waitForTimeout(300);console.log('skipped',JSON.stringify(await st()));
await p.getByText('タイトルへ').tap();await p.waitForTimeout(300);console.log('title-screen',JSON.stringify(await st()));
console.log(errs);await b.close();
