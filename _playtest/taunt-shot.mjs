import { chromium } from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;
const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
await p.goto('http://127.0.0.1:8901/?test=1');
await p.locator('#start').tap();
const skip=p.locator('#introSkip'); if(await skip.count()) await skip.tap();
await p.waitForFunction(()=>window.__iron?.test);
await p.evaluate(()=>{
  const T=__iron.test; T.start(false); T.beginWave(31); if(T.state.cine)T.endCine();
  const boss=T.state.enemies.find(e=>e.type==='boss');
  if(boss){boss.armor=0;boss.cast=0;for(let i=0;i<8;i++)T.damageEnemy(boss,9999,80,true)}
  if(T.state.bossDeath)T.state.bossDeath.t=4.2; T.step(0.05);
  T.skipInterlude();
  for(let i=0;i<10;i++)T.step(0.2);
});
const s=await p.evaluate(()=>__iron.snapshot());
console.log(JSON.stringify({mode:s.mode,interlude:s.interlude}));
await p.screenshot({path:out+'interlude-taunt.png'});
await b.close();
