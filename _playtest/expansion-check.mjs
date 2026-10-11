import {chromium,webkit} from '../../playwright-test/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('.',import.meta.url).pathname,results=[];
function check(name,pass,evidence){results.push({name,pass,evidence});console.log(pass?'PASS':'FAIL',name,JSON.stringify(evidence))}
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const b=await engine.launch();const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','enemies-women','scenes','scenes-journey','hero-walk'].every(k=>__iron.snapshot().art.ready[k]));await p.locator('#practice').tap();
 const hero=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(true);S.enemies=[];T.place({x:150,z:.6,inv:0});T.hurt(24,300);const initial={...S.p.react,pose:__iron.snapshot().art.heroPose};const ref=S.p.react;T.hurt(24,0);const immune=ref===S.p.react;S.mode='test';for(let n=0;n<26;n++)T.step(1/120);const recoveredControl=S.p.stun===0&&!!S.p.react;T.attack('punch');const cancel=S.p.react===null&&!!S.p.attack;S.mode='play';T.place({inv:0,attack:null});T.hurt(35,0);const otherDir=S.p.react.dir;S.mode='test';for(let n=0;n<70;n++)T.step(1/120);return{initial,immune,recoveredControl,cancel,otherDir,ends:S.p.react===null}});
 check(name+' hero recoil direction and pose',hero.initial.dir===-1&&hero.initial.pose.frame===28&&hero.otherDir===1,hero);
 check(name+' no extra control lock or repeated damage',hero.immune&&hero.recoveredControl&&hero.cancel&&hero.ends);
 const enemies=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(true);S.mode='test';T.place({face:1});return ['ember','frost','guard','boss','ignia','selene','vera'].map(kind=>{S.enemies=[];T.enemy(kind,250,.6);const e=S.enemies[0];T.damageEnemy(e,1,20,true);return{kind,type:e.type,character:e.character,react:e.react,pose:__iron.snapshot().art.enemyPoses[0]}})});
 check(name+' all 7 enemy appearances react',enemies.every(e=>e.react?.dir===1&&e.pose.hurt),enemies);
 check(name+' women retain 3 combat roles',enemies.slice(4).map(e=>e.type).join(',')==='ember,frost,guard');
 const armored=await p.evaluate(()=>{const T=__iron.test,S=T.state;S.enemies=[];T.enemy('boss',250,.6);const e=S.enemies[0];e.cast=1;e.castTotal=1;e.armor=2;T.damageEnemy(e,1,20);return{cast:e.cast,stun:e.stun,react:e.react,pose:__iron.snapshot().art.enemyPoses[0]}});
 check(name+' armored boss visibly reacts but keeps chant',armored.cast>0&&armored.stun===0&&armored.react.power>0&&armored.pose.casting,armored);
 const respawn=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(true);S.mode='test';S.enemies=[];T.enemy('selene',250,.6);T.damageEnemy(S.enemies[0],999,0,true);for(let n=0;n<220;n++)T.step(1/120);const e=S.enemies[0];return{character:e.character,hp:e.hp,react:e.react}});
 check(name+' practice respawns same female character',respawn.character==='selene'&&respawn.hp>0&&respawn.react===null,respawn);
 // Inspect all route data including final boss and female placement.
 const route=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.start(false);S.mode='test';const a=[];for(let w=0;w<__iron.snapshot().waveCount;w++){T.beginWave(w);const q=__iron.snapshot();a.push({wave:w,area:q.area,name:q.areaName,scene:q.scene,enemies:q.enemies.map(e=>e.character||e.type)})}return a});
 check(name+' 8 distinct scenes in 10 fights',route.length===10&&new Set(route.map(a=>a.area)).size===8&&new Set(route.map(a=>a.scene.asset+':'+a.scene.frame)).size===8,route);
 const chars=route.flatMap(a=>a.enemies);check(name+' women appear throughout journey',chars.filter(x=>['ignia','selene','vera'].includes(x)).length>=12&&['ignia','selene','vera'].every(x=>chars.includes(x)),chars);
 check(name+' boss only at journey end',route.slice(0,-1).every(a=>!a.enemies.includes('boss'))&&route.at(-1).enemies.join()==='boss');
 // Screenshot each new environment with normal population, clear chapter text.
 for(const w of [0,3,5,6]){await p.evaluate(w=>{const T=__iron.test,S=T.state;T.start(false);S.mode='test';T.beginWave(w);S.chapter=0;S.noticeLife=0;document.getElementById('chapter').classList.add('hidden');document.getElementById('notice').classList.remove('show');S.enemies.forEach(e=>e.appear=0)},w);await p.waitForTimeout(120);await p.screenshot({path:out+name+'-scene-'+w+'.png'})}
 // Take visible reaction sequence with identical frame state / exposure for comparison.
 await p.setViewportSize({width:1120,height:800});await p.waitForTimeout(120);
 for(const kind of ['ember','ignia','selene','vera']){
  await p.evaluate(kind=>{const T=__iron.test,S=T.state;T.start(true);S.mode='test';S.chapter=0;document.getElementById('chapter').classList.add('hidden');document.getElementById('notice').classList.remove('show');S.enemies=[];T.place({x:280,z:.7,face:1,inv:0});T.enemy(kind,600,.7);S.enemies[0].face=-1;},kind);
  await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await p.screenshot({path:out+name+'-'+kind+'-idle.png'});
  await p.evaluate(()=>{const T=__iron.test,S=T.state;T.damageEnemy(S.enemies[0],1,0,true);S.enemies[0].react.t=.09;S.enemies[0].flash=0;S.mode='play';T.hurt(35,600);S.p.react.t=.09;S.p.inv=0;S.mode='test';S.flash=0;S.shake=0;S.floats=[];S.particles=[]});await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await p.screenshot({path:out+name+'-'+kind+'-hurt.png'});
 }
 check(name+' no runtime errors',errs.length===0,errs);await b.close();
}
await writeFile(out+'expansion-check.json',JSON.stringify(results,null,2));assert(results.every(r=>r.pass),'Expansion verification failed');
