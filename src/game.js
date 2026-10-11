(()=>{
'use strict';
const {clamp,lerp,depthScale,sameLane,nearest,WaveGate}=Belt;
const canvas=$('screen'),ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
let W=960,H=560,DPR=1,viewScale=1,fxs=1,quality=Settings.quality==='low'?.5:1;
const rnd=(a,b)=>a+Math.random()*(b-a),TAU=Math.PI*2;
const Sound=window.Sound=(()=>{
 let ac,master,noise;
 function unlock(){Music.unlock();try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});master=ac.createGain();master.connect(ac.destination);noise=ac.createBuffer(1,ac.sampleRate*.7,ac.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;sync()}if(ac.state!=='running')ac.resume().catch(()=>{})}catch{}}
 function sync(){Music.sync();if(master)master.gain.setTargetAtTime(Settings.mute?0:.38,ac.currentTime,.015)}
 function tone(f,d=.12,type='sine',v=.2,end=0,delay=0){if(!ac||ac.state!=='running')return;const t=ac.currentTime+Math.max(0,delay),o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(15,end),t+d);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(Math.max(.002,v),t+.006);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
 function rush(d=.12,v=.2,f=1600,delay=0){if(!ac||ac.state!=='running')return;const t=ac.currentTime+Math.max(0,delay),s=ac.createBufferSource(),g=ac.createGain(),fil=ac.createBiquadFilter();s.buffer=noise;fil.type='lowpass';fil.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fil);fil.connect(g);g.connect(master);s.start(t);s.stop(t+d+.01);s.onended=()=>{s.disconnect();fil.disconnect();g.disconnect()}}
 function fx(k){if(k==='punch'){rush(.065,.11,1800);tone(175,.08,'triangle',.09,80)}if(k==='kick')rush(.14,.18,2100);if(k==='hit'){rush(.075,.42,1900);tone(125,.12,'sine',.65,42)}if(k==='heavy'){rush(.23,.5,950);tone(83,.27,'sine',.75,29)}if(k==='dash')rush(.13,.12,3500);if(k==='magic'){tone(500,.28,'sine',.15,940);tone(251,.3,'triangle',.07,610)}if(k==='jump'){tone(300,.12,'sine',.14,620);rush(.05,.08,2400)}if(k==='land'){tone(95,.1,'sine',.3,45);rush(.06,.14,900)}if(k==='shoot'){tone(320,.22,'sawtooth',.12,90);rush(.2,.22,1400)}if(k==='hurt'){tone(160,.19,'sawtooth',.13,65);rush(.18,.24,700)}if(k==='break'){rush(.3,.35,4500);[523,784,1046].forEach((f,i)=>tone(f,.23,'triangle',.12,0,i*.035))}if(k==='quake'){tone(52,.9,'sine',.95,22);tone(104,.5,'triangle',.45,30);tone(1480,.6,'triangle',.07,320);rush(.6,.7,520);rush(.35,.4,2600,.12);[523,784,1046,1568].forEach((f,i)=>tone(f,.3,'triangle',.09,0,.12+i*.05))}if(k==='reflect1'){rush(.12,.35,5200);[784,1175,1568].forEach((f,i)=>tone(f,.22,'triangle',.13,0,i*.045));tone(150,.18,'sine',.5,60)}if(k==='reflect2'){rush(.22,.5,6500);tone(74,.4,'sine',.9,28);[523,659,784,1046,1568,2093].forEach((f,i)=>tone(f,.4,'triangle',.14,0,i*.04));tone(2637,.5,'sine',.07,0,.24)}if(k==='chant'){rush(.55,.1,380);tone(98,.55,'sawtooth',.045,78);tone(147,.5,'triangle',.03,110,.08)}if(k==='win')[293,392,440,587,784].forEach((f,i)=>tone(f,.65,'triangle',.2,0,i*.15));if(k==='ui')tone(680,.03,'sine',.055)}
 // Shout voice: sawtooth glottal source through three formant band-pass filters (vowel shapes), pitch glide, light saturation.
 const VOW={a:[730,1090,2440],o:[570,840,2410],u:[300,870,2240],i:[270,2290,3010],e:[530,1840,2480]};
 const VOICES={ya:{f:[190,150],v:.55,seg:[['i',.03],['a',.14]],c:null},ha:{f:[170,140],v:.5,seg:[['a',.12]],c:['h',.05]},sei:{f:[185,165],v:.5,seg:[['e',.06],['i',.1]],c:['s',.06]},toh:{f:[200,260],v:.5,seg:[['o',.05],['u',.13]],c:['t',.03]},yaa:{f:[210,115],v:.7,seg:[['i',.04],['a',.36]],c:null,vib:1},uo:{f:[135,88],v:.85,seg:[['u',.13],['o',.5]],c:null,vib:1},uoo:{f:[125,68],v:1,seg:[['u',.2],['o',1]],c:null,vib:1}};
 let curve=null;
 function buildVoice(ctx,dest,k,t){const V=VOICES[k];if(!V)return 0;const total=V.seg.reduce((a,x)=>a+x[1],0)+.04;
  if(!curve){curve=new Float32Array(257);for(let i=0;i<257;i++){const x=i/128-1;curve[i]=Math.tanh(x*2.2)}}
  const src=ctx.createOscillator(),mix=ctx.createGain(),ws=ctx.createWaveShaper(),env=ctx.createGain(),nodes=[src,mix,ws,env];src.type='sawtooth';src.frequency.setValueAtTime(V.f[0],t);src.frequency.exponentialRampToValueAtTime(V.f[1],t+total);
  if(V.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=6;lg.gain.value=V.f[0]*.025;l.connect(lg);lg.connect(src.frequency);l.start(t);l.stop(t+total+.05);nodes.push(l,lg)}
  const fils=[];[7,9,10].forEach((q,i)=>{const f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='bandpass';f.Q.value=q;g.gain.value=[1,.8,.4][i];src.connect(f);f.connect(g);g.connect(mix);fils.push(f);nodes.push(f,g)});
  let tt=t;V.seg.forEach(([v,d],j)=>{const F=VOW[v];fils.forEach((f,i)=>{if(j===0)f.frequency.setValueAtTime(F[i],t);else f.frequency.linearRampToValueAtTime(F[i],tt+.05)});tt+=d});
  mix.gain.value=4.2;ws.curve=curve;env.gain.setValueAtTime(.001,t);env.gain.exponentialRampToValueAtTime(V.v,t+.02);env.gain.setValueAtTime(V.v,t+total*.55);env.gain.exponentialRampToValueAtTime(.001,t+total);
  src.connect(fils[0]);mix.connect(ws);ws.connect(env);env.connect(dest);src.start(t);src.stop(t+total+.05);src.onended=()=>nodes.forEach(n=>{try{n.disconnect()}catch{}});return total}
 function voice(k){if(!ac||ac.state!=='running')return;const V=VOICES[k];if(!V)return;if(V.c){const[c,d]=V.c;rush(d,c==='s'?.2:c==='t'?.26:.14,c==='s'?6500:c==='t'?5200:3000)}buildVoice(ac,master,k,ac.currentTime+.005+(V.c?V.c[1]*.5:0))}
 function music(on){Music.active(on)}
 function tick(){}
 return{unlock,sync,fx,voice,voiceBuild:buildVoice,voices:VOICES,music,tick,get state(){return ac?.state||'locked'},get bgm(){return Music.state},get baseLatency(){return ac?.baseLatency??null}};
})();
const MOVES={punch:[{name:'左ジャブ',dur:.20,active:.035,dmg:12,reach:96,push:12},{name:'右ストレート',dur:.24,active:.045,dmg:16,reach:107,push:19},{name:'両手パンチ',dur:.40,active:.07,dmg:32,reach:124,push:80,heavy:true}],kick:[{name:'右キック',dur:.26,active:.05,dmg:16,reach:120,push:22},{name:'左キック',dur:.30,active:.06,dmg:20,reach:126,push:28},{name:'ドロップキック',dur:.62,active:.085,dmg:42,reach:145,push:100,heavy:true}]};
const AIR={punch:{name:'ジャンプパンチ',dur:.34,active:.04,dmg:16,reach:108,push:40,air:true},kick:{name:'飛び蹴り',dur:.42,active:.05,dmg:24,reach:132,push:60,air:true}};
const WAVES=[{area:0,types:['ember','ember']},{area:0,types:['ember','frost','ember']},{area:1,types:['guard','ember','frost']},{area:1,types:['frost','guard','ember','ember']},{area:2,types:['guard','frost','guard','ember']},{area:3,types:['boss']}];
const AREAS=[['城外橋','THE ASHEN BRIDGE','術師の懐へ。拳の届く距離まで。'],['灰の回廊','HALL OF EMBERS','三撃目で、結界ごと打ち砕け。'],['封印の門','THE SEALED GATE','魔法をかわす。その一歩が武器になる。'],['魔王の玉座','THRONE OF THE LAST SPELL','魔力ゼロの拳は、ここまで来た。']];
const G={mode:'title',time:0,visual:0,p:null,enemies:[],shots:[],hazards:[],particles:[],floats:[],rings:[],blasts:[],quakes:[],gate:new WaveGate(),wave:0,area:0,cam:0,span:900,score:0,combo:0,comboLife:0,shake:0,hitstop:0,flash:0,chapter:0,noticeLife:0,training:false,difficulty:'journey',lastMove:'',movesUsed:[],stats:{},winTime:0};
let serial=0,hudTimer=0,frameMS=[],fps=60,frameId,previous=0,acc=0,renderCount=0,resizePending=true;
function resize(){const r=$('screen-wrap').getBoundingClientRect();if(!r.width||!r.height)return;DPR=Math.min(devicePixelRatio||1,Settings.quality==='high'?2:quality>=1?1.6:quality>=.8?1.35:quality>=.65?1.15:1);H=560;W=H*r.width/r.height;viewScale=r.height/H;fxs=clamp(W/620,.7,1);const cw=Math.round(r.width*DPR),ch=Math.round(r.height*DPR);if(cw!==canvas.width||ch!==canvas.height){canvas.width=cw;canvas.height=ch}$('screen-wrap').style.setProperty('--vi',(H*.1*viewScale).toFixed(1)+'px');$('screen-wrap').style.setProperty('--vo',(Math.max(W,H)*.8*viewScale).toFixed(1)+'px');canvas.dataset.logicalWidth=W;canvas.dataset.logicalHeight=H;resizePending=false}
new ResizeObserver(()=>{resizePending=true}).observe($('screen-wrap'));window.visualViewport?.addEventListener('resize',()=>{resizePending=true});
function player(x=110){return{x,z:.64,face:1,hp:120,maxHP:120,inv:0,stun:0,attack:null,stepP:0,stepK:0,chainLife:0,dash:0,dashCD:0,dx:1,dz:0,walk:0,moving:false,rage:0,kb:0,buffer:null,burst:0,vx:0,vz:0,h:0,vh:0,jt:0,land:0,airUsed:false}}
function createEnemy(type,x,z){const cfg={ember:[58,20],frost:[76,23],guard:[112,43],boss:[1040,44]}[type];return{id:++serial,type,x,z,hp:cfg[0],maxHP:cfg[0],face:-1,walk:0,t:0,cool:rnd(.65,1.3),cast:0,castTotal:1,target:null,stun:0,flash:0,kb:0,shield:type==='guard'?1:0,phase:1,cycle:0,dead:0,armor:0,blink:0,blinkUsed:false,radius:cfg[1]}}
function notice(s,time=3){$('notice').textContent=s;$('notice').classList.add('show');G.noticeLife=time}
function showChapter(){const a=AREAS[G.area];$('chapterNum').textContent=String(G.area+1).padStart(2,'0')+' / '+a[1];$('chapterName').textContent=a[0];$('chapterSub').textContent=a[2];$('chapter').classList.remove('hidden');G.chapter=2.4}
function beginWave(i){G.wave=i;G.area=WAVES[i].area;Music.cue(G.area===0?'strike':G.area===3?'standoff':'lock');setArea(G.area);const at=i*G.span;G.gate.index=i;G.gate.begin(at);if(i===0||Math.abs(G.cam-at)>W*.5)G.cam=at;G.p.x=clamp(G.p.x,at+48,at+W*.45);G.enemies=WAVES[i].types.map((t,j)=>{const e=createEnemy(t,at+W*(.67+(j%2)*.14),.24+(j*.23)%.65);e.appear=.5;e.cool+=.5;return e});for(const e of G.enemies){ring(e.x,e.z,'#c8b3ff',60);particle(e.x,foot(e.z)-60,'#d9c8ff',10,.9)}if(i===0||WAVES[i-1].area!==G.area)showChapter();if(i===2)notice('結界兵には、拳・脚の3撃目が効く',4);if(i===5){G.p.hp=Math.min(120,G.p.hp+35);Sound.fx('magic');notice('魔王の詠唱を止めろ。地面の魔法陣は回避。',4)}}
function start(training=false,retry=false){Input.clear();hudReset();$('modal').classList.add('hidden');$('title').classList.add('hidden');$('hud').classList.remove('hidden');$('trainingLabel').classList.toggle('hidden',!training);const checkpoint=retry?G.wave:0,score=retry?Math.floor(G.score*.75):0;Object.assign(G,{mode:'play',training,time:retry?G.time:0,span:Math.max(640,W+90),enemies:[],shots:[],hazards:[],particles:[],floats:[],rings:[],blasts:[],quakes:[],gate:new WaveGate(),cam:0,score,combo:0,comboLife:0,hitstop:0,shake:0,flash:0,lastMove:'',movesUsed:[],stats:{hits:0,damage:0,reflections:0,dodges:0,maxCombo:0,kills:0},winTime:0});G.p=player(checkpoint*G.span+W*.26);if(training){beginWave(0);G.enemies=[createEnemy('guard',W*.68,.6),createEnemy('ember',W*.8,.23)];G.p.rage=100;notice('拳・脚は長押しで3連撃。回避は方向と同時押し。',5)}else beginWave(checkpoint);Sound.unlock();Sound.music(true);hud()}
function title(){G.mode='title';Input.clear();hudReset();setArea(0);for(const n of['danger','rage','boss','casting','hot'])document.body.classList.remove(n);Music.cue('iron');Sound.music(true);$('modal').classList.add('hidden');$('title').classList.remove('hidden');['hud','bossHud','combo','chapter','trainingLabel'].forEach(k=>$(k).classList.add('hidden'));G.noticeLife=0;$('notice').classList.remove('show')}
function modal(label,heading,body,buttons){$('modalLabel').textContent=label;$('modalTitle').textContent=heading;$('modalBody').innerHTML=body;$('modalButtons').replaceChildren();for(const [name,fn]of buttons){const b=document.createElement('button');b.textContent=name;b.onclick=()=>{Sound.unlock();Sound.fx('ui');fn()};$('modalButtons').appendChild(b)}$('modal').classList.remove('hidden')}
function resume(){Input.clear();G.mode='play';$('modal').classList.add('hidden');Sound.unlock();Sound.music(true)}
function pause(){if(G.mode==='play'){G.mode='pause';Input.clear();Sound.music(false);modal('CAMP / 休息','ひと息、つこう。','<p>拳を下ろしても、旅は終わらない。</p>',[['つづける',resume],['遊び方',()=>guide(true)],['設定',()=>settings(true)],['タイトルへ',title]])}else if(G.mode==='pause')resume();else if(G.mode==='title')start(false)}
window.onPause=pause;window.onAutoPause=()=>{if(G.mode==='play')pause()};
function guide(fromPlay=false){if(fromPlay){G.mode='pause';Input.clear();Sound.music(false)}modal('FIELD NOTES / 戦いの手引き','魔法には、間合いで勝つ。','<div class="move-list"><b>移動</b><span>左パッド / WASD。上下へずれて魔法をかわし、敵に近づく。</span><b>拳 J</b><span>左ジャブ → 右ストレート → 両手パンチ</span><b>脚 K</b><span>右キック → 左キック → ドロップキック</span><b>回避</b><span>SPACE。方向＋回避で短い無敵ステップ。</span><b>震撃 U</b><span>闘気100で解放。周囲の敵と魔法を吹き飛ばす。</span></div><p class="tip">拳・脚は長押しで連撃。3撃目は結界を壊し、目の前の魔法弾も打ち返す。</p>',[[fromPlay?'戦いへ戻る':'閉じる',fromPlay?resume:()=>{$('modal').classList.add('hidden')}]] )}
function settings(fromPlay=false){modal('OPTIONS / 自分の間合い','手になじむ、戦い方。',`<div class="settings-row"><span>利き手</span><button id="handedOpt">${Settings.handed==='right'?'右手で攻撃':'左手で攻撃'}</button></div><div class="settings-row"><span>画面の揺れ・閃光</span><button id="reducedOpt">${Settings.reduced?'ひかえめ':'通常'}</button></div><div class="settings-row"><label for="qualityOpt">描画</label><select id="qualityOpt"><option value="auto">自動</option><option value="high">高精細</option><option value="low">軽量</option></select></div><div class="settings-row"><label for="senseOpt">パッド感度</label><input id="senseOpt" type="range" min="0.7" max="1.5" step=".1" value="${Settings.sensitivity}"></div><div class="settings-row"><label for="difficultyOpt">難易度</label><select id="difficultyOpt"><option value="journey">旅人 / 標準</option><option value="challenge">挑戦 / 強敵</option></select></div><p>旅人は被ダメージを軽減。連撃と回避を覚えながら攻略できます。</p>`,[['閉じる',fromPlay?()=>{G.mode='play';pause()}:()=>{$('modal').classList.add('hidden')}]]);$('qualityOpt').value=Settings.quality;$('difficultyOpt').value=G.difficulty;$('handedOpt').onclick=()=>{Settings.handed=Settings.handed==='right'?'left':'right';Store.set('handed',Settings.handed);applySettings();$('handedOpt').textContent=Settings.handed==='right'?'右手で攻撃':'左手で攻撃'};$('reducedOpt').onclick=()=>{Settings.reduced=!Settings.reduced;Store.set('reduced',Settings.reduced?'1':'0');$('reducedOpt').textContent=Settings.reduced?'ひかえめ':'通常'};$('qualityOpt').onchange=e=>{Settings.quality=e.target.value;Store.set('quality',Settings.quality);quality=Settings.quality==='low'?.5:1;resizePending=true};$('senseOpt').oninput=e=>{Settings.sensitivity=+e.target.value;Store.set('sensitivity',Settings.sensitivity)};$('difficultyOpt').onchange=e=>{G.difficulty=e.target.value}}
$('start').onclick=()=>start(false);$('practice').onclick=()=>start(true);$('guide').onclick=()=>guide(false);$('settingsTitle').onclick=()=>settings(false);
// Consume the command in the pointer/keyboard callback, including during hit-stop.
// Gameplay recovery is retained, but a queued follow-up survives until recovery ends.
function consumeCommand(cmd){const p=G.p,now=performance.now();let outcome='unavailable';if(cmd.a==='dash'){if(dash())outcome='started'}else if(cmd.a==='burst'){if(burst())outcome='started'}else if(cmd.a==='jump'){if(jump())outcome='started'}else if(attack(cmd.a))outcome='started';else{p.buffer={kind:cmd.a,until:now+Math.max(160,((p.attack?p.attack.m.dur-p.attack.t:0)+.16)*1000)};outcome='buffered'}Input.sample(cmd.t,outcome);return outcome}
window.onGameAction=cmd=>{if(G.mode==='title'&&(cmd.a==='punch'||cmd.a==='kick')){start(false);return true}if(G.mode!=='play')return true;const outcome=consumeCommand(cmd);if(outcome==='started')render();return true};
function finish(win){if(G.mode!=='play')return;G.mode=win?'clear':'over';Input.clear();Sound.music(false);if(win){Music.cue('iron');Sound.music(true);G.score+=Math.max(0,6000-Math.floor(G.time*10));G.winTime=G.time;Store.set('best',Math.max(+Store.get('best','0'),G.score));Sound.fx('win');modal('EPILOGUE / 夜明け','魔法より、強いもの。',`<p>魔王の杖が折れ、城に朝日が差した。<br>ガルドは拳をほどく。その手で、今度は街を直そう。<br><span class="tip">魔力は、最後までゼロだった。</span></p><div class="stat-list"><div><b>${G.score.toLocaleString()}</b><small>SCORE / 戦績</small></div><div><b>${G.stats.maxCombo}</b><small>MAX COMBO / 連撃</small></div><div><b>${Math.floor(G.time/60)}:${String(Math.floor(G.time%60)).padStart(2,'0')}</b><small>TIME / 踏破時間</small></div><div><b>${G.stats.reflections}</b><small>REFLECT / 魔法反射</small></div></div>`,[['もう一度',()=>start(false)],['タイトルへ',title]])}else{Sound.fx('hurt');modal('FALLEN / それでも、立つ','まだ、拳は折れていない。','<p>魔法は正面で受けず、上下へかわす。<br>詠唱の隙に接近して、連撃を叩き込もう。</p><p class="tip">この戦いの頭から再挑戦。スコアは25%減少。</p>',[['再挑戦',()=>start(false,true)],['鍛錬場',()=>start(true)],['タイトルへ',title]])}hud()}
function particle(x,y,col,n=10,force=1){for(let i=0;i<n&&G.particles.length<220;i++){const a=rnd(0,TAU),s=rnd(25,190)*force;G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-20,life:rnd(.15,.45),max:.45,col,size:rnd(1.3,4)})}}
function ring(x,z,col,r=65){G.rings.push({x,z,col,r,t:0})}
const elemCol=e=>e.type==='ember'?'#ffac72':e.type==='frost'?'#8edce8':'#90efc8';
function lod(){return quality>=.8?(Settings.reduced?1:2):quality>=.65?1:0}
function blast(x,z,col,m=1,y){y=y??foot(z)-74;if(G.blasts.length>=14)G.blasts.shift();G.blasts.push({x,y,col,m,t:0,life:.42});particle(x,y,col,Math.round(10+m*8),1.2+m*.5);particle(x,y,'#fff6d8',6,1.6);ring(x,z,col,48*m)}
function trail(s,dt){s.spark=(s.spark||0)-dt;if(s.spark>0||G.particles.length>150||quality<.6)return;s.spark=.018+.02/quality;const back=-Math.sign(s.vx||1);G.particles.push({x:s.x+back*rnd(4,24),y:foot(s.z)-74+rnd(-9,9),vx:back*rnd(30,120),vy:rnd(-45,25),life:rnd(.2,.4),max:.4,col:Math.random()<.4?'#fff6d8':s.col,size:rnd(1.6,3.6)})}
function float(text,x,z,col='#f6da9d'){G.floats.push({text,x,z,t:0,col})}
function hitFeel(heavy=false){G.shake=Math.max(G.shake,heavy?7:3);G.hitstop=Math.max(G.hitstop,heavy?.045:.026);Sound.fx(heavy?'heavy':'hit')}
const KIAI={ya:['ヤッ',16],ha:['ハッ',16],sei:['セイッ',16],toh:['トウッ',15],yaa:['ヤァーッ！',24,1],uo:['ウオーッ！',26,1],uoo:['ウオオオーッ！！',34,1]};
function kiai(k,chance=.5){const d=KIAI[k],p=G.p;if(!d||!p)return;const strong=!!d[2];if(!strong&&(G.time-(G.kiaiAt??-9)<.7||Math.random()>chance))return;G.kiaiAt=G.time;Sound.voice(k);G.floats.push({text:d[0],x:p.x+p.face*34,z:p.z,t:0,col:strong?'#ffe08a':'#fff1cf',big:d[1],dx:p.face*38,lift:158+(p.h||0),life:strong?1:.7})}
function attack(kind){const p=G.p;if(p.h>0)return airAttack(kind);if(p.stun>0||p.dash>0||p.attack)return false;const key=kind==='punch'?'stepP':'stepK';if(p.chainLife<=0){p.stepP=p.stepK=0}const idx=p[key]%3,m=MOVES[kind][idx];p[key]=(idx+1)%3;p.chainLife=.95;const e=nearest(p,G.enemies,190);if(e&&Math.abs(e.z-p.z)<.25)p.face=e.x<p.x?-1:1;p.attack={kind,idx,m,t:0,hit:new Set(),reflected:new Set()};G.lastMove=m.name;if(!G.movesUsed.includes(m.name))G.movesUsed.push(m.name);Sound.fx(m.heavy?'heavy':kind);kiai(kind==='punch'?['ya','ha','uo'][idx]:['sei','ha','yaa'][idx]);if(m.heavy)notice(m.name,1);return true}
function jump(){const p=G.p;if(p.stun>0||p.burst>0||p.h>0||p.dash>0)return false;p.attack=null;p.buffer=null;G.hitstop=0;p.vh=640;p.h=.01;p.jt=0;p.airUsed=false;G.stats.jumps=(G.stats.jumps||0)+1;particle(p.x,foot(p.z)-2,'#b8ae91',5,.5);ring(p.x,p.z,'#e5d4ae55',26);Sound.fx('jump');kiai('toh',.5);return true}
function airAttack(kind){const p=G.p;if(p.stun>0||p.attack||p.airUsed)return false;const m=AIR[kind];p.airUsed=true;p.attack={kind,idx:3,m,t:0,hit:new Set(),reflected:new Set()};G.lastMove=m.name;if(!G.movesUsed.includes(m.name))G.movesUsed.push(m.name);Sound.fx(kind);kiai('yaa',.6);return true}
function dash(){const p=G.p;if(p.dashCD>0||p.stun>0||p.dash>0||p.h>0)return false;G.hitstop=0;const a=Input.axes,l=Math.hypot(a.x,a.y);p.dx=l>.1?a.x:p.face;p.dz=l>.1?a.y:0;p.dash=.22;p.dashCD=.59;p.inv=Math.max(p.inv,.23);p.attack=null;p.buffer=null;G.stats.dodges++;Sound.fx('dash');ring(p.x,p.z,'#99d3bc',42);return true}
// Reflect timing: offset = how far the swing's active window and the shot's arrival at reach were apart (seconds).
const REFLECT=[{name:'OK',max:9,dmg:40,col:'#ffe6a7',scale:1.2,sfx:'break',score:180,ring:45,m:1.1},{name:'GREAT',max:.15,dmg:85,col:'#b58cff',scale:1.55,sfx:'reflect1',score:420,ring:75,m:1.6},{name:'PERFECT',max:.07,dmg:100,col:'#fff3b8',scale:1.7,sfx:'reflect2',score:900,ring:115,m:2.2}];
function reflectGrade(s,at,p){const m=at.m,open=Math.max(0,at.t-m.active),inside=Math.max(0,(m.reach+18-Math.abs(s.x-p.x))/Math.max(60,Math.abs(s.vx))),off=Math.max(open,inside);return off<=REFLECT[2].max?2:off<=REFLECT[1].max?1:0}
function burst(){const p=G.p;if(p.h>0)return false;if(p.rage<100){notice('震撃には闘気100が必要。攻撃を当てて蓄積。',1.7);return false}
 p.rage=0;p.attack=null;p.buffer=null;p.inv=.9;p.burst=.6;let n=0;
 for(const s of G.shots){if(n++<3)blast(s.x,s.z,s.col,1);else particle(s.x,foot(s.z)-74,s.col,6,1.4)}G.shots=[];G.hazards=[];
 for(const e of G.enemies)if(e.hp>0&&e.shield){e.shield=0;particle(e.x,foot(e.z)-70,'#9effe2',16)}
 G.quakes.push({x:p.x,z:p.z,t:0,life:.95,hit:new Set(),cracks:makeCracks()});quakeStep(0);
 G.blasts.push({x:p.x,y:foot(p.z)-70,col:'#ffe6a7',m:1.5,t:0,life:.42});
 ring(p.x,p.z,'#ffe9aa',300);particle(p.x,foot(p.z)-50,'#f8db97',60,2.4);particle(p.x,foot(p.z)-6,'#8a7a5c',45,2.1);particle(p.x,foot(p.z)-6,'#ffd88a',30,2.6);
 hitFeel(true);G.flash=.5;G.shake=15;G.hitstop=.09;Sound.fx('quake');kiai('uoo');uiPulse('burst');notice('震撃 / 大地ごと砕いた',2.2);return true}
