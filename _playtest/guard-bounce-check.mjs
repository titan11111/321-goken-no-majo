import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8917/321-goken-no-majo/?test=1');
await p.waitForFunction(()=>__iron.snapshot().art.ready.hero);
const r=await p.evaluate(()=>{
  const T=__iron.test,S=T.state,step=n=>{for(let i=0;i<n;i++)T.step(1/120)};
  const setup=(opts={})=>{
    T.start(true);S.mode='test';T.resetEnemies();S.shots=[];S.p.inv=0;S.p.giant=0;S.p.hp=120;
    T.place({x:140,z:.6,face:1,attack:null,stun:0,inv:0});
    const id=T.enemy('guard',260,.6);const e=S.enemies.find(n=>n.id===id);
    if(opts.broken)e.shield=0;
    e.cool=99;e.stun=99;
    return e;
  };
  const e1=setup();const hp1=e1.hp;
  S.shots=[{id:1,x:240,z:.6,vx:400,vz:0,life:3,col:'#ffe6a7',r:10,reflected:true,dmg:70,damage:24,grade:1}];
  step(20);
  const bounced={hp:e1.hp,hp0:hp1,shield:e1.shield,shot:S.shots[0]?{reflected:S.shots[0].reflected,vx:S.shots[0].vx,life:S.shots[0].life}:null,text:S.floats.some(f=>f.text==='跳ね返し')};

  const e2=setup({broken:true});const hp2=e2.hp;
  S.shots=[{id:2,x:240,z:.6,vx:400,vz:0,life:3,col:'#ffe6a7',r:10,reflected:true,dmg:70,damage:24,grade:1}];
  step(20);
  const broken={hp:e2.hp,shield:e2.shield,shots:S.shots.length};

  setup();S.training=false;S.mode='play';
  T.place({x:180,z:.6,inv:0,hp:120,giant:0,h:0});S.p.inv=0;S.stats.damage=0;
  S.shots=[{id:3,x:200,z:.6,vx:-360,vz:0,life:2,col:'#98e7da',r:10,reflected:false,damage:24}];
  step(12);
  const returned={hp:S.p.hp,damage:S.stats.damage,playerHit:S.p.hp<120||S.stats.damage>0};

  T.start(true);S.mode='test';T.resetEnemies();S.shots=[];
  T.place({x:140,z:.6});T.enemy('ember',220,.6);
  const mage=S.enemies[0];const mhp=mage.hp;
  S.shots=[{id:4,x:200,z:.6,vx:400,vz:0,life:3,col:'#ffac72',r:10,reflected:true,dmg:70,damage:24,grade:1}];
  step(20);
  const mageHit={hp:mage.hp,lost:mhp-mage.hp};

  return {bounced,broken,returned,mageHit};
});
console.log(JSON.stringify(r));
assert(r.bounced.hp===r.bounced.hp0&&r.bounced.shield===1&&r.bounced.shot&&r.bounced.shot.reflected===false&&r.bounced.shot.vx<0&&r.bounced.text,'guard bounces while shielded');
assert(r.broken.hp<112&&r.broken.shots===0,'broken shield takes the shot');
assert(r.returned.playerHit,'bounced shot can hit the player');
assert(r.mageHit.lost>0,'mages still eat reflected shots');
assert(errors.length===0,errors.join('\n'));
await b.close();
console.log('PASS guard bounce');
