import { chromium } from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;
const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8901/?test=1');
await p.locator('#start').tap();
const skip=p.locator('#introSkip');
if(await skip.count())await skip.tap();
await p.waitForFunction(()=>window.__iron?.test,null,{timeout:8000});
async function snap(name,wave){
  await p.evaluate(w=>{const T=__iron.test;T.start(false);T.beginWave(w);T.place({x:__iron.snapshot().cam+180,z:.64,h:0,vh:0})},wave);
  await p.waitForTimeout(80);
  await p.screenshot({path:out+name+'.png'});
  const s=await p.evaluate(()=>__iron.snapshot());
  console.log(JSON.stringify({name,area:s.areaName,wave:s.wave,ready:s.art?.ready,errors}));
}
await snap('floor-thunder',32);
await snap('floor-forge',36);
await snap('floor-sanctum',40);
await snap('floor-heart',44);

await p.evaluate(()=>{const T=__iron.test;T.start(false);T.beginWave(31);if(T.state.cine)T.endCine();const boss=T.state.enemies.find(e=>e.type==='boss');if(boss){boss.armor=0;boss.cast=0;for(let i=0;i<8;i++)T.damageEnemy(boss,9999,80,true)}if(T.state.bossDeath)T.state.bossDeath.t=4.2;T.step(0.05)});
const afterKill=await p.evaluate(()=>__iron.snapshot());
console.log('afterKill',{wave:afterKill.wave,interlude:afterKill.interlude,bossDeath:!!afterKill.bossDeath,mode:afterKill.mode});
await p.screenshot({path:out+'interlude-cheer.png'});
for(let i=0;i<8;i++)await p.evaluate(()=>{__iron.test.skipInterlude();__iron.test.step(0.2)});
const taunt=await p.evaluate(()=>__iron.snapshot());
console.log('taunt',taunt.interlude,taunt.mode);
await p.evaluate(()=>{for(let i=0;i<12;i++)__iron.test.step(0.16)});
await p.screenshot({path:out+'interlude-taunt.png'});
for(let i=0;i<10;i++)await p.evaluate(()=>{__iron.test.skipInterlude();__iron.test.step(0.15)});
const quarry=await p.evaluate(()=>__iron.snapshot());
console.log('quarry',quarry.mode,quarry.quarry&&{progress:quarry.quarry.progress});
await p.screenshot({path:out+'bonus-quarry-start.png'});
const final=await p.evaluate(()=>__iron.snapshot());
console.log(JSON.stringify({finalMode:final.mode,wave:final.wave,interlude:final.interlude,errors}));
await b.close();
process.exitCode=errors.length?1:0;