// Shockwave: expands over the whole floor and hits every enemy it reaches (heavier near the centre).
const QR=t=>1300*(1-Math.exp(-t*4.5)),CR=560;
function makeCracks(){const a=[];for(let i=0;i<18;i++){const ang=i*TAU/18+rnd(-.12,.12),L=rnd(.45,1),pts=[];let lat=0;for(let j=1;j<=7;j++){lat+=rnd(-.03,.03);pts.push([L*j/7,lat])}a.push({ang,pts})}return a}
function quakeHit(q,e,dx){const d=Math.abs(dx),dir=dx>=0?1:-1,dmg=Math.round(clamp(100-d*.06,52,100));damageEnemy(e,dmg,170,true);e.kb=dir*(e.type==='boss'?55:240);if(e.hp>0&&e.type!=='boss'){e.stun=Math.max(e.stun,.95);e.cool=Math.max(e.cool,1.3)}e.shield=0;e.flash=.3;blast(e.x,e.z,'#ffe6a7',1.15);particle(e.x,foot(e.z)-50,'#ffdf8b',26,2.2);particle(e.x,foot(e.z)-4,'#8a7a5c',14,1.7);ring(e.x,e.z,'#ffe6a7',120)}
function quakeStep(dt){for(const q of G.quakes){const r=QR(q.t);for(const e of G.enemies){if(e.hp<=0||q.hit.has(e.id))continue;const dx=e.x-q.x;if(Math.abs(dx)<=r){q.hit.add(e.id);quakeHit(q,e,dx)}}
 if(q.t<.6&&dt>0&&quality>=.5&&G.particles.length<170&&Math.random()<dt*40)for(const side of[-1,1])for(let i=0;i<2;i++)G.particles.push({x:q.x+side*r+rnd(-24,24),y:foot(rnd(.08,.95))-rnd(0,26),vx:side*rnd(40,240),vy:rnd(-230,-60),life:rnd(.35,.7),max:.7,col:Math.random()<.5?'#8a7a5c':'#ffd88a',size:rnd(2,5.5)})}}
