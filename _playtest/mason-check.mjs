import {chromium,webkit} from '../../playwright-test/node_modules/playwright/index.mjs';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const out=new URL('.',import.meta.url).pathname,R=[];const check=(name,v,data)=>{R.push({name,pass:!!v,data});console.log(v?'PASS':'FAIL',name,JSON.stringify(data??''));assert(v,name)};
const snap=p=>p.evaluate(()=>__iron.snapshot());
for(const [name,engine,viewport] of [['chromium',chromium,{width:390,height:844}],['webkit',webkit,{width:390,height:844}],['chromium-land',chromium,{width:844,height:390}]]){
 const b=await engine.launch({headless:true});try{const p=await b.newPage({viewport,hasTouch:true,isMobile:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8917/321-goken-no-majo/?test=1');await p.waitForFunction(()=>__iron.snapshot().art.ready.hero&&__iron.snapshot().art.ready.dawn);
 const shot=f=>p.screenshot({path:out+name+'-'+f+'.png'});
 // Stonework: normal attacks carve by damage, then three judges.
 await p.evaluate(()=>localStorage.setItem('tg.321.herb','0'));await p.locator('#practice').tap();check(name+' stonework starts',(await snap(p)).mode==='quarry');
 check(name+' no hammer/chisel labels',await p.evaluate(()=>document.querySelector('#punch small').textContent==='パンチ'&&document.querySelector('#kick small').textContent==='キック'));
 await p.keyboard.press('j');await p.waitForTimeout(150);let q=(await snap(p)).quarry;check(name+' jab carves top row by damage',q.cells[0]>0&&q.cells[0]<40&&q.cells[6]===0,q.cells);
 await p.keyboard.press('k');await p.waitForTimeout(200);q=(await snap(p)).quarry;check(name+' kick carves bottom row',q.cells[6]>0,q.cells);
 await p.keyboard.down('j');await p.waitForTimeout(1300);await p.keyboard.up('j');await p.waitForTimeout(400);await shot('mason-mid');q=(await snap(p)).quarry;check(name+' held punch chains carve rows 0-1',q.cells[0]>0&&q.cells[3]>0&&q.moves.includes('両手パンチ'),q);
 // Finish deliberately: kicks for the bottom, punches for the top, until done.
 for(let i=0;i<80;i++){const s=await snap(p);if(s.mode!=='quarry'||s.quarry.progress>=1)break;const c=s.quarry.cells,low=c.slice(6).some(v=>v<40)||c.slice(3,6).some(v=>v<40)&&c.slice(0,3).every(v=>v>=40);await p.keyboard.press(low?'k':'j');await p.waitForTimeout(260)}
 await p.waitForFunction(()=>__iron.snapshot().mode==='quarryJudge',null,{timeout:8000});q=(await snap(p)).quarry;check(name+' carving complete',q.progress===1,q);
 await p.waitForTimeout(2900);await shot('judges-cards');await p.waitForFunction(()=>__iron.snapshot().quarry.judge.verdict,null,{timeout:6000});await p.waitForTimeout(500);await shot('judges-verdict');
 q=(await snap(p)).quarry;const herbsAfter=(await snap(p)).herbs;check(name+' herb only when all three ≥8',(q.judge.pass?herbsAfter===1:herbsAfter===0)&&q.judge.pass===q.judge.scores.every(v=>v>=8),{scores:q.judge.scores,herbs:herbsAfter,seconds:q.seconds,over:q.over,moves:q.moves});
 await p.waitForFunction(()=>__iron.snapshot().mode==='quarryClear',null,{timeout:4000});await shot('mason-result');
 // Giant herb in combat.
 const g=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(false);T.setHerbs(1);return{used:T.useHerb(),fx:!!S.growFx,mode:S.mode}});check(name+' herb starts grow animation',g.used&&g.fx,g);
 await p.waitForTimeout(250);await shot('grow-mid');await p.waitForTimeout(900);let s=await snap(p);check(name+' giant active 30s',s.giant>29&&s.giant<=30,{giant:s.giant});
 await p.evaluate(()=>{for(const e of __iron.test.state.enemies){e.cool=99;e.stun=99}});await shot('giant');
 const refl=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.resetEnemies();T.enemy('frost',S.p.x+900,.2);const hp=S.p.hp,r0=S.stats.reflections;S.shots=[];S.p.inv=0;T.shot({x:S.p.x+60});for(let i=0;i<40;i++)T.step(1/120);return{hp,after:S.p.hp,reflections:S.stats.reflections-r0,back:S.shots.filter(x=>x.reflected).map(x=>x.vx)}});check(name+' giant reflects magic',refl.after===refl.hp&&refl.reflections===1&&refl.back[0]>0,refl);
 const haz=await p.evaluate(()=>{const S=__iron.test.state,hp=S.p.hp;S.hazards=[{x:S.p.x,z:S.p.z,kind:'thunder',col:'#ffe18a',t:0,delay:.05,r:60,damage:30}];S.p.inv=0;for(let i=0;i<30;i++)__iron.test.step(1/120);return{hp,after:S.p.hp}});check(name+' giant nullifies ground magic',haz.after===haz.hp,haz);
 await p.evaluate(()=>{__iron.test.state.p.giant=.02});await p.waitForTimeout(150);s=await snap(p);check(name+' shrink animation after timeout',s.giant===0&&await p.evaluate(()=>!!__iron.test.state.growFx&&!__iron.test.state.growFx.grow));await p.waitForTimeout(1100);check(name+' back to normal size',await p.evaluate(()=>!__iron.test.state.growFx));
 // Enemy defence +50%.
 const def=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.resetEnemies();const id=T.enemy('frost',S.p.x+60,S.p.z),e=S.enemies.find(n=>n.id===id),hp=e.hp;T.damageEnemy(e,30,0,false,false,false);return hp-e.hp});check(name+' enemy defence 1.5x (30 -> 20)',def===20,{def});
 // Bolt SFX hook: shots now trigger the bolt sound path without errors.
 // Boss entrance.
 await p.evaluate(()=>{const T=__iron.test;T.start(false);T.beginWave(31)});check(name+' boss cinematic starts',(await snap(p)).cine);await p.waitForTimeout(1000);await shot('boss-entry-1');await p.waitForTimeout(1500);await shot('boss-entry-2');await p.waitForFunction(()=>!__iron.snapshot().cine,null,{timeout:4000});check(name+' cinematic ends into fight',(await snap(p)).mode==='play');
 await p.evaluate(()=>{const T=__iron.test;T.beginWave(31)});await p.waitForTimeout(900);await p.keyboard.press('j');await p.waitForTimeout(80);check(name+' cinematic skippable',!(await snap(p)).cine);
 // Boss defeat.
 await p.evaluate(()=>{const S=__iron.test.state,e=S.enemies.find(n=>n.type==='boss'&&!n.clone);e.hp=5;e.armor=0;e.cast=0;__iron.test.damageEnemy(e,60,10,true)});check(name+' boss death sequence',!!(await snap(p)).bossDeath);await p.waitForTimeout(1500);await shot('boss-death-1');await p.waitForTimeout(2300);await shot('boss-death-2');
 await p.waitForFunction(()=>__iron.snapshot().mode==='clear',null,{timeout:6000});check(name+' ending reached after death sequence',true);
 await p.evaluate(()=>__iron.test.endSeek(12));await p.waitForTimeout(60);await shot('ending-12');await p.evaluate(()=>__iron.test.endSeek(20));await p.waitForTimeout(60);await shot('ending-20');
 check(name+' ending BGM bed requested once',await p.evaluate(()=>__iron.snapshot().music.on));
 check(name+' runtime errors zero',errors.length===0,errors);await p.close();}finally{await b.close()}
}
await fs.writeFile(out+'mason-check.json',JSON.stringify(R,null,2));console.log('ALL PASS',R.length);
