import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8917/321-goken-no-majo/?test=1');await p.waitForFunction(()=>window.__iron);
await p.evaluate(()=>{__iron.test.start();__iron.test.endCine?.()});
async function measure(giant){
  return p.evaluate(async giant=>{const G=__iron.test.G||null;const s=()=>__iron.snapshot();
    const P=window.__iron.test.player?.()||null;return null},giant);
}
const r=await p.evaluate(async()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));const T=__iron.test;
  async function run(big){
    T.setHerbs(1);if(big){T.useHerb();await wait(900)}
    const x0=__iron.snapshot().player.x;
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'ArrowRight'}));await wait(1000);
    window.dispatchEvent(new KeyboardEvent('keyup',{code:'ArrowRight'}));
    const x1=__iron.snapshot().player.x;await wait(500);
    window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyJ'}));const t0=performance.now();
    await wait(30);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyJ'}));
    while(__iron.snapshot().player.attack&&performance.now()-t0<3000)await wait(10);
    return {walk:Math.round(x1-x0),punchMs:Math.round(performance.now()-t0),giant:__iron.snapshot().giant}}
  const normal=await run(false);const big=await run(true);return {normal,big}});
console.log(JSON.stringify({...r,errors}));await b.close();