function drawQuakeGround(q){const x0=q.x-G.cam,y0=foot(q.z),t=q.t,r=QR(t),fade=clamp(1-(t-.4)/.5,0,1),all=clamp(1-t/q.life,0,1);
 ctx.save();ctx.globalAlpha=.55*fade;ellipse(x0,y0+2,Math.min(1,t*5)*170,Math.min(1,t*5)*58,'#0c0804');
 ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
 for(const c of q.cracks){const ca=Math.cos(c.ang),sa=Math.sin(c.ang);ctx.moveTo(x0,y0);for(const[d,l]of c.pts){const dd=d*CR;if(dd>r*.9)break;ctx.lineTo(x0+ca*dd-sa*l*CR,y0+(sa*dd+ca*l*CR)*.34)}}
 ctx.globalAlpha=.85*fade;ctx.strokeStyle='#120a05';ctx.lineWidth=5;ctx.stroke();
 ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade;ctx.strokeStyle='#ff9a3c';ctx.lineWidth=2.4;ctx.stroke();ctx.globalAlpha=fade*.8;ctx.strokeStyle='#fff0c0';ctx.lineWidth=.9;ctx.stroke();
 ctx.save();ctx.translate(x0,y0);ctx.scale(1,.34);ctx.globalAlpha=.5*all;MagicFx.glow(ctx,0,0,Math.min(r*.85,460),'#ffb860');ctx.restore();
 ctx.globalAlpha=.9*all;ellipse(x0,y0,r,r*.34,null,'#ffd08a',14);ctx.globalAlpha=.9*all;ellipse(x0,y0,r,r*.34,null,'#fff4d0',4);if(lod()>=2){ctx.globalAlpha=.75*all;ellipse(x0,y0,r*.8,r*.8*.34,null,'#ff9a3c',8);ctx.globalAlpha=.6*all;ellipse(x0,y0,r*.58,r*.58*.34,null,'#ffe0a0',4)}
 ctx.restore();
 const wh=H*.52*(1-t*.5),k=clamp(t/.9,0,1);for(const side of[-1,1]){const x=x0+side*r*.98;if(x>-160&&x<W+160)MagicFx.pillar(ctx,x,y0+10,wh,110*fxs,'#ffe6a7',k,G.visual)}MagicFx.pillar(ctx,x0,y0+6,H*.95,150*fxs,'#ffe6a7',clamp(t/.5,0,1),G.visual)}
