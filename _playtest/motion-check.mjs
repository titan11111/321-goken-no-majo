import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8890/?test=1');await p.waitForFunction(()=>['hero','enemies','scenes'].every(k=>__iron.snapshot().art.ready[k]));
await p.locator('#practice').tap();await p.waitForTimeout(300);
const r={};
// 1) ジャンプボタン: 実タップで空中に上がり、着地する
await p.evaluate(()=>{const T=__iron.test,S=T.state;T.beginWave(0);S.mode='play';T.place({x:S.cam+200,z:.6,h:0,vh:0});T.setEnemies([])});
await p.locator('#jump').tap();
let peak=0;for(let i=0;i<30;i++){await p.waitForTimeout(30);peak=Math.max(peak,await p.evaluate(()=>__iron.test.state.p.h))}
r.jumpPeak=peak;await p.waitForTimeout(700);r.landed=await p.evaluate(()=>__iron.test.state.p.h===0);
// 2) キーボード I / V
for(const k of ['i','v']){await p.keyboard.down(k);await p.waitForTimeout(40);r['key_'+k]=await p.evaluate(()=>__iron.test.state.p.h>0);await p.keyboard.up(k);await p.waitForTimeout(800)}
// 3) 空中攻撃
await p.evaluate(()=>{const T=__iron.test,S=T.state;T.beginWave(0);S.mode='play';T.setEnemies([]);T.place({x:S.cam+200,z:.6,h:0,vh:0,stun:0,dash:0,burst:0,attack:null})});
await p.keyboard.down('i');await p.waitForTimeout(100);await p.keyboard.up('i');
r.hBeforeAtk=await p.evaluate(()=>__iron.test.state.p.h);
await p.keyboard.down('j');await p.waitForTimeout(40);r.airAttack=await p.evaluate(()=>{const a=__iron.test.state.p.attack;return a?{kind:a.kind,air:!!a.m?.air}:null});await p.keyboard.up('j');await p.waitForTimeout(900);
// 4) 移動の滑らかさ（rAF ごとの変位）
await p.evaluate(()=>{const T=__iron.test,S=T.state;T.beginWave(0);S.mode='play';T.setEnemies([]);T.place({x:S.cam+120,z:.5,h:0,vx:0,vz:0,attack:null,stun:0})});
await p.keyboard.down('ArrowRight');
r.motion=await p.evaluate(async()=>{const S=__iron.test.state;const out=[];let last=S.p.x;for(let i=0;i<50;i++){await new Promise(r=>requestAnimationFrame(r));out.push(S.p.x-last);last=S.p.x}return out});
await p.keyboard.up('ArrowRight');
r.decel=await p.evaluate(async()=>{const S=__iron.test.state;const out=[];let last=S.p.x;for(let i=0;i<30;i++){await new Promise(r=>requestAnimationFrame(r));out.push(S.p.x-last);last=S.p.x}return out});
const m=r.motion,st=m.slice(25);r.summary={acc:m.slice(0,8).map(v=>+v.toFixed(2)),steadyMin:+Math.min(...st).toFixed(2),steadyMax:+Math.max(...st).toFixed(2),decel:r.decel.slice(0,8).map(v=>+v.toFixed(2)),stopped:Math.abs(r.decel[29])<.05};delete r.motion;delete r.decel;
r.errors=errs;console.log(JSON.stringify(r,null,1));await b.close();
