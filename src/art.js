// Embedded atlases are decoded once; no network asset request during play.
const Art=(()=>{
 const sources=/* ART_ASSETS */{},images={},ready={},bounds={},failed=[];
 // The generated poses are packed with unequal gutters. Explicit source rectangles
 // keep out neighbouring fists/feet; every pose shares one pixel-to-world scale.
 const heroRows=[0,240,472,699,935,1145];
 const heroCuts=[[0,246,478,704,930,1164,1374],[0,231,482,706,932,1195,1374],[0,218,468,706,923,1182,1374],[0,224,488,685,930,1134,1374],[0,282,498,687,969,1160,1374]];
 const heroAnchors=[[120,345,573,805,1038,1282],[107,340,575,818,1050,1278],[112,324,590,835,1040,1295],[108,338,586,806,1033,1238],[118,381,578,819,1062,1264]];
 const heroFrames=heroCuts.flatMap((cuts,row)=>cuts.slice(0,6).map((x,col)=>({sx:x,sy:heroRows[row],sw:cuts[col+1]-x,sh:heroRows[row+1]-heroRows[row],anchor:heroAnchors[row][col]-x})));
 // Trim source bounds to the principal connected silhouette. This is atlas
 // metadata, not an altered image: tiny fragments from neighbouring cells are
 // excluded without normalising the height of crouches or airborne poses.
 function trimHero(im){
  const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const cc=c.getContext('2d',{willReadFrequently:true});cc.drawImage(im,0,0);const data=cc.getImageData(0,0,c.width,c.height).data;
  for(const r of heroFrames){const w=r.sw,h=r.sh,seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let best=null;
   const opaque=i=>data[((r.sy+Math.floor(i/w))*c.width+r.sx+i%w)*4+3]>64;
   for(let seed=0;seed<w*h;seed++){if(seen[seed]||!opaque(seed))continue;let head=0,tail=1,minX=w,minY=h,maxX=0,maxY=0;queue[0]=seed;seen[seed]=1;
    while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
     const neighbours=[x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1];for(const n of neighbours)if(n>=0&&!seen[n]&&opaque(n)){seen[n]=1;queue[tail++]=n}
    }
    if(!best||tail>best.count)best={count:tail,minX,minY,maxX,maxY};
   }
   if(best){const left=Math.max(0,best.minX-1),top=Math.max(0,best.minY-1),right=Math.min(w,best.maxX+2),bottom=Math.min(h,best.maxY+2);r.sx+=left;r.sy+=top;r.sw=right-left;r.sh=bottom-top;r.anchor-=left}
  }
  c.width=c.height=1;
 }
 function measure(im,cols,rows,rects=null){
  const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
  const context=c.getContext('2d',{willReadFrequently:true});context.drawImage(im,0,0);
  const pixels=context.getImageData(0,0,c.width,c.height).data,sw=c.width/cols,sh=c.height/rows,frames=[];
  for(let f=0;f<cols*rows;f++){const rect=rects?.[f];const ox=rect?rect.sx:Math.round(f%cols*sw),oy=rect?rect.sy:Math.round(Math.floor(f/cols)*sh),ex=rect?rect.sx+rect.sw:Math.round((f%cols+1)*sw),ey=rect?rect.sy+rect.sh:Math.round((Math.floor(f/cols)+1)*sh);let minX=ex,minY=ey,maxX=ox,maxY=oy,count=0;
   for(let y=oy;y<ey;y++)for(let x=ox;x<ex;x++)if(pixels[(y*c.width+x)*4+3]>64){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);count++}
   frames.push({left:(minX-ox)/sw,top:(minY-oy)/sh,right:(maxX-ox)/sw,bottom:(maxY-oy+1)/(ey-oy),count});
  }
  c.width=c.height=1;return frames;
 }
 for(const [name,src] of Object.entries(sources)){const im=new Image();images[name]=im;im.onload=()=>{try{if(name==='hero'){trimHero(im);bounds[name]=measure(im,6,5,heroFrames);}if(name==='enemies')bounds[name]=measure(im,4,2)}catch{}ready[name]=true};im.onerror=()=>failed.push(name);im.src=src}
 return{images,ready,bounds,heroFrames,failed};
})();