function drawQuakeSky(q){const x0=q.x-G.cam,y0=foot(q.z);MagicFx.pillar(ctx,x0,y0+6,H*.95,170*fxs,'#ffe6a7',clamp(q.t/.6,0,1),G.visual)}
function damageEnemy(e,damage,push,heavy=false,reflected=false){if(e.hp<=0)return;if(e.shield&&!heavy&&!reflected){damage=Math.ceil(damage*.24);float('結界',e.x,e.z,'#98e7da');Sound.fx('magic')}else if(e.shield){e.shield=0;particle(e.x,foot(e.z)-70,'#9effe2',20);float('BREAK',e.x,e.z,'#9effde');Sound.fx('break')}const casting=e.cast>0;const armored=e.type==='boss'&&(e.armor>0||(casting&&!heavy));if(!armored){e.cast=0;e.cool=Math.max(e.cool,heavy?.85:.38);e.stun=heavy?.46:.16;if(e.type==='boss'&&heavy){e.armor=2.5;e.cool=.25}}else{e.stun=0;damage=Math.round(damage*.7)}e.flash=.14;e.kb=G.p.face*push*(e.type==='boss'?.25:1);e.hp-=damage;if(e.hp>0&&e.hp<e.maxHP*.65&&!e.blinkUsed&&['ember','frost'].includes(e.type)){e.blink=.26;e.blinkUsed=true;e.cast=0}G.score+=damage*5;G.combo++;G.comboLife=1.7;G.stats.hits++;G.stats.maxCombo=Math.max(G.stats.maxCombo,G.combo);G.p.rage=clamp(G.p.rage+(heavy?13:6),0,100);float(String(damage),e.x,e.z);particle(e.x,foot(e.z)-90,heavy?'#ffdf8b':'#ead5ad',heavy?16:8);if(casting&&e.type!=='guard'&&heavy&&!armored)float('詠唱中断',e.x,e.z-.12,'#9ce4cc');if(e.hp<=0){e.dead=.7;G.stats.kills++;G.score+=e.type==='boss'?10000:250;particle(e.x,foot(e.z)-70,'#88c6b5',22);if(e.type==='boss'){G.shots=[];G.hazards=[];G.winTime=1.2}if(G.training){e.respawn=1.6}}}
function hurt(amount,sourceX){const p=G.p;if(p.inv>0||G.mode!=='play')return false;const dmg=Math.round(amount*(G.difficulty==='journey'?.68:1));if(!G.training){p.hp=Math.max(0,p.hp-dmg);G.stats.damage+=dmg}p.inv=.8;p.stun=.16;p.attack=null;p.kb=(p.x>sourceX?1:-1)*32;G.combo=0;G.comboLife=0;G.flash=.07;G.shake=5;Sound.fx('hurt');uiPulse('hit');particle(p.x,foot(p.z)-65,'#f59b77',12);float('-'+dmg,p.x,p.z,'#ffaf8f');if(p.hp<=0)finish(false);return true}
const CHANTS={ember:['焼け落ちろ…','灰に還れ','骨まで燃え尽きよ','怨嗟の炎に抱かれて死ね'],frost:['凍てつけ…','凍えて朽ちろ','命の音を止めてやる','氷の棺で眠れ'],guard:['大地よ、裂けろ','踏み潰されよ','石の下に沈め'],boss:['我が呪詛を受けよ','その魂、闇に堕ちよ','終焉を、汝に与う'],boss2:['万象よ、悉く滅びよ','千の呪い、万の怨嗟','禁呪解放──朽ち果てよ']};
const CHANT_COL={ember:'#ffb98a',frost:'#a8e6f0',guard:'#cfe8a8',boss:'#f0c6ff'};
function startChant(e){const list=CHANTS[e.type==='boss'&&e.phase===2?'boss2':e.type]||CHANTS.ember;let i=Math.floor(Math.random()*list.length);if(i===e.lastChant)i=(i+1)%list.length;e.lastChant=i;e.chant={text:list[i],t:0,stop:null,cut:false,rel:false}}
function drawChants(){ctx.save();const fs=Math.round(clamp(12.5/viewScale,13,26));ctx.font=`700 ${fs}px 'Hiragino Mincho ProN','Yu Mincho',serif`;ctx.textBaseline='middle';
 for(const e of G.enemies){const c=e.chant;if(!c||e.hp<=0)continue;const x=e.x-G.cam;if(x<-60||x>W+60)continue;const s=depthScale(e.z)*(e.type==='boss'?1.42:e.type==='guard'?1.3:1),len=c.text.length,span=Math.max(.3,(e.castTotal||.8)*.8);
  const n=c.stop!=null&&!c.cut?len:Math.min(len,Math.ceil((c.cut?c.stop:c.t)/span*len));const shown=c.text.slice(0,n)+(c.cut?'──ぐっ！':'');
  const a=c.stop!=null?clamp(1-(c.t-c.stop-.3)/.4,0,1):1;if(a<=0)continue;
  const col=c.cut?'#ff9a8a':(CHANT_COL[e.type]||'#fff'),w=ctx.measureText(shown).width+fs*1.4,h=Math.round(fs*1.85),bx=clamp(x-w/2,6,W-6-w),by=Math.max(68,foot(e.z)-208*s-h);
  ctx.globalAlpha=a;ctx.fillStyle='rgba(12,6,10,.84)';ctx.fillRect(bx,by,w,h);ctx.fillStyle=col;ctx.fillRect(bx,by,3,h);ctx.globalAlpha=a*.55;ctx.strokeStyle=col;ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,w-1,h-1);
  ctx.globalAlpha=a*.84;ctx.fillStyle='rgba(12,6,10,.84)';const tx=clamp(x,bx+10,bx+w-10);ctx.beginPath();ctx.moveTo(tx-5,by+h);ctx.lineTo(tx+5,by+h);ctx.lineTo(tx,by+h+6);ctx.fill();
  ctx.globalAlpha=a;ctx.fillStyle=col;ctx.fillText(shown,bx+fs*.8,by+h/2+1)}
 ctx.restore()}
