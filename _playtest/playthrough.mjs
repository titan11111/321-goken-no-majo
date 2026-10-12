import { chromium } from '../../playwright-test/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const out=new URL('.',import.meta.url).pathname;
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.clock.install();await p.goto('http://127.0.0.1:8890/');await p.locator('#start').tap();await p.locator('#introSkip').tap();let keys=new Set(),log=[],seen=new Set(),lastWave=-1,stuck=0,lastX=0;
async function setKeys(next){for(const k of keys)if(!next.has(k))await p.keyboard.up(k);for(const k of next)if(!keys.has(k))await p.keyboard.down(k);keys=next}
for(let i=0;i<3200;i++){
 const s=await p.evaluate(()=>__iron.snapshot());
 if(s.mode==='clear'||s.mode==='over'||s.mode==='title'){log.push({tick:i,mode:s.mode,stats:s.stats,wave:s.wave,hp:s.player?.hp,time:s.time});console.log(JSON.stringify(log.at(-1)));break}
 if(s.mode==='quarry'){if(!seen.has('bonus-quarry')){seen.add('bonus-quarry');log.push({tick:i,mode:'quarry',wave:s.wave});console.log(JSON.stringify(log.at(-1)));await p.screenshot({path:out+'bonus-quarry.png'})}await setKeys(new Set(['KeyJ']));await p.clock.runFor(120);continue}
 if(s.mode==='quarryJudge'){await setKeys(new Set());await p.clock.runFor(200);continue}
 if(s.mode==='quarryClear'||s.mode==='quarryView'||s.mode==='quarryPause'){await setKeys(new Set());const btn=p.getByText(/二面へ進む|続きからプレイ|続きを彫る/);if(await btn.count())await btn.first().tap();await p.clock.runFor(200);continue}
 if(s.interlude){if(s.interlude.phase!==lastWave){lastWave=s.interlude.phase;log.push({tick:i,interlude:s.interlude});console.log(JSON.stringify(log.at(-1)));await p.screenshot({path:out+`interlude-${s.interlude.phase}.png`})}await setKeys(new Set(['KeyJ']));await p.clock.runFor(100);continue}
 if(s.wave!==lastWave){lastWave=s.wave;seen.add(s.wave);log.push({wave:s.wave,hp:s.player.hp,time:s.time,score:s.score});console.log(JSON.stringify(log.at(-1)));await p.screenshot({path:out+`wave-${s.wave}.png`})}
 const pl=s.player;let es=s.enemies.filter(e=>e.hp>0),e=es.sort((a,b)=>Math.abs(a.x-pl.x)+Math.abs(a.z-pl.z)*220-Math.abs(b.x-pl.x)-Math.abs(b.z-pl.z)*220)[0];const k=new Set();
 if(e){const dx=e.x-pl.x,dz=e.z-pl.z;if(Math.abs(dx)>65)k.add(dx>0?'KeyD':'KeyA');if(Math.abs(dz)>.065)k.add(dz>0?'KeyS':'KeyW');if(Math.abs(dx)<135&&Math.abs(dz)<.23)k.add(e.shield||e.type==='boss'?'KeyK':'KeyJ');const danger=s.hazards.find(h=>Math.abs(h.x-pl.x)<65&&Math.abs(h.z-pl.z)<.25&&h.t>h.delay-.35);if(danger&&pl.dashCD<=0){k.delete('KeyS');k.delete('KeyW');k.add(pl.z>.55?'KeyW':'KeyS');k.add('Space')}if(pl.rage>=100&&es.some(e=>Math.abs(e.x-pl.x)<180))k.add('KeyU')}
 else k.add('KeyD');
 await setKeys(k);await p.clock.runFor(100);
 if(i%300===0&&i>0)console.log(JSON.stringify({tick:i,time:s.time,wave:s.wave,hp:pl.hp,enemies:es.map(e=>({t:e.type,hp:e.hp,x:Math.round(e.x),z:e.z.toFixed(2)}))}));
}
await setKeys(new Set());const s=await p.evaluate(()=>__iron.snapshot());await p.screenshot({path:out+'playthrough-final.png'});const report={pass:s.mode==='clear',mode:s.mode,waves:[...seen],stats:s.stats,hp:s.player.hp,time:s.time,score:s.score,moves:s.moves,errors,log};await writeFile(out+'playthrough.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();process.exitCode=report.pass&&errors.length===0?0:1;
