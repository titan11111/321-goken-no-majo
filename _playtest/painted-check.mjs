import {chromium,webkit} from '../../playwright-test/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const results=[];const output=new URL('.',import.meta.url).pathname;
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const b=await engine.launch();const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8890/?test=1');
 await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
 await p.locator('#practice').tap();await p.waitForTimeout(3200);
 const loaded=await p.evaluate(()=>__iron.snapshot());results.push({name:name+'-painted-assets-decoded',pass:loaded.art.failed.length===0,evidence:loaded.art});
 const contacts=await p.evaluate(()=>{const T=__iron.test,S=T.state;T.resetEnemies();S.mode='test';return ['punch','kick'].flatMap(kind=>[0,1,2].map(idx=>{T.place({attack:null,dash:0,stun:0,burst:0,stepP:idx,stepK:idx,chainLife:1});T.attack(kind);S.p.attack.t=S.p.attack.m.active+.015;return {kind,idx,pose:__iron.snapshot().art.heroPose.frame}}))});
 results.push({name:name+'-six-authored-contact-poses',pass:new Set(contacts.map(c=>c.pose)).size===6,evidence:contacts});
 await p.evaluate(()=>{const T=__iron.test;T.start(true);T.state.chapter=0;document.getElementById('chapter').classList.add('hidden')});
 await p.keyboard.down('KeyK');await p.waitForTimeout(800);await p.keyboard.up('KeyK');await p.screenshot({path:output+'painted-'+name+'-phone.png'});
 await p.waitForTimeout(2500);const snap=await p.evaluate(()=>__iron.snapshot());results.push({name:name+'-sustained-render',pass:snap.fps>=45&&errors.length===0,evidence:{fps:snap.fps,errors}});
 await p.goto(new URL('../index.html',import.meta.url).href);await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));results.push({name:name+'-standalone-art',pass:await p.evaluate(()=>__iron.snapshot().art.failed.length===0)});
 await b.close();
}
console.log(JSON.stringify(results,null,2));await writeFile(output+'painted-check.json',JSON.stringify({date:new Date().toISOString(),results},null,2));if(results.some(x=>!x.pass))process.exitCode=1;
