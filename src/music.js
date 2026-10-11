// BGM: one <audio> element whose src is swapped per scene.
// iOS only lets an element that was started inside a user gesture play later, so a second element per track would stay silent.
// iOS also ignores element.volume, so loudness is fixed at encode time (all tracks normalised to about -17 LUFS).
// Scenes: title/ending = iron, area 1 = strike, area 2-3 = lock, boss = standoff.
const Music=(()=>{
 const FILES={iron:'audio/iron-hour.m4a',strike:'audio/calculated-strike.m4a',lock:'audio/hard-target-lock.m4a',standoff:'audio/longest-standoff.m4a'};
 let el=null,key='iron',on=true,unlocked=false,err='';
 function ensure(){if(el)return el;try{el=new Audio();el.preload='auto';el.loop=true;el.setAttribute('playsinline','');el.addEventListener('error',()=>{err='load:'+key});el.addEventListener('playing',()=>{err=''})}catch{el=null}return el}
 function play(){const a=ensure();if(!a||!unlocked)return;if(a._key!==key){a._key=key;a.src=FILES[key];try{a.load()}catch{}}
  if(!on||Settings.mute){a.pause();return}a.muted=false;const p=a.play();if(p&&p.catch)p.catch(e=>{err=(e&&e.name)||'play'})}
 // Called from every user gesture (Sound.unlock): first call unlocks; later calls revive playback after iOS interruptions.
 function unlock(){unlocked=true;if(on&&!Settings.mute&&(!el||el.paused))play()}
 function cue(k){if(!FILES[k]||k===key)return;key=k;if(unlocked)play()}
 function active(v){on=!!v;if(!unlocked)return;if(on)play();else if(el)el.pause()}
 function sync(){if(!unlocked)return;if(Settings.mute){if(el)el.pause()}else if(on)play()}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(el)el.pause()}else if(unlocked&&on&&!Settings.mute)play()});
 addEventListener('pagehide',()=>{if(el)el.pause()});
 return{unlock,cue,active,sync,get state(){return{key,on,unlocked,paused:el?el.paused:true,time:el?el.currentTime:0,duration:el&&isFinite(el.duration)?el.duration:0,error:err}}};
})();
