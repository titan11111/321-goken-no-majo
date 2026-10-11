import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const out=new URL('.',import.meta.url).pathname;const b=await chromium.launch();
for(const [name,vp] of [['phone',{width:390,height:844}],['land',{width:844,height:390}]]){
const ctx=await b.newContext({viewport:vp,hasTouch:true,isMobile:true,deviceScaleFactor:1.5});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));await p.locator('#practice').tap();await p.waitForTimeout(300);
await p.evaluate(()=>{const T=__iron.test,S=T.state,W=__iron.snapshot().W;S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.setEnemies([{type:'ember',x:S.p.x+W*.35,z:.4,cool:0},{type:'frost',x:S.p.x+W*.62,z:.75,cool:0}]);S.training=true});
await p.waitForTimeout(650);await p.screenshot({path:out+`chant-${name}.png`});
console.log(name,await p.evaluate(()=>__iron.test.state.enemies.map(e=>e.chant&&e.chant.text)),errs);await ctx.close()}
await b.close();
