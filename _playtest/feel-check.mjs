import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=new URL('.',import.meta.url).pathname,R=[];
const check=(name,v,data)=>{R.push({name,pass:!!v,data});console.log(v?'PASS':'FAIL',name,JSON.stringify(data??''));assert(v,name)};
const b=await chromium.launch({headless:true});
try{
 const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8917/321-goken-no-majo/?test=1');
 await p.waitForFunction(()=>window.__iron?.snapshot()?.art?.ready?.hero);
 const text=await p.locator('#title').innerText();
 check('title has hook only',text.includes('闘え！')&&text.includes('石工ガルド')&&!text.includes('己の身体のみで')&&!text.includes('石化命令'),text);
 await p.waitForTimeout(1600);await p.screenshot({path:out+'title-feel-phone.png'});
 await p.waitForTimeout(2200);await p.screenshot({path:out+'title-feel-phone-2.png'});
 const g=await p.evaluate(()=>__iron.snapshot().giantMove);
 check('giant move 0.42',g===.42,{g});
 const bounced=await p.evaluate(()=>{
  const T=__iron.test,S=T.state;T.start(false);T.resetEnemies();S.p.giant=0;S.p.inv=9;
  const id=T.enemy('guard',S.p.x+90,S.p.z),e=S.enemies.find(n=>n.id===id);
  e.shield=1;e.cool=99;e.stun=0;
  S.shots=[{id:99,x:e.x-30,z:e.z,vx:420,vz:0,life:3,col:'#ffac72',r:10,reflected:true,dmg:55,grade:1}];
  for(let i=0;i<50;i++)T.step(1/120);
  const s=S.shots[0];
  return{hp:e.hp,max:e.maxHP,vx:s&&s.vx,back:!!(s&&s.vx<0),guardBack:!!(s&&s.guardBack)};
 });
 check('guard returns magic',bounced.back&&bounced.guardBack&&bounced.hp===bounced.max,bounced);
 const own=await p.evaluate(()=>{
  const T=__iron.test,S=T.state;T.resetEnemies();S.p.inv=9;
  const id=T.enemy('guard',S.p.x+140,S.p.z),e=S.enemies.find(n=>n.id===id);
  e.shield=1;e.cool=99;
  S.shots=[{id:100,x:e.x-28,z:e.z,vx:-220,vz:0,life:3,col:'#ffac72',r:10,reflected:false,damage:24}];
  for(let i=0;i<20;i++)T.step(1/120);
  const s=S.shots[0];
  return{stillOut:!!(s&&s.vx<0&&!s.guardBack),vx:s&&s.vx};
 });
 check('guard does not bounce own outgoing shot',own.stillOut,own);
 check('no runtime errors',errors.length===0,errors);
 await p.close();
}finally{await b.close()}
await fs.writeFile(out+'feel-check.json',JSON.stringify(R,null,2));
console.log('ALL PASS',R.length);