function castSpell(e){e.cycle++;e.target={x:G.p.x,z:G.p.z};e.castTotal=e.type==='guard'?.65:e.type==='boss'?(e.phase===2?.83:1.05):.8;e.cast=e.castTotal;Sound.fx('magic');Sound.fx('chant');startChant(e)}
function releaseSpell(e){const t=e.target||G.p;
 if(e.type==='guard'){if(Math.abs(e.x-G.p.x)<125&&sameLane(e,G.p,.19)&&G.p.h<30)hurt(18,e.x);ring(e.x+e.face*56,e.z,'#e9a57b',85);e.cool=1.4;return}
 if(e.type==='boss'&&e.cycle%3===0){for(let i=0;i<(e.phase===2?3:2);i++)G.hazards.push({x:clamp(t.x+(i-1)*80,G.cam+35,G.cam+W-35),z:clamp(t.z+(i-1)*.24,.12,.94),t:0,delay:.95,r:55});notice('足元に魔法陣。上下へ抜けろ！',1.7)}
 else{const dir=t.x<e.x?-1:1;const n=e.type==='boss'?(e.phase===2?5:3):1;for(let i=0;i<n;i++){const z=clamp(e.z+(i-(n-1)/2)*.17,.05,.95);const targetZ=clamp(t.z+(i-(n-1)/2)*.18,.05,.95);const vx=dir*(e.type==='frost'?210:e.type==='boss'?245:195);G.shots.push({id:++serial,x:e.x+dir*28,z,vx,vz:(targetZ-z)/Math.max(.45,Math.abs(t.x-e.x)/Math.abs(vx)),life:4,col:elemCol(e),r:e.type==='boss'?13:10,reflected:false,spark:0})}blast(e.x+dir*28,e.z,elemCol(e),e.type==='boss'?1.5:1.05);Sound.fx('shoot');G.shake=Math.max(G.shake,e.type==='boss'?4:2)}
 if(e.type==='boss'){G.hazards.push({x:e.x,z:e.z,t:0,delay:.7,r:94});notice('王の結界が爆ぜる。回避で離れろ！',1.6)}e.cool=e.type==='boss'?(e.phase===2?.7:1.0):e.type==='frost'?1.7:1.8;
}
function updateEnemy(e,dt){e.t+=dt;if(e.appear>0)e.appear-=dt;if(e.chant){const c=e.chant;c.t+=dt;if(c.stop==null&&e.cast<=0&&c.t>.05){c.stop=c.t;c.cut=!c.rel}if(c.stop!=null&&c.t-c.stop>.8)e.chant=null}e.armor=Math.max(0,e.armor-dt);if(e.blink>0&&e.hp>0){e.blink-=dt;if(e.blink<=0){ring(e.x,e.z,'#94e7ce',55);e.x=G.cam+(G.p.x-G.cam<W*.5?W*.78:W*.22);e.z=G.p.z>.5?.23:.82;e.stun=0;e.cool=.2;ring(e.x,e.z,'#94e7ce',55)}return}e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);e.x+=e.kb*dt*7;e.kb*=Math.exp(-dt*11);e.x=clamp(e.x,G.cam+28,G.cam+W-28);if(e.hp<=0){e.dead=Math.max(0,e.dead-dt);if(G.training){e.respawn-=dt;if(e.respawn<=0){Object.assign(e,createEnemy(e.type,G.cam+W*.75,rnd(.25,.85)))}}return}e.face=G.p.x<e.x?-1:1;if(e.type==='boss'&&e.hp<e.maxHP*.5&&e.phase===1){e.phase=2;e.armor=3;e.stun=.6;e.cast=0;e.cool=.5;ring(e.x,e.z,'#e5cb9c',200);notice('魔王、第二詠唱。連撃で止めろ。',3);Sound.fx('break')}if(e.stun>0)return;if(e.cast>0){e.cast-=dt;if(e.cast<=0){if(e.chant)e.chant.rel=true;releaseSpell(e)}return}e.cool-=dt;const dx=G.p.x-e.x,dz=G.p.z-e.z;let speed=e.type==='guard'?65:35;if(e.type==='guard'){if(Math.abs(dx)>90)e.x+=Math.sign(dx)*speed*dt;if(Math.abs(dz)>.04)e.z+=Math.sign(dz)*.19*dt}else{if(Math.abs(dx)<95)e.x-=Math.sign(dx||1)*speed*dt;else if(Math.abs(dx)>W*.65)e.x+=Math.sign(dx)*speed*.7*dt;if(Math.abs(dz)>.12)e.z+=Math.sign(dz)*.1*dt}e.walk+=dt*3;e.z=clamp(e.z,.12,.94);if(e.cool<=0&&(e.type!=='guard'||(Math.abs(dx)<135&&Math.abs(dz)<.2)))castSpell(e)}
function update(dt){G.time+=dt;quakeStep(dt);const p=G.p;if(G.noticeLife>0){G.noticeLife-=dt;if(G.noticeLife<=0)$('notice').classList.remove('show')}if(G.chapter>0){G.chapter-=dt;if(G.chapter<=0)$('chapter').classList.add('hidden')}G.comboLife-=dt;if(G.comboLife<=0)G.combo=0;p.inv=Math.max(0,p.inv-dt);p.stun=Math.max(0,p.stun-dt);p.dashCD=Math.max(0,p.dashCD-dt);p.chainLife=Math.max(0,p.chainLife-dt);p.burst=Math.max(0,p.burst-dt);
 const now=performance.now();for(const cmd of Input.drain()){if(now-cmd.t>180)continue;consumeCommand(cmd)}
 if(p.buffer&&now>p.buffer.until)p.buffer=null;
 if(!p.attack&&p.dash<=0&&p.stun<=0){if(p.buffer){const b=p.buffer;p.buffer=null;attack(b.kind)}else if(p.h<=0&&Input.held('punch'))attack('punch');else if(p.h<=0&&Input.held('kick'))attack('kick')}
 const a=Input.axes,grounded=p.h<=0;
 // Velocity is smoothed (exponential approach) instead of snapping to the stick value: starts and stops ease in/out,
 // the walk cycle is driven by distance travelled so feet do not skate, and momentum carries through jumps and dashes.
 if(p.dash>0){p.dash-=dt;const u=clamp(1-p.dash/.22,0,1),f=1.45-.9*u;p.vx=p.dx*610*f;p.vz=p.dz*2.3*f;if(Math.random()<.3*quality)particle(p.x,foot(p.z)-15,'#739e8d',1,.35)}
 else{let tx=0,tz=0,k=12;if(p.stun<=0){const free=!G.gate.active&&G.wave<5,sp=(p.attack?(grounded?120:230):300)*(free&&!p.attack?1.65:1);if(free&&!p.attack&&grounded&&Math.abs(a.x)>.5&&Math.random()<.35*quality)particle(p.x-Math.sign(a.x)*12,foot(p.z)-2,'#b8ae91',1,.4);tx=a.x*sp;tz=a.y*(p.attack?(grounded?.55:.8):1.05);k=grounded?((tx||tz)?38:34):9;if(Math.abs(a.x)>.22&&(!p.attack||p.attack.t>p.attack.m.active+.12))p.face=a.x>0?1:-1}const ease=1-Math.exp(-dt*k);p.vx+=(tx-p.vx)*ease;p.vz+=(tz-p.vz)*ease}
 p.x+=p.vx*dt;p.z+=p.vz*dt;const spd=Math.hypot(p.vx,p.vz*170);p.moving=grounded&&spd>24;if(grounded)p.walk+=spd*dt/118*TAU;
 if(p.h>0||p.vh!==0){p.jt+=dt;const cut=p.vh>0&&p.jt>.07&&!Input.held('jump')?1.8:1;p.vh-=2400*cut*dt;p.h+=p.vh*dt;if(p.h<=0){const fall=-p.vh;p.h=0;p.vh=0;p.land=.09;p.airUsed=false;if(p.attack&&p.attack.m.air)p.attack=null;particle(p.x,foot(p.z)-2,'#b8ae91',fall>420?10:5,.5);ring(p.x,p.z,'#e5d4ae66',fall>420?40:28);Sound.fx('land')}}
 p.land=Math.max(0,p.land-dt);
 p.x+=p.kb*dt*9;p.kb*=Math.exp(-dt*12);p.z=clamp(p.z,.12,.95);
 if(p.attack){const at=p.attack;at.t+=dt;const m=at.m;if(at.kind==='kick'&&at.idx===2&&at.t<.27)p.x+=p.face*260*dt;if(m.air)p.x+=p.face*(at.kind==='kick'?150:90)*dt;
 if(at.t>=m.active&&at.t<m.active+(m.heavy?.20:.09)){
 for(const e of G.enemies){const dx=e.x-p.x;if(e.hp>0&&!at.hit.has(e.id)&&Math.abs(dx)<m.reach+(e.type==='boss'?20:e.type==='guard'?10:0)&&dx*p.face>-25&&sameLane(e,p,m.heavy?.23:.18)){at.hit.add(e.id);damageEnemy(e,m.dmg,m.push,m.heavy);hitFeel(m.heavy)}}
 if(m.heavy)for(const s of G.shots){if(!s.reflected&&!at.reflected.has(s.id)&&Math.abs(s.x-p.x)<m.reach+18&&sameLane(s,p,.22)){const g=reflectGrade(s,at,p),R=REFLECT[g];s.reflected=true;s.grade=g;s.dmg=R.dmg;s.gs=R.scale;s.vx=p.face*(500+g*90);s.vz=0;s.col=R.col;s.life=3;at.reflected.add(s.id);G.stats.reflections++;if(g===2)G.stats.perfects=(G.stats.perfects||0)+1;G.score+=R.score;uiPulse('reflect');ring(s.x,s.z,R.col,R.ring);blast(s.x,s.z,R.col,R.m);if(g>0){particle(s.x,foot(s.z)-74,R.col,12+g*14,1.4+g*.5);ring(s.x,s.z,'#ffffff',R.ring*.6)}if(g===2){G.hitstop=Math.max(G.hitstop,.06);G.shake=Math.max(G.shake,6);const twin={...s,id:++serial,z:clamp(s.z+.12,.05,.95),vz:.05,gs:R.scale*.92};s.z=clamp(s.z-.12,.05,.95);s.vz=-.05;G.shots.push(twin);G.stats.doubles=(G.stats.doubles||0)+1}Sound.fx(R.sfx)}}}
 if(at.kind==='kick'&&at.idx===2&&at.t>=.28&&!at.landed){at.landed=true;particle(p.x,foot(p.z)-2,'#b8ae91',8,.45);ring(p.x,p.z,'#e5d4ae66',32)}
 if(at.t>=m.dur){p.attack=null;p.chainLife=.65}}
 if(G.gate.active){if(G.cam<G.gate.lock-.4)G.cam=Math.min(G.gate.lock,G.cam+Math.max(45*dt,(G.gate.lock-G.cam)*(1-Math.exp(-dt*7))));p.x=clamp(p.x,G.cam+25,G.cam+W-25)}else{p.x=Math.max(G.gate.min+25,p.x);G.cam+=(G.gate.camera(p.x,W)-G.cam)*(1-Math.exp(-dt*10));const next=G.wave+1;if(next<WAVES.length){G.cam=Math.min(G.cam,next*G.span);if(p.x>=next*G.span+W*.27)beginWave(next)}}
 for(const e of G.enemies)updateEnemy(e,dt);for(let i=0;i<G.enemies.length;i++){const e=G.enemies[i];if(e.hp<=0||e.cast>0)continue;for(let j=i+1;j<G.enemies.length;j++){const f=G.enemies[j];if(f.hp>0&&Math.abs(f.x-e.x)<42&&Math.abs(f.z-e.z)<.12){e.z=clamp(e.z-dt*.17,.12,.94);f.z=clamp(f.z+dt*.17,.12,.94)}}}
 for(const s of G.shots){s.x+=s.vx*dt;s.z+=s.vz*dt;s.life-=dt;trail(s,dt);if(s.reflected){for(const e of G.enemies){if(e.hp>0&&Math.abs(e.x-s.x)<e.radius+12&&sameLane(e,s,.19)){const g=s.grade||0;blast(s.x,s.z,REFLECT[g].col,1.8+g*.5);damageEnemy(e,s.dmg||55,65+g*35,true,true);s.life=0;hitFeel(true);if(g>0){particle(s.x,foot(s.z)-74,REFLECT[g].col,10+g*10,1.5+g*.4)}break}}}else if(Math.abs(s.x-p.x)<22+s.r&&sameLane(p,s,.13)&&p.h<66){if(hurt(24,s.x)){blast(s.x,s.z,s.col,1.3);s.life=0}}if(s.x<G.cam-80||s.x>G.cam+W+80||s.z<0||s.z>1.15)s.life=0}
 G.shots=G.shots.filter(s=>s.life>0);
 for(const h of G.hazards){h.t+=dt;if(h.t>=h.delay&&!h.fired){h.fired=true;blast(h.x,h.z,'#90efc8',1.5,foot(h.z)-30);ring(h.x,h.z,'#a2f9ce',h.r*1.5);particle(h.x,foot(h.z),'#b0ffd4',18,1.3);if(Math.abs(p.x-h.x)<h.r&&Math.abs(p.z-h.z)<.22&&p.h<30)hurt(32,h.x);Sound.fx('heavy')}}G.hazards=G.hazards.filter(h=>h.t<h.delay+.5);
 if(!G.training&&G.enemies.length&&G.enemies.every(e=>e.hp<=0)){if(G.wave===5){G.winTime-=dt;if(G.winTime<=0)finish(true)}else if(G.gate.active){G.gate.clear();G.p.hp=Math.min(120,G.p.hp+16);G.score+=500;notice('魔力障壁、崩壊。進め →  /  体力回復',3);ring(p.x,p.z,'#a8d9a4',90);Sound.fx('break')}}
 if(G.training){p.hp=120;p.rage=Math.min(100,p.rage+dt*15)}
}
function foot(z){return H*.59+z*H*.30}
function polygon(points,fill,stroke=null,lw=1.5){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function line(points,col,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=col;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function ellipse(x,y,rx,ry,col,stroke=null,lw=1){ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);if(col){ctx.fillStyle=col;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
function glow(x,y,r,col){MagicFx.glow(ctx,x,y,r,col)}
function rune(x,y,r,col,t=0){MagicFx.rune(ctx,x,y,r,col,t)}
// Character design uses articulated limbs, broad shoulder/hip silhouettes and painted facets.
function limb(a,b,c,width,col,light){line([a,b,c],'#141d1b',width+4);line([a,b,c],col,width);line([[a[0]-2,a[1]-3],[b[0]-2,b[1]-3],[c[0]-2,c[1]-3]],light,width*.28)}
function fist(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);polygon([[-10,-9],[1,-12],[10,-8],[12,3],[6,9],[-7,8],[-12,1]],'#e3ae79','#27312b',1.7);polygon([[-10,-9],[1,-12],[10,-8],[6,-3],[-8,-2]],'#f3d0a0');line([[-7,-1],[6,-1]],'#946546',1);line([[1,-9],[1,-3]],'#aa7753',1);ctx.restore()}
// Each move has its own authored contact and recovery poses. Pose timing follows
// the combat active window, rather than a cosmetic loop disconnected from hits.
function heroPose(p){
 if(p.stun>0)return{frame:28,shift:-5,bob:0};
 if(p.burst>0)return{frame:29,shift:0,bob:0};
 if(p.dash>0)return{frame:27,shift:8,bob:-2};
 const a=p.attack;
 if(a&&a.m.air){const t=a.t,m=a.m;return a.kind==='kick'?{frame:t<m.active?22:24,shift:6,bob:0,flying:true}:{frame:t<m.active?9:t<m.active+.14?10:11,shift:t<m.active?-2:8,bob:0,flying:true}}
 if(p.h>0)return{frame:22,shift:0,bob:0,flying:true};
 if(p.land>0&&!a)return{frame:26,shift:0,bob:0};
 if(a){const t=a.t,m=a.m;
  if(a.kind==='kick'&&a.idx===2){const frame=t<.025?21:t<.065?22:t<m.active?23:t<.28?24:t<.48?25:26;return{frame,shift:t<.28?6:0,bob:0}}
  const base=a.kind==='punch'?6+a.idx*3:15+a.idx*3;
  const end=m.active+(m.heavy?.13:.075),contact=t>=m.active&&t<end;
  const shift=t<m.active?-2:Math.max(0,1-(t-m.active)/(m.dur-m.active))*(a.idx===2?12:7);
  return{frame:base+(t<m.active?0:contact?1:2),shift,bob:0};
 }
 return{frame:p.moving?2+Math.floor(p.walk/Math.PI*2)%4:Math.floor(G.visual*1.5)%2,shift:0,bob:p.moving?Math.sin(p.walk*2)*.8:Math.sin(G.visual*2)*.65};
}
function atlas(name,frame,cols,rows,x,y,w,h){const im=Art.images[name],sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;ctx.drawImage(im,(frame%cols)*sw,Math.floor(frame/cols)*sh,sw,sh,x,y,w,h)}
function hero(p,x,y,scale=1,showcase=false){
 if(!Art.ready.hero)return heroFallback(p,x,y,scale,showcase);
 const pose=heroPose(p),im=Art.images.hero,r=Art.heroFrames[pose.frame],unit=.83,air=pose.flying?0:[22,23,24].includes(pose.frame)?(pose.frame===22?23:38):0;
 ctx.save();ctx.translate(x,y);ctx.scale(scale*p.face,scale);
 if(p.inv>0&&!showcase&&Math.floor(G.visual*22)%2===0)ctx.globalAlpha*=.64;
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const bottom=Art.bounds.hero?.[pose.frame]?.bottom||1;ctx.drawImage(im,r.sx,r.sy,r.sw,r.sh,-r.anchor*unit+pose.shift,-r.sh*bottom*unit+pose.bob-air,r.sw*unit,r.sh*unit);ctx.restore();
}
function mage(e,x,y,scale=1,showcase=false){
 if(!Art.ready.enemies)return mageFallback(e,x,y,scale,showcase);
 const col={ember:0,frost:1,guard:2,boss:3}[e.type],casting=e.cast>0,frame=col+(casting?4:0),im=Art.images.enemies;
 const dh=192,dw=dh*(im.naturalWidth/4)/(im.naturalHeight/2);
 ctx.save();ctx.translate(x,y);ctx.scale(scale*e.face,scale);
 if(e.hp<=0){ctx.globalAlpha*=clamp(e.dead/.7,0,1);ctx.translate(0,(.7-e.dead)*25);ctx.rotate((.7-e.dead)*-.5)}
 if(e.flash>0)ctx.globalAlpha*=.75;if(e.blink>0)ctx.globalAlpha*=Math.max(.1,e.blink/.26);
 const bob=Math.sin(G.visual*2+e.id)*1.1;
 atlas('enemies',frame,4,2,-dw*.48,-dh*(Art.bounds.enemies?.[frame]?.bottom||.92)+bob,dw,dh);ctx.restore();
 if(casting&&e.type!=='guard'){MagicFx.charge(ctx,x+e.face*28,y-74,1-e.cast/e.castTotal,elemCol(e),G.visual+e.id,fxs*(e.type==='boss'?1.35:1),lod())}else if(casting||showcase){glow(x+e.face*30*scale,y-110*scale,25*scale,e.type==='ember'?'#ffa56955':'#a2dbe855')}
 if((e.shield||e.armor>0)&&e.hp>0){ctx.save();ctx.globalAlpha=.42;rune(x,y,48*scale,e.armor>0?'#e6c38e':'#95f5d1',G.visual);ellipse(x,y-72*scale,47*scale,79*scale,null,e.armor>0?'#e6c38e88':'#95f5d188',1.5);ctx.restore()}
}
const sceneryCache=document.createElement('canvas');let sceneryKey='';
function background(){
 if(!Art.ready.scenes)return backgroundFallback();
 const area=G.mode==='title'?0:G.area,key=[area,Math.ceil(W),H,DPR,viewScale].join(':');
 if(key!==sceneryKey){const im=Art.images.scenes,sw=im.naturalWidth/2,sh=im.naturalHeight/2;sceneryCache.width=Math.ceil(canvas.width*1.12);sceneryCache.height=canvas.height;const c=sceneryCache.getContext('2d',{alpha:false});c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  // Preserve the horizon vertically in both phone and landscape orientations.
  const sourceWidth=Math.min(sw,sh*W*1.12/H),sourceX=(area%2)*sw+(sw-sourceWidth)*.5;
  c.drawImage(im,sourceX,Math.floor(area/2)*sh,sourceWidth,sh,0,0,sceneryCache.width,sceneryCache.height);sceneryKey=key;
 }
 const scroll=G.mode==='title'?(Math.sin(G.visual*.07)*.5+.5):clamp((G.cam-G.wave*G.span)/G.span,0,1);const sc=DPR*viewScale,ox=Math.round(scroll*W*.12*sc)/sc;ctx.drawImage(sceneryCache,-ox,0,sceneryCache.width/sc,H);
 // Small light and atmosphere overlays keep the painted stage alive without
 // filtering or repainting the large environment texture for every input.
 const t=G.visual;for(let i=0;i<16*quality;i++){let x=(i*127.31+t*(3+i%4)-G.cam*.15)%(W+40);if(x<0)x+=W+40;const y=60+(i*47.7+t*(i%2?-.6:.7))%(H*.65);ctx.fillStyle=area===3?'#ffa76b77':'#ede0a355';ctx.fillRect(x,y,1.5,1.5)}
 if(area===3){ctx.globalAlpha=.08+Math.sin(t*3)*.025;ctx.fillStyle='#ec773b';ctx.fillRect(0,H*.55,W,H*.45);ctx.globalAlpha=1}
}
function heroFallback(p,x,y,scale=1,showcase=false){ctx.save();ctx.translate(x,y);ctx.scale(scale*p.face,scale);let at=p.attack,u=at?clamp(at.t/at.m.dur,0,1):0,walk=p.moving?Math.sin(p.walk):Math.sin(G.visual*2)*.12;let bob=p.moving?Math.abs(Math.sin(p.walk))*3:Math.sin(G.visual*2)*1.5;let drop=at?.kind==='kick'&&at.idx===2;
 if(p.inv>0&&!showcase&&Math.floor(G.visual*22)%2===0)ctx.globalAlpha=.58;
 if(drop){ctx.translate(0,-Math.sin(u*Math.PI)*39);ctx.rotate(-Math.sin(u*Math.PI)*.72)}
 let lean=at?.kind==='punch'?Math.sin(Math.min(1,u*2)*Math.PI)*7:0;
 ctx.translate(lean,bob);
 // fluttering crimson mantle behind the torso
 polygon([[-22,-140],[-39,-138],[-51,-101],[-62-Math.sin(G.visual*5)*6,-73],[-32,-81],[-13,-119]],'#873e36','#1b2925');polygon([[-37,-130],[-44,-100],[-54,-88],[-31,-99]],'#b95642');
 let leg1=[[-14,-62],[-20+walk*10,-32],[-24+walk*17,-4]],leg2=[[14,-62],[20-walk*10,-32],[21-walk*17,-4]];
 if(at?.kind==='kick'){let k=Math.sin(clamp((u-.05)*2.2,0,1)*Math.PI);if(at.idx===2){leg1=[[-12,-60],[25,-69],[69,-70]];leg2=[[14,-62],[43,-57],[84,-58]]}else if(at.idx===0)leg2=[[14,-63],[34+k*20,-70],[27+k*66,-63]];else leg1=[[-12,-61],[19+k*21,-56],[20+k*71,-44]]}
 limb(...leg1,21,'#364c42','#6d7a5c');limb(...leg2,23,'#465b4a','#899271');
 for(const leg of[leg1,leg2]){const k=leg[1],f=leg[2];line([[k[0],k[1]+8],f],'#48372d',20);line([[k[0]-5,k[1]+9],[f[0]-5,f[1]]],'#907053',3);polygon([[f[0]-10,f[1]-5],[f[0]+9,f[1]-5],[f[0]+20,f[1]+1],[f[0]+19,f[1]+6],[f[0]-11,f[1]+6]],'#242923','#0d1616',2)}
 let skin='#c18d61',light='#e7b880';
 polygon([[-33,-131],[-19,-145],[19,-143],[37,-128],[27,-102],[19,-72],[-24,-71],[-34,-105]],skin,'#172521',2.5);
 polygon([[-25,-128],[-7,-138],[0,-112],[-19,-107],[-31,-114]],light);polygon([[2,-137],[20,-136],[30,-123],[21,-109],[3,-113]],'#e3b07a');polygon([[-18,-102],[-1,-108],[16,-103],[13,-81],[-17,-81]],'#d5a16b');line([[0,-111],[-1,-86]],'#90664a',1.5);line([[-14,-95],[-2,-97],[10,-94]],'#996c4b',1.2);
 // diagonal leather harness and forged shoulder guard
 polygon([[-28,-141],[-17,-144],[26,-84],[17,-78]],'#40483a','#1f2b24',1);line([[-20,-141],[22,-83]],'#899376',2);polygon([[-34,-137],[-41,-126],[-32,-109],[-20,-116],[-18,-132]],'#9a9c76','#28392c',2);polygon([[-36,-133],[-24,-133],[-22,-125],[-31,-119]],'#ced1a2');
 polygon([[-26,-78],[22,-78],[25,-63],[-23,-61]],'#573c2c','#202b21',2);ctx.fillStyle='#d5b770';ctx.fillRect(-4,-77,14,13);ctx.fillStyle='#53553b';ctx.fillRect(0,-74,6,7);polygon([[13,-63],[20,-61],[25,-27],[8,-35]],'#a04939');
 let left=[[-28,-125],[-42,-102],[-19,-94]],right=[[29,-126],[48,-105],[44,-127]];
 if(showcase){left=[[-28,-125],[-42,-99],[-26,-78]];right=[[29,-126],[47,-112],[46,-141]]}
 if(at?.kind==='punch'){const ext=Math.sin(clamp((u-.03)*2,0,1)*Math.PI);if(at.idx===0)left=[[-27,-123],[9+ext*23,-119],[28+ext*58,-116]];else if(at.idx===1)right=[[27,-125],[32+ext*27,-122],[43+ext*58,-117]];else{left=[[-27,-123],[10+ext*31,-111],[27+ext*72,-108]];right=[[28,-124],[35+ext*28,-121],[40+ext*64,-119]]}}
 limb(...left,22,skin,light);const lh=left[2];line([[lh[0]-7,lh[1]+2],lh],'#d5d3a7',24);fist(...lh,1.05);
 // head and sculpted swept hair
 polygon([[-9,-151],[-8,-166],[13,-169],[22,-155],[18,-140],[6,-132],[-6,-140]],'#d4a16e','#293327',2);polygon([[1,-161],[13,-164],[18,-154],[14,-146],[3,-149]],'#edc393');polygon([[-12,-163],[-9,-176],[2,-181],[17,-178],[23,-169],[15,-159],[4,-164],[-6,-152]],'#303e32','#13231c',2);polygon([[-8,-171],[2,-177],[17,-174],[7,-169]],'#66735a');line([[8,-154],[17,-154]],'#403828',2);ctx.fillStyle='#ebdfbd';ctx.fillRect(12,-154,3,1.6);polygon([[18,-151],[24,-147],[17,-145]],'#bc885b');line([[7,-139],[15,-140]],'#6d4c32',1.5);line([[-1,-161],[2,-154]],'#b6684c',2);
 limb(...right,24,skin,light);const rh=right[2];line([[rh[0]-7,rh[1]+4],rh],'#dfdab0',25);line([[rh[0]-7,rh[1]+4],rh],'#999977',2);fist(...rh,1.15);
 // contour rim light
 line([[-31,-131],[-23,-141],[-16,-142]],'#f7db9c',2);
 ctx.restore()}
function mageFallback(e,x,y,scale=1,showcase=false){ctx.save();ctx.translate(x,y);ctx.scale(scale*e.face,scale);const boss=e.type==='boss',guard=e.type==='guard',frost=e.type==='frost';let bob=Math.sin(G.visual*3+e.id)*3;if(e.hp<=0){ctx.globalAlpha=clamp(e.dead/.7,0,1);ctx.translate(0,(.7-e.dead)*28);ctx.rotate((.7-e.dead)*-.5)}if(e.flash>0)ctx.globalAlpha=.75;if(e.blink>0)ctx.globalAlpha=Math.max(.1,e.blink/.26);ctx.translate(0,bob);let col=boss?'#314c44':frost?'#356271':guard?'#5b6454':'#813f38',light=boss?'#709380':frost?'#689fab':guard?'#a0aa87':'#c17e5d';
 if(boss){polygon([[-29,-129],[-57,-149],[-76,-79],[-96,-16],[-60,-25],[-43,4],[-22,-30]],'#243c36','#132923',2);polygon([[22,-128],[56,-153],[67,-75],[89,-7],[40,-15]],'#304d42','#162920',2)}
 polygon([[-22,-109],[-31,-74],[-35-Math.sin(G.visual*2)*3,-9],[-17,-15],[-5,-6],[9,-14],[30,-8],[20,-86],[16,-111]],col,'#182822',2.5);polygon([[-14,-102],[-21,-24],[-4,-12],[2,-108]],light);polygon([[9,-104],[13,-58],[22,-15],[8,-24],[-2,-99]],boss?'#476555':frost?'#294653':'#492e2d');line([[-26,-14],[-16,-17],[-5,-9],[9,-16],[27,-11]],'#b9b187',2);line([[-4,-92],[-6,-28]],'#cbbb83',1.5);
 limb([-17,-104],[-35,-84],[-48,-99],12,col,light);limb([17,-101],[32,-83],[44,-89],13,col,light);ellipse(-48,-99,7,8,'#a2af8d');ellipse(44,-89,6,7,'#a2af8d');
 // staff
 line([[48,-10],[44,-137]],'#2a382f',6);line([[47,-12],[43,-139]],'#c0af79',2);polygon([[43,-147],[33,-136],[43,-125],[53,-136]],boss?'#a0dfbc':frost?'#8acbd8':'#e4a278','#e4d4a0',1);if(e.cast>0||showcase){glow(43,-137,40,boss?'#7de5b077':'#d8b68855');rune(43,-137,24+(e.cast||.2)*12,'#bce5c4',G.visual*2)}
 polygon([[-22,-107],[-25,-131],[-12,-153],[9,-149],[24,-125],[14,-105]],col,'#172820',2);polygon([[-15,-123],[-8,-139],[8,-137],[16,-121],[5,-110],[-11,-113]],'#0b1b1a');line([[-8,-124],[-2,-123]],'#c9f6d0',2);line([[5,-123],[11,-125]],'#c9f6d0',2);line([[-23,-131],[-11,-149],[6,-146]],light,2);
 if(boss){polygon([[-19,-145],[-27,-172],[-8,-159],[2,-179],[11,-157],[30,-169],[21,-143]],'#bcb87e','#28382d',2);polygon([[-18,-144],[20,-142],[17,-135],[-15,-137]],'#e1d99b');ellipse(1,-148,4,5,'#97e3bf');polygon([[-30,-119],[-46,-127],[-46,-105],[-26,-98]],'#8c9d7b','#1d332a',2);polygon([[21,-118],[36,-130],[42,-107],[22,-97]],'#8c9d7b','#1d332a',2)}
 if(guard){polygon([[-27,-135],[-5,-157],[20,-135],[15,-111],[-14,-107]],'#788c79','#172b23',2);line([[-14,-130],[13,-130]],'#101f1b',5);line([[-3,-147],[-2,-116]],'#d6c88e',2);polygon([[31,-105],[61,-111],[69,-64],[47,-45],[29,-63]],'#476157','#9db59b',2);rune(49,-81,20,'#8ac9ac',0)}
 ctx.restore();if(e.armor>0&&e.hp>0){ctx.save();ctx.globalAlpha=.4;rune(x,y,58*scale,'#e6c38e',G.visual);ellipse(x,y-75*scale,51*scale,84*scale,null,'#dccc8855',1.5);ctx.restore()}if(e.shield&&e.hp>0){ctx.save();ctx.globalAlpha=.3+Math.sin(G.visual*4)*.1;ellipse(x,y-70*scale,50*scale,80*scale,null,'#95f5d1',2);ctx.restore()}}
function arch(x,y,w,h,lit=false){ctx.fillStyle='#102325';ctx.fillRect(x-w/2,y-h+w*.5,w,h-w*.5);ctx.beginPath();ctx.arc(x,y-h+w*.5,w*.5,Math.PI,0);ctx.fill();ctx.strokeStyle='#71948140';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-w/2,y);ctx.lineTo(x-w/2,y-h+w*.5);ctx.arc(x,y-h+w*.5,w*.5,Math.PI,0);ctx.lineTo(x+w/2,y);ctx.stroke();if(lit){const g=ctx.createLinearGradient(x,y-h,x,y);g.addColorStop(0,'#90c0a061');g.addColorStop(1,'#8bc0a000');ctx.fillStyle=g;ctx.fillRect(x-w*.3,y-h+w*.6,w*.6,h-w*.6);line([[x,y-h+w*.6],[x,y]],'#71957930',2)}}
function backgroundFallback(){const t=G.visual,area=G.mode==='title'?0:G.area,cam=G.mode==='title'?t*8:G.cam;let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,area===3?'#112024':'#0b2029');sky.addColorStop(.48,area===2?'#496460':'#50675f');sky.addColorStop(1,'#172d2b');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // atmospheric moon, eclipse and etched mountain ridges
 const mx=W*.74-cam*.015%60,my=H*.23;glow(mx,my,155,'#c2d6b322');ellipse(mx,my,46,46,'#c7d0af');ellipse(mx+17,my-7,44,44,'#334e4e');ellipse(mx,my,57,57,null,'#b1c9ae20');
 for(let l=0;l<3;l++){const y=H*(.3+l*.09);let pts=[[-50,H*.64]];for(let x=-50;x<W+55;x+=28){let v=x+cam*(.03+l*.08);pts.push([x,y+Math.sin(v*.007+l)*24+Math.sin(v*.023+2)*14])}pts.push([W+60,H*.64]);polygon(pts,['#385754','#2a4643','#203b37'][l])}
 // vast fortress silhouette
 const cx=W*.72-(cam*.09%100),base=H*.50;ctx.fillStyle='#152e30';ctx.fillRect(cx-145,base-112,290,150);
 for(let i=-2;i<=2;i++){const x=cx+i*58,h=110+(i===0?100:Math.abs(i)===1?45:5);polygon([[x-19,base],[x-19,base-h],[x,base-h-48],[x+19,base-h],[x+19,base]],'#163131');line([[x-19,base-h],[x,base-h-48],[x+19,base-h]],'#83a19135',1);for(let j=0;j<3;j++){ctx.fillStyle='#9cbca036';ctx.fillRect(x-3,base-h+24+j*29,5,13)}}
 // huge aqueduct arches or interior columns, cached by simple bounded geometry
 const gap=185,off=(cam*.43)%gap;for(let i=-1;i<W/gap+1;i++){const x=i*gap-off;ctx.fillStyle=area===3?'#273e38':'#2c443d';ctx.fillRect(x-20,H*.20,40,H*.42);ctx.fillStyle='#536350';ctx.fillRect(x-26,H*.20,52,8);ctx.fillStyle='#18312c';ctx.fillRect(x-12,H*.24,8,H*.35);arch(x+gap/2,H*.60,gap-44,H*.34,true);line([[x+15,H*.24],[x+15,H*.6]],'#89977b33',2);if(area>0){ctx.fillStyle=i%2?'#573c32':'#3e5d4e';ctx.fillRect(x-7,H*.25,17,90);polygon([[x-7,H*.25+90],[x+10,H*.25+90],[x+2,H*.25+106]],i%2?'#573c32':'#3e5d4e')}}
 // Landmarks make each chapter readable beyond its colour palette.
 if(area===1){for(let i=0;i<3;i++){const x=(i+.5)*W/3;glow(x,H*.49,64,'#e8a35a28');polygon([[x-5,H*.51],[x-10,H*.47],[x-1,H*.42],[x+9,H*.47],[x+6,H*.51]],'#b67b48');polygon([[x-3,H*.50],[x-4,H*.46],[x+2,H*.44],[x+4,H*.49]],'#f2cc84')}}
 if(area===2){const x=W*.53;ctx.save();ctx.translate(x,H*.41);ctx.scale(1,2.15);rune(0,0,73,'#a6d3b15c',t*.1);ctx.restore();line([[x-85,H*.23],[x-85,H*.59]],'#98a98a44',4);line([[x+85,H*.23],[x+85,H*.59]],'#98a98a44',4)}
 if(area===3){const x=W*.73;polygon([[x-65,H*.58],[x-50,H*.26],[x-28,H*.30],[x,H*.16],[x+28,H*.30],[x+50,H*.26],[x+65,H*.58]],'#172e2b','#a3aa7355',3);polygon([[x-34,H*.54],[x-28,H*.33],[x,H*.24],[x+28,H*.33],[x+34,H*.54]],'#486454','#81937155',2);for(let i=-2;i<=2;i++)line([[x+i*13,H*.49],[x+i*10,H*.32]],'#b9b58544',2);polygon([[x-70,H*.58],[x-70,H*.53],[x-48,H*.50],[x-38,H*.54],[x+38,H*.54],[x+48,H*.50],[x+70,H*.53],[x+70,H*.58]],'#4c634e','#b1b28b66',2);glow(x,H*.35,110,'#d8cb7533')}
 // drifting luminous fog
 const fog=ctx.createLinearGradient(0,H*.4,0,H*.68);fog.addColorStop(0,'#9fbaa000');fog.addColorStop(.6,'#9fbaa031');fog.addColorStop(1,'#9fbaa000');ctx.fillStyle=fog;ctx.fillRect(0,H*.4,W,H*.3);
 // stone fighting floor with perspective seams
 const floor=ctx.createLinearGradient(0,H*.585,0,H);floor.addColorStop(0,'#62715c');floor.addColorStop(.05,'#3b5145');floor.addColorStop(1,'#192c28');ctx.fillStyle=floor;ctx.fillRect(0,H*.585,W,H*.415);ctx.fillStyle='#a8ad8277';ctx.fillRect(0,H*.585,W,2);
 for(let j=0;j<6;j++){const y=H*.60+(j*j/25)*H*.42;line([[0,y],[W,y]],'#101f1cc0',1.3);const ww=80+j*22,offset=cam%(ww);for(let i=-1;i<W/ww+2;i++){const x=i*ww-offset+(j%2)*ww*.5;line([[x,y],[x+(x-W/2)*.025,y+H*.013*(j+1)]],'#162a23a0',1)}}
 // cracks, puddles and moss
 for(let i=0;i<16;i++){const x=((i*139-cam*.99)%(W+200)+W+200)%(W+200)-80,y=H*.64+(i*71%160);if(i%3===0){ellipse(x,y,43,4,'#8da78812');line([[x-30,y],[x+22,y]],'#b0b39820',1)}else{line([[x,y],[x+14,y+2],[x+17,y+8],[x+31,y+10]],'#0c242080',1);ctx.fillStyle='#70804f42';ctx.fillRect(x+5,y+4,15,3)}}
 // broken balustrade and magic lanterns
 for(let i=-1;i<W/210+1;i++){const x=i*210-(cam*.92%210);polygon([[x,H*.59],[x+20,H*.59],[x+17,H*.51],[x+4,H*.51]],'#445448','#83917a55');ctx.fillStyle='#71806a';ctx.fillRect(x+1,H*.505,19,6);if(i%2===0){const y=H*.495;glow(x+10,y,45,'#eec17a22');line([[x+10,y],[x+10,y-35]],'#586351',4);polygon([[x+2,y-29],[x+10,y-45],[x+18,y-29],[x+10,y-20]],'#d8bd81');ellipse(x+10,y-31,3,7,'#f8e6b2')}}
 // filmic vignette and motes
 for(let i=0;i<22*quality;i++){let x=(i*127.31+t*(3+i%4)-cam*.2)%(W+40);if(x<0)x+=W+40;let y=70+(i*47.7+t*(i%2?-.6:.7))%(H*.65);ctx.fillStyle=i%3?'#bad2b545':'#f0c48477';ctx.fillRect(x,y,1.5,1.5)}
}
function drawShadow(x,z,r=30){ellipse(x,foot(z)+4,r,7,'#06161178');ellipse(x,foot(z)+3,r*.66,4,'#06161155')}
function drawAttack(p){if(!p.attack)return;const a=p.attack,t=a.t,m=a.m;if(t<m.active||t>m.active+.14)return;const k=clamp((t-m.active)/.14,0,1),s=depthScale(p.z)*1.03;
 const height=m.air?(a.kind==='kick'?50:110):a.kind==='punch'?(a.idx===2?104:122):a.idx===0?92:a.idx===1?115:85;
 ctx.save();ctx.translate(p.x-G.cam,foot(p.z)-(p.h||0)*s-height*s);ctx.scale(p.face*s,s);ctx.globalAlpha=(1-k)*.7;
 // Compact physical trails leave the fist/foot and contact readable.
 if(a.kind==='punch'){for(let i=0;i<(a.idx===2?2:1);i++){const yy=i*13;const g=ctx.createLinearGradient(24,0,m.reach,0);g.addColorStop(0,'#ffe8ba00');g.addColorStop(1,'#ffe8bab0');line([[24,yy+2],[m.reach-6,yy]],g,3*(1-k)+.7);line([[48,yy-4],[m.reach-13,yy-5]],'#fff4d566',1)}}
 else{ctx.strokeStyle='#eadbc5';ctx.lineWidth=2.5*(1-k)+.5;ctx.beginPath();ctx.ellipse(32,17,78+8*k,45,-.15,-1.4,.12);ctx.stroke();if(a.idx===2)line([[30,14],[m.reach,14]],'#fff1d277',2)}ctx.restore()}
