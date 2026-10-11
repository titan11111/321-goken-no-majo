// Dev tool: dumps silhouette bounds that the pre-bake runtime algorithm computed at every page load
// (getImageData + flood fill on the main thread) into src/art-baked.json.
// Usage: serve folder on :8890, run against a build that still contains the runtime measurement.
import {chromium} from '../../playwright-test/node_modules/playwright/index.mjs';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch();const p=await b.newPage();await p.goto('http://127.0.0.1:8890/');
await p.waitForFunction(()=>['hero','enemies'].every(k=>Art.ready[k]),null,{timeout:60000});
const data=await p.evaluate(()=>({heroFrames:Art.heroFrames,bounds:{hero:Art.bounds.hero,enemies:Art.bounds.enemies}}));
await writeFile(new URL('../src/art-baked.json',import.meta.url).pathname,JSON.stringify(data));
console.log('frames',data.heroFrames.length,'hero bounds',data.bounds.hero.length,'enemy bounds',data.bounds.enemies.length);await b.close();
