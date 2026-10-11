import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:390,height:844}],['land',{width:844,height:390}]]){
const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:1.5});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));await p.locator('#practice').tap();await p.waitForTimeout(300);
await p.evaluate(()=>{const T=__iron.test,S=T.state;S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.setEnemies([{type:'guard',x:S.p.x+150,z:.6,cool:99}]);S.p.stepP=2;S.p.chainLife=1;T.attack('punch')});
await p.waitForTimeout(250);await p.screenshot({path:out+`kiai-${name}-a.png`});
await p.waitForTimeout(600);await p.evaluate(()=>{const T=__iron.test;T.place({rage:100,attack:null,stun:0});T.burst()});await p.waitForTimeout(220);await p.screenshot({path:out+`kiai-${name}-b.png`});console.log(name,errs);await ctx.close()}
await b.close();
