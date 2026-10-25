// Merge the actual font's ink into solid rectangles. Holes and spaces remain
// empty: a word's CSS bounding box is never used as a collision platform.
export function inkRectangles(alpha,width,height,threshold=120){
  const rectangles=[];let previous=new Map();
  for(let y=0;y<height;y++){
    const next=new Map();let x=0;
    while(x<width){
      while(x<width&&alpha[y*width+x]<=threshold)x++;
      const start=x;while(x<width&&alpha[y*width+x]>threshold)x++;
      if(start===x)continue;
      const key=`${start}:${x}`,old=previous.get(key);
      if(old){old.height++;next.set(key,old);}
      else {const rect={x:start,y,width:x-start,height:1};rectangles.push(rect);next.set(key,rect);}
    }
    previous=next;
  }
  return rectangles;
}

export function createLeafTextColliders(host,onChange=()=>{}){
  let lastFrame=-1,lastSize='',candidateKey='',publishedKey='',settle=0,revision=0,dirty=true,disposed=false,boxes=[];
  const glyphCache=new Map(),film=host.closest('.cinematic-film');
  const fontReady=()=>{if(!disposed){dirty=true;glyphCache.clear();onChange();}};
  document.fonts?.ready.then(fontReady);document.fonts?.addEventListener('loadingdone',fontReady);

  function glyphInk(text,style,resolution){
    const cacheKey=`${text}|${style.fontFamily}|${style.fontWeight}|${resolution}`;
    if(glyphCache.has(cacheKey))return glyphCache.get(cacheKey);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
    const font=`${style.fontStyle} ${style.fontWeight} ${resolution}px ${style.fontFamily}`;
    ctx.font=font;const metrics=ctx.measureText(text),pad=2;
    const lineHeight=parseFloat(style.lineHeight)/parseFloat(style.fontSize)*resolution;
    const ascent=metrics.fontBoundingBoxAscent??resolution*.88,descent=metrics.fontBoundingBoxDescent??resolution*.12;
    canvas.width=Math.ceil(metrics.width)+pad*2;canvas.height=Math.ceil(lineHeight)+pad*2;
    ctx.font=font;ctx.fillStyle='#fff';ctx.textBaseline='alphabetic';
    ctx.fillText(text,pad,pad+(lineHeight+ascent-descent)/2);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(canvas.width*canvas.height);
    for(let i=0;i<alpha.length;i++)alpha[i]=pixels[i*4+3];
    const result={rects:inkRectangles(alpha,canvas.width,canvas.height),pad,resolution,canvas,alpha,width:canvas.width,height:canvas.height};
    glyphCache.set(cacheKey,result);return result;
  }

  return {
    update(frame,width,height,delta=0){
      const size=`${width}:${height}`;
      if(!dirty&&lastFrame===frame&&lastSize===size&&settle<=0)return null;
      lastFrame=frame;lastSize=size;
      const title=film?.querySelector('[data-leaf-surface]');
      const key=`${title?.dataset.leafSurface??'none'}:${title?.dataset.leafPose??0}:${size}`;
      if(dirty||key!==candidateKey){candidateKey=key;publishedKey='';settle=title ? .12 : 0;dirty=false;}
      if(settle>0){
        settle=Math.max(0,settle-Math.min(.1,delta));
        if(boxes.length){boxes=[];return {boxes,key:`moving:${++revision}`};}
        if(settle>0)return null;
      }
      if(key===publishedKey)return null;
      publishedKey=key;boxes=[];const parts=[];
      if(title){
        // Layout reads occur only at a stable chapter boundary, font load, or
        // viewport resize. No layout reads, rasterization, or rebuilding at idle.
        const origin=host.getBoundingClientRect();
        const glyphs=[...title.querySelectorAll('span')].filter(el=>el.textContent.trim()).map(el=>({
          text:el.textContent,style:getComputedStyle(el),rect:el.getBoundingClientRect(),
        }));
        const unit=2*13*Math.tan(17.5*Math.PI/180)/height;
        for(const resolution of [64,48,36,28,20]){
          const next=[];
          for(const {text,style,rect} of glyphs){
            const ink=glyphInk(text,style,resolution),scale=parseFloat(style.fontSize)/resolution;
            for(const r of ink.rects){
              const left=rect.left-origin.left+(r.x-ink.pad)*scale,top=rect.top-origin.top+(r.y-ink.pad)*scale;
              const w=r.width*scale,h=r.height*scale;
              if(left+w<0||left>width||top+h<0||top>height)continue;
              const halfY=Math.max(.025,h*unit/2);
              next.push({center:[(left+w/2-width/2)*unit,(height/2-top)*unit-halfY,-.45],halfExtents:[w*unit/2,halfY,.45]});
            }
          }
          boxes=next;if(boxes.length<=512)break;
        }
        // The visible edge is sampled more finely than the collision proxy.
        // A real top surface and depth mask make a resting leaf read as placed.
        for(const {text,style,rect} of glyphs){
          const ink=glyphInk(text,style,192),scale=parseFloat(style.fontSize)/192;
          parts.push({ink,unit:scale*unit,left:(rect.left-origin.left-ink.pad*scale-width/2)*unit,top:(height/2-rect.top+origin.top+ink.pad*scale)*unit});
        }
      }
      return {boxes,parts,key:`${key}:${++revision}`};
    },
    invalidate(){dirty=true;},
    dispose(){disposed=true;glyphCache.clear();boxes=[];document.fonts?.removeEventListener('loadingdone',fontReady);},
  };
}
