// Usage: node perf-profile.mjs [label] [cpuThrottle]
// Heavy scene (boss + extra casters + shots + particles) under CPU throttling; reports frame times and top self-time functions.
import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const label=process.argv[2]||'run',throttle=+process.argv[3]||4,out=new URL('.',import.meta.url).pathname;
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});
const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
const t0=Date.now();await p.goto('http://127.0.0.1:8890/?test=1');
await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]),null,{timeout:60000});
const loadMS=Date.now()-t0;
const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
await p.locator('#practice').tap();await p.waitForTimeout(500);
await p.evaluate(()=>{const T=__iron.test,S=T.state;T.beginWave(__iron.snapshot().waveCount-1);S.chapter=0;document.getElementById('chapter').classList.add('hidden');T.place({hp:120});T.setEnemies([{type:'boss',x:S.cam+700,z:.5},{type:'ember',x:S.cam+560,z:.25},{type:'frost',x:S.cam+520,z:.8},{type:'guard',x:S.cam+380,z:.55}]);
 for(let i=0;i<6;i++)T.shot({x:S.cam+300+i*60,z:.2+i*.12,vx:-5,vz:0,life:99,r:i%2?13:10,col:i%2?'#8edce8':'#ffac72'});S.enemies.forEach(e=>{e.cast=99;e.castTotal=100});});
await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
// sustained button mashing + movement
await p.keyboard.down('KeyD');
const frames=await p.evaluate(()=>new Promise(res=>{const a=[];let last=performance.now(),end=last+6000;const T=__iron.test,S=T.state;let n=0;function f(t){a.push(t-last);last=t;n++;if(n%20===0){T.state.p.hp=120;for(const e of S.enemies)if(e.hp>0){e.hp=e.maxHP}}if(n%25===0)T.shot({x:S.p.x+260,z:Math.random()*.7+.2,vx:-240,vz:0,life:3,col:'#ffac72',r:10});if(t<end)requestAnimationFrame(f);else res(a)}requestAnimationFrame(f)}));
await p.keyboard.up('KeyD');
const {profile}=await cdp.send('Profiler.stop');
const self=new Map();const nodes=new Map(profile.nodes.map(n=>[n.id,n]));const dt=profile.timeDeltas;profile.samples.forEach((id,i)=>{const n=nodes.get(id),k=n.callFrame.functionName+':'+n.callFrame.lineNumber+':'+n.callFrame.columnNumber;self.set(k,(self.get(k)||0)+(dt[i]||0))});
const top=[...self.entries()].sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>[k,Math.round(v/1000)+'ms']);
const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
const r={label,throttle,loadMS,frames:frames.length,meanMS:+mean.toFixed(2),p95:+sorted[Math.floor(sorted.length*.95)].toFixed(1),max:+sorted.at(-1).toFixed(1),over50:frames.filter(x=>x>50).length,fpsAvg:+(1000/mean).toFixed(1),errors,top};
console.log(JSON.stringify(r,null,1));await writeFile(out+'perf-'+label+'.json',JSON.stringify(r,null,1));await b.close();