function drawShot(s){const x=s.x-G.cam;if(x<-220||x>W+220)return;MagicFx.shot(ctx,x,foot(s.z)-74,foot(s.z)+3,Math.sign(s.vx)||1,G.visual,s.id,s.col,fxs*s.r/10*(s.reflected?(s.gs||1.2):1)*depthScale(s.z),lod())}
function render(){if(resizePending)resize();ctx.setTransform(DPR*viewScale,0,0,DPR*viewScale,0,0);ctx.save();if(G.shake>0&&!Settings.reduced&&G.mode==='play')ctx.translate(Math.sin(G.visual*110)*G.shake,Math.cos(G.visual*92)*G.shake*.5);background();
 if(G.mode==='title'){const heroX=W<600?W*.78:W*.75,heroY=H*.83;const e={id:0,type:'boss',face:-1,hp:1,cast:0};ctx.globalAlpha=.4;mage(e,W*.94,H*.50,.8,true);ctx.globalAlpha=1;drawShadow(heroX,.8,80);const pp={face:-1,attack:null,walk:0,moving:false,inv:0};hero(pp,heroX,heroY,W<600?1.35:1.65,true);glow(heroX,H*.70,140,'#e5ba7222');}
 else if(G.p){
 for(const h of G.hazards){const x=h.x-G.cam,y=foot(h.z);if(h.t<h.delay){ctx.globalAlpha=.55+h.t/h.delay*.45;rune(x,y,h.r,'#a0ebbf',G.visual*2);ellipse(x,y,h.r*(h.t/h.delay),h.r*.4*(h.t/h.delay),'#a7f4bd18');ctx.globalAlpha=1}else{MagicFx.pillar(ctx,x,y,240,h.r*1.4,'#90efc8',clamp((h.t-h.delay)/.5,0,1),G.visual)}}
 for(const q of G.quakes)drawQuakeGround(q);
 const entities=[...G.enemies.filter(e=>e.hp>0||e.dead>0).map(e=>({e,z:e.z,p:false})),{e:G.p,z:G.p.z,p:true}].sort((a,b)=>a.z-b.z);
 for(const o of entities){const e=o.e,x=e.x-G.cam,y=foot(e.z),s=depthScale(e.z)*(o.p?1.03:e.type==='boss'?1.42:e.type==='guard'?1.3:1);drawShadow(x,e.z,o.p?35*(1-Math.min(.45,(e.h||0)/190)):e.type==='boss'?53:e.type==='guard'?35:27);const yy=y-(o.p?(e.h||0)*s:0);if(!o.p&&e.cast>0){rune(x,y,47+(e.type==='boss'?15:e.type==='guard'?14:0),e.type==='ember'?'#f1b484':'#9edbbd',G.visual);const frac=1-e.cast/e.castTotal;ctx.fillStyle='#111f1ccc';ctx.fillRect(x-24,y-184*s,48,4);ctx.fillStyle='#e9c48b';ctx.fillRect(x-24,y-184*s,48*frac,4)}if(o.p){if(e.dash>0){ctx.globalAlpha=.23;hero(e,x-e.dx*38,yy,1.03);ctx.globalAlpha=1}hero(e,x,yy,s);drawAttack(e)}else{if(e.appear>0)ctx.globalAlpha=clamp(1-e.appear/.5,.04,1);mage(e,x,y,s);ctx.globalAlpha=1;if(e.hp>0&&e.hp<e.maxHP&&e.type!=='boss'){ctx.fillStyle='#101c18';ctx.fillRect(x-20,y-174*s,40,3);ctx.fillStyle='#c0b683';ctx.fillRect(x-20,y-174*s,40*e.hp/e.maxHP,3)}}}
 for(const s of G.shots)drawShot(s);for(const b of G.blasts)MagicFx.blast(ctx,b.x-G.cam,b.y,b.t/b.life,b.col,b.m*fxs);drawChants();
 if(!G.gate.active&&G.wave<5){const x=W-65,y=H*.47;ctx.fillStyle='#e6d4a4';ctx.font='bold 12px monospace';ctx.fillText('GO',x-7,y-20);polygon([[x,y-9],[x+21,y],[x,y+9]],'#e6d4a4');ctx.globalAlpha=.5;line([[x-13,y-8],[x-3,y],[x-13,y+8]],'#e6d4a4',2);ctx.globalAlpha=1}
 }
 for(const r of G.rings){ctx.globalAlpha=Math.max(0,1-r.t/.5);ellipse(r.x-G.cam,foot(r.z),r.r*(r.t/.5),r.r*.34*(r.t/.5),null,r.col,2.5);ctx.globalAlpha=1}
 for(const p of G.particles){ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.col;ctx.fillRect(p.x-G.cam,p.y,p.size,p.size*.65);ctx.globalAlpha=1}
 for(const f of G.floats){const life=f.life||.8;ctx.globalAlpha=clamp(1-(f.t/life)**2,0,1);ctx.textAlign='center';const fx_=f.x-G.cam+(f.dx||0)*f.t,fy_=foot(f.z)-(f.lift||120)-f.t*(f.big?26:40);if(f.big){const fs=f.big*Math.min(1,.7+f.t*3)*Math.max(1,.9/viewScale*.62);ctx.font=`900 ${Math.round(fs)}px 'Hiragino Mincho ProN','Yu Mincho',serif`;ctx.lineJoin='round';ctx.lineWidth=Math.max(3,fs*.16);ctx.strokeStyle='#2a1204';ctx.strokeText(f.text,fx_,fy_);ctx.fillStyle=f.col;ctx.fillText(f.text,fx_,fy_)}else{ctx.font=/^\d+$/.test(f.text)?'bold 18px Georgia':'bold 11px sans-serif';ctx.fillStyle='#10251c';ctx.fillText(f.text,fx_+1,fy_+1);ctx.fillStyle=f.col;ctx.fillText(f.text,fx_,fy_)}ctx.textAlign='left';ctx.globalAlpha=1}
 ctx.restore();
 
 if(G.flash>0&&!Settings.reduced){ctx.fillStyle=`rgba(227,237,176,${G.flash*.6})`;ctx.fillRect(0,0,W,H)}
 if(G.p?.hp<32&&G.mode==='play'){ctx.strokeStyle=`rgba(205,70,44,${.2+Math.sin(G.visual*5)*.1})`;ctx.lineWidth=15;ctx.strokeRect(0,0,W,H)}
}
const hv={},bd=document.body;
function flag(name,on){const k='b.'+name;if(hv[k]!==on){hv[k]=on;bd.classList.toggle(name,on)}}
function setArea(n){if(hv['b.area']!==n){hv['b.area']=n;bd.dataset.area=String(n)}}
function uiPulse(name){bd.classList.remove('pulse-'+name);void bd.offsetWidth;bd.classList.add('pulse-'+name)}
function cv(id,name,v){const k=id+name;if(hv[k]!==v){hv[k]=v;$(id).style.setProperty(name,v)}}
function hudReset(){for(const k in hv)delete hv[k]}
function txt(id,v){if(hv[id]!==v){hv[id]=v;$(id).textContent=v}}
function sty(id,prop,v){const k=id+'.'+prop;if(hv[k]!==v){hv[k]=v;$(id).style[prop]=v}}
function hud(){const p=G.p;if(!p)return;sty('hpFill','width',(100*p.hp/120)+'%');txt('hpText',String(Math.ceil(p.hp)));sty('rageFill','width',p.rage+'%');txt('rageLabel',p.rage>=100?'震撃 READY / U':'闘気 '+Math.floor(p.rage)+' / 100');sty('burst','filter',p.rage>=100?'brightness(1.4)':'');txt('areaText',String(G.area+1).padStart(2,'0')+' / '+AREAS[G.area][0]);txt('scoreText',String(G.score).padStart(6,'0'));$('combo').classList.toggle('hidden',G.combo<2);txt('comboCount',String(G.combo));txt('moveName',G.lastMove);const boss=G.enemies.find(e=>e.type==='boss'&&e.hp>0);$('bossHud').classList.toggle('hidden',!boss||G.mode==='title');if(boss){sty('bossFill','width',100*boss.hp/boss.maxHP+'%');txt('bossPhase',boss.phase===2?'Ⅱ / 禁呪解放':'Ⅰ / 王の詠唱')}sty('dash','opacity',p.dashCD>0?'.55':'1');txt('hint',p.rage>=100?'闘気が満ちた。震撃で突破。':G.combo>2?'三撃目で、魔法を砕く。':'押し続けて、3連撃');cv('burst','--rage',String(Math.round(p.rage)));flag('danger',G.mode==='play'&&p.hp<38);flag('rage',p.rage>=100);flag('boss',!!boss);flag('casting',G.enemies.some(e=>e.hp>0&&e.cast>0&&e.type!=='guard'));flag('hot',G.combo>=5)}
// Auto quality: two consecutive slow ~2 s windows step the render scale down (1 > .8 > .65 > .5).
let slowStreak=0;const LEVELS=[1,.8,.65,.5];
function adapt(){if(Settings.quality!=='auto'||G.mode!=='play'||frameMS.length<100)return;if(fps<50){if(++slowStreak>=2){const i=LEVELS.indexOf(quality);if(i>=0&&i<LEVELS.length-1){quality=LEVELS[i+1];resizePending=true}slowStreak=0}}else slowStreak=0}
function frame(t){const rawElapsed=previous?(t-previous)/1000:1/60,elapsed=Math.min(.05,rawElapsed);previous=t;frameMS.push(rawElapsed*1000);if(frameMS.length>120)frameMS.shift();G.visual+=elapsed;G.shake=Math.max(0,G.shake-elapsed*25);G.flash=Math.max(0,G.flash-elapsed);if(G.mode==='play'){if(G.hitstop>0)G.hitstop=Math.max(0,G.hitstop-elapsed);else{const total=Math.min(elapsed,.05),n=Math.max(1,Math.ceil(total*120-1e-6)),sub=total/n;for(let i=0;i<n;i++){update(sub);if(G.mode!=='play')break}}Sound.tick()}else{acc=0;Input.drain()}
 if(G.mode!=='pause'){for(const p of G.particles){p.life-=elapsed;p.x+=p.vx*elapsed;p.y+=p.vy*elapsed;p.vy+=300*elapsed}G.particles=G.particles.filter(p=>p.life>0);for(const f of G.floats)f.t+=elapsed;G.floats=G.floats.filter(f=>f.t<(f.life||.8));for(const r of G.rings)r.t+=elapsed;G.rings=G.rings.filter(r=>r.t<.5);for(const b of G.blasts)b.t+=elapsed;G.blasts=G.blasts.filter(b=>b.t<b.life);for(const q of G.quakes)q.t+=elapsed;G.quakes=G.quakes.filter(q=>q.t<q.life)}
 render();hudTimer+=elapsed;renderCount++;if(hudTimer>.1){hud();hudTimer=0}if(renderCount%60===0){fps=Math.round(1000/(frameMS.reduce((a,b)=>a+b,0)/frameMS.length));txt('perf',`${fps} FPS · ${Input.moveEvent==='pointerrawupdate'?'RAW':'POINTER'}`);adapt()}
 frameId=requestAnimationFrame(frame)}
