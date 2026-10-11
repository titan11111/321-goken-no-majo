// Embedded atlases are decoded once; no network asset request during play.
// Silhouette bounds were previously measured at every launch (getImageData + flood fill,
// a multi-hundred-ms main-thread freeze on phones). They are now baked at build time into
// art-baked.json (dev tool: _playtest/bake-art.mjs) so launch only decodes the images.
const Art=(()=>{
 const sources=/* ART_ASSETS */{},baked=/* ART_BAKED */{heroFrames:[],bounds:{}},images={},ready={},failed=[];
 const heroFrames=baked.heroFrames,bounds=baked.bounds;
 for(const [name,src] of Object.entries(sources)){
  const im=new Image();images[name]=im;
  // decode() moves the bitmap decode off the first gameplay frame (lazy decode = hitch on first draw).
  im.onload=()=>{(im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(()=>{ready[name]=true})};
  im.onerror=()=>failed.push(name);im.src=src;
 }
 return{images,ready,bounds,heroFrames,failed};
})();
