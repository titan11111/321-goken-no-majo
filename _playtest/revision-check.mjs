import {chromium,webkit} from '../../playwright-test/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const results=[],out=new URL('.',import.meta.url).pathname;
const check=(name,pass,data)=>{results.push({name,pass,data});console.log(pass?'PASS':'FAIL',name,JSON.stringify(data));};
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const b=await engine.launch();const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>__iron.snapshot().art.ready['hero-walk']);
 await p.locator('#start').tap();check(name+' opening starts',await p.evaluate(()=>__iron.snapshot().mode==='intro'));check(name+' opening full stage',await p.evaluate(()=>Math.abs(document.getElementById('game-stage').getBoundingClientRect().height-document.getElementById('game-shell').clientHeight)<2));
 await p.waitForTimeout(4300);await p.screenshot({path:out+name+'-intro.png'});
 check(name+' story visible',await p.locator('#introHead').innerText()==='人々は、\n石に変えられた。');
 check(name+' no instructions',!(await p.locator('#opening').innerText()).includes('パンチ'));
 await p.locator('#introOff').check();await p.locator('#introSkip').tap();check(name+' skip starts play',await p.evaluate(()=>__iron.snapshot().mode==='play'));check(name+' controls restored',await p.evaluate(()=>{const d=document.getElementById('control-deck').getBoundingClientRect(),s=document.getElementById('game-shell').getBoundingClientRect();return Math.abs(d.height/s.height-.25)<.01&&d.width>0}));
 await p.reload();await p.locator('#start').tap();check(name+' persisted intro off',await p.evaluate(()=>__iron.snapshot().mode==='play'));
 const rage=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(true);S.mode='test';S.training=false;T.place({rage:0});T.setEnemies([{type:'boss',x:500,z:.5,hp:1000}]);T.damageEnemy(S.enemies[0],1,0,false);const light=S.p.rage;T.place({rage:0});T.damageEnemy(S.enemies[0],1,0,true);const heavy=S.p.rage;T.place({rage:99});T.damageEnemy(S.enemies[0],1,0,true);const cap=S.p.rage;S.training=true;T.place({rage:0});T.step(.1);return{light,heavy,cap,training:S.p.rage,texts:S.floats.filter(f=>f.impact).map(f=>f.text)}});
 check(name+' rage 4x',rage.light===24&&rage.heavy===52&&rage.cap===100&&rage.training===6,rage);
 check(name+' impact lettering',rage.texts.length===3,rage.texts);
 const quake=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(false);S.mode='test';T.place({rage:100,x:110,z:.6});T.setEnemies([{type:'guard',x:170,z:.6},{type:'guard',x:250,z:.5}]);T.burst();S.quakes[0].t=.4;T.step(.01);const rage=S.p.rage;T.beginWave(1);const residual=S.quakes.length;return{rage,residual}});
 check(name+' quake cannot refill or cross waves',quake.rage===0&&quake.residual===0,quake);

 const progress=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(false);S.mode='test';const times=[];for(let w=0;w<__iron.snapshot().waveCount-1;w++){S.enemies.forEach(e=>e.hp=0);let n=0;while(S.wave===w&&n<150){T.step(1/120);n++}times.push({wave:S.wave,seconds:n/120,playerX:S.p.x,cam:S.cam})}return times});
 check(name+' all 9 transitions under 1s',progress.length===9&&progress.every((v,i)=>v.wave===i+1&&v.seconds<1),progress);
 // Real key input: sample actual rendered pose per rAF, then release and check idle.
 await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(true);S.enemies=[];S.gate.active=false;S.wave=__iron.snapshot().waveCount-1;T.place({x:300,z:.65});document.getElementById('chapter').classList.add('hidden')});
 await p.keyboard.down('ArrowRight');const frames=await p.evaluate(async()=>{const a=[];for(let n=0;n<48;n++){await new Promise(r=>requestAnimationFrame(r));const s=__iron.snapshot();a.push({x:s.player.x,frame:s.art.heroPose.walkFrame})}return a});await p.keyboard.up('ArrowRight');await p.waitForTimeout(220);check(name+' 8 walk frames',new Set(frames.map(f=>f.frame).filter(f=>f!=null)).size===8,frames.slice(0,12));check(name+' walk stops',await p.evaluate(()=>!__iron.snapshot().player.moving));
 // Capture discrete animation poses at the same position for visual inspection.
 for(const [idx,phase] of [0,2,4,6].map(i=>[i,i*Math.PI/4])){await p.evaluate(({phase})=>{const T=__iron.test,S=T.state;S.mode='test';T.place({x:S.cam+__iron.snapshot().W*.5,walk:phase,moving:true,attack:null,h:0,land:0,stun:0,dash:0,burst:0});},{phase});await p.waitForTimeout(40);await p.screenshot({path:out+name+'-walk-'+idx+'.png'})}
 check(name+' no runtime errors',errors.length===0,errors);
 await p.close();await b.close();
}
// Complete opening naturally on desktop and verify keyboard skip independently.
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});await p.goto('http://127.0.0.1:8890/?test=1');await p.locator('#start').click();await p.waitForTimeout(11500);await p.screenshot({path:out+'opening-desktop.png'});await p.waitForFunction(()=>__iron.snapshot().mode==='play',null,{timeout:12000});check('opening natural completion',true);await p.reload();await p.locator('#start').click();await p.keyboard.press('Escape');check('opening Escape skip',await p.evaluate(()=>__iron.snapshot().mode==='play'));await b.close();
await writeFile(out+'revision-check.json',JSON.stringify(results,null,2));assert(results.every(r=>r.pass),'Revision checks failed');