applySettings();resize();requestAnimationFrame(frame);for(const ev of['pointerdown','pointerup','click','touchend','keydown'])addEventListener(ev,()=>Sound.unlock(),{capture:true,passive:true});
// A readonly snapshot supports repeatable playtesting without giving normal play any bypass.
window.__iron={snapshot:()=>JSON.parse(JSON.stringify({mode:G.mode,time:G.time,wave:G.wave,area:G.area,cam:G.cam,W,H,active:G.gate.active,player:G.p,enemies:G.enemies,shots:G.shots,hazards:G.hazards,score:G.score,combo:G.combo,moves:G.movesUsed,stats:G.stats,fps,inputLatency:Input.latency,inputMetrics:Input.metrics,audio:Sound.state,music:Music.state,quality,dpr:DPR,audioBaseLatency:Sound.baseLatency,inputEvent:Input.moveEvent,art:{ready:Art.ready,failed:Art.failed,heroPose:G.p?heroPose(G.p):null}})),moves:MOVES};
// Deterministic fixtures are available ONLY with the explicit testing query string.
if(new URLSearchParams(location.search).get('test')==='1')window.__iron.test={start,beginWave,attack,dash,burst,jump,hurt,damageEnemy,step:dt=>update(dt),place:(v)=>Object.assign(G.p,v),enemy:(type,x,z)=>{const e=createEnemy(type,x,z);G.enemies.push(e);return e.id},resetEnemies:()=>{G.enemies=[]},shot:(v)=>{G.shots.push({id:++serial,x:G.p.x+70,z:G.p.z,vx:-195,vz:0,life:4,col:'#ffac72',r:10,reflected:false,...v})},setEnemies:arr=>{G.enemies=arr.map(e=>Object.assign(createEnemy(e.type,e.x,e.z),e))},setMode:v=>{G.mode=v},get state(){return G}};
})();
