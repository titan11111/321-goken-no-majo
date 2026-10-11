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
