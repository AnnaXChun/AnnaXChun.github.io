export function renderPixelRatio(width,height,dpr=1,pixelBudget=2_800_000) {
  return Math.min(dpr,1.5,Math.sqrt(pixelBudget/Math.max(1,width*height)));
}

export function minnanViewport(frame,width,height) {
  const s=(a,b)=>{const t=Math.max(0,Math.min(1,(frame-a)/(b-a)));return t*t*(3-2*t);};
  const travel=s(440,485)*(1-s(535,585)),chapter=frame<270?0:frame<540?1:frame<810?2:3;
  let box=chapter===1?[-14*(1-travel),17*(1-travel),88+12*travel,83+17*travel]:chapter===2?[-4,-3,108,105]:[23*(1-travel),9*(1-travel),81+19*travel,91+9*travel];
  if(width<900){
    box=chapter===1?[-25,13,140,44]:chapter===2?[-15,0,130,height<=650?47:51]:[-12,12,124,44];
    // Short landscape includes a desktop browser at 200% zoom. Preserve the
    // model's size while leaving the hero paragraph a clear reading column.
    if(width>=600&&height<=520)box=chapter===1?[-10,16,90,80]:chapter===2?[0,0,100,100]:[32,8,90,90];
  }
  return {x:box[0]*width/100,y:(100-box[1]-box[3])*height/100,width:box[2]*width/100,height:box[3]*height/100};
}

// One render request per browser frame. CSS camera framing may resize the host,
// but only a real viewport resize reallocates the drawing buffer.
export function createSceneRuntime({host,renderer,render,onResize,active=true,idleFps=60,maxFps=Infinity,pixelBudget=2_800_000}) {
  const viewport=host.closest('.film-viewport')||host;
  let width=1,height=1,viewWidth=1,viewHeight=1,raf=0,intersecting=true,disposed=false;
  let bufferKey='',awake=false,requested=false,warming=false,warmed=false,lastDraw=-Infinity,nextDraw=-Infinity,cadence=0,lastTick=null,elapsed=0;
  const runnable=()=>((active&&intersecting)||warming)&&!document.hidden&&!disposed;
  const allocate=()=>{
    // Keep the bounded targets warm across adjacent chapters. Reallocating
    // multisampled targets at each crossing stalls the GPU on reverse scroll.
    // Leaving the viewport or hiding the tab still releases their storage.
    const enabled=intersecting&&!document.hidden&&(active||warming||awake),key=enabled?`${viewWidth}:${viewHeight}`:'sleep';
    if(key===bufferKey)return;
    bufferKey=key;awake=enabled;
    const w=enabled?viewWidth:1,h=enabled?viewHeight:1;
    renderer.setPixelRatio(enabled?renderPixelRatio(w,h,devicePixelRatio||1,pixelBudget):1);
    renderer.setSize(w,h,false);onResize?.(w,h,enabled);
  };
  const schedule=()=>{if(runnable()&&!raf)raf=requestAnimationFrame(flush);};
  const flush=(now=performance.now())=>{
    raf=0;if(!runnable())return;
    // Ambient wind has a modest cadence; a scroll/pointer update always gets
    // the next frame. Hidden time never accumulates into a large resumed jump.
    const interval=1000/(requested?maxFps:Math.min(idleFps,maxFps));
    if(interval!==cadence){cadence=interval;nextDraw=lastDraw+interval;}
    if(now<nextDraw-.5){schedule();return;}
    // Preserve the fractional deadline on 75 / 90 / 144 Hz displays. Resetting
    // it to `now` after every draw would accidentally halve a 90 Hz screen.
    nextDraw=interval>0&&Number.isFinite(nextDraw)?nextDraw+(Math.max(1,Math.floor((now-nextDraw)/interval)+1))*interval:now+interval;
    requested=false;allocate();const delta=lastTick===null?0:Math.max(0,Math.min(.1,(now-lastTick)/1000));
    lastTick=now;lastDraw=now;elapsed+=delta;
    const warmFrame=warming,transmission=renderer.transmissionResolutionScale;
    const warmTransmission=warmFrame&&!intersecting&&typeof transmission==='number';
    let continuous;
    try{
      // A fractional transmission target would truncate below one pixel while
      // warming. This temporary minimum never changes the visible scene scale.
      if(warmTransmission)renderer.transmissionResolutionScale=1;
      continuous=render(width,height,{time:elapsed,delta});
    }finally{
      if(warmTransmission)renderer.transmissionResolutionScale=transmission;
      if(warmFrame){
        warming=false;warmed=true;host.dataset.renderState=active&&intersecting?'active':'suspended';
        if(!intersecting||!active)lastTick=null;
      }
    }
    // One offscreen submission warms textures and post-processing at the
    // existing 1×1 size. Never turn a continuous scene into an offscreen loop.
    if(warmFrame&&(!intersecting||!active))return;
    if(continuous)schedule();else lastTick=null;
  };
  const request=()=>{if(runnable()){requested=true;schedule();}};
  const visibility=()=>{
    if(document.hidden)warming=false;
    host.dataset.renderState=runnable()?'active':'suspended';
    if(!runnable()){cancelAnimationFrame(raf);raf=0;lastTick=null;nextDraw=-Infinity;allocate();}
    else {bufferKey=awake?bufferKey:'';request();}
  };
  const sizes=new ResizeObserver(entries=>{
    for(const {target,contentRect:r} of entries){
      if(target===host){width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));}
      if(target===viewport){viewWidth=Math.max(1,Math.round(r.width));viewHeight=Math.max(1,Math.round(r.height));}
    }
    request();
  });
  sizes.observe(host);if(viewport!==host)sizes.observe(viewport);
  const intersection=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;visibility();});
  intersection.observe(host);document.addEventListener('visibilitychange',visibility);
  return {request,prewarm(){if(!warmed&&!warming&&!awake&&!document.hidden&&!disposed){warming=true;request();}},get active(){return runnable();},setActive(value){if(active!==value){active=value;visibility();}},dispose(){disposed=true;cancelAnimationFrame(raf);sizes.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);}};
}
