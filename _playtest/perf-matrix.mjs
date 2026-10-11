import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const url=process.argv[2]||'http://127.0.0.1:8890/?test=1',throttle=+process.argv[3]||1;
const b=await chromium.launch();
for(const [label,q] of [['auto','auto'],['high','high'],['low','low']]){
 const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});
 await ctx.addInitScript(v=>{try{localStorage.setItem('tg.321.quality',v)}catch{}},q);
 const p=await ctx.newPage();await p.goto(url);await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
 await p.locator('#practice').tap();await p.waitForTimeout(500);
 await p.evaluate((ns)=>{window.__noshot=ns;const T=__iron.test,S=T.state;T.beginWave(__iron.snapshot().waveCount-1);S.chapter=0;T.place({hp:120});T.setEnemies([{type:'boss',x:S.cam+700,z:.5},{type:'ember',x:S.cam+560,z:.25},{type:'frost',x:S.cam+520,z:.8}]);for(let i=0;i<(window.__noshot?0:6);i++)T.shot({x:S.cam+300+i*60,z:.2+i*.12,vx:-5,vz:0,life:99,r:i%2?13:10,col:i%2?'#8edce8':'#ffac72'});S.enemies.forEach(e=>{e.cast=99;e.castTotal=100})},!!process.env.NOSHOT);
 const r=await p.evaluate(()=>new Promise(res=>{const a=[];let last=performance.now(),end=last+4000;function f(t){a.push(t-last);last=t;if(t<end)requestAnimationFrame(f);else res(a)}requestAnimationFrame(f)}));
 const snap=await p.evaluate(()=>{const s=__iron.snapshot();return{dpr:s.dpr,quality:s.quality}});
 const m=r.slice(5).reduce((a,c)=>a+c,0)/(r.length-5);console.log(label,snap,'mean ms',m.toFixed(1),'fps',(1000/m).toFixed(1));
 await ctx.close();
}
await b.close();
