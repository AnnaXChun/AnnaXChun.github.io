// Mutable animation channel: React owns structure, GSAP owns the playhead.
// Three.js and DOM subscribers consume the same fractional frame directly.
export const INTRO_END_FRAME=90;
export const STARTS=[0,270,540,810,1050];
export const TOTAL_FRAMES=1560;
export const range=(frame,start,end)=>{const t=Math.min(1,Math.max(0,(frame-start)/(end-start)));return t*t*(3-2*t);};
export const chapterOpacity=(frame,index)=>{
  const enter=range(frame,index===0?0:index===2?576:STARTS[index]+4,index===0?48:index===2?612:STARTS[index]+42);
  const leave=index===4?0:index===1?range(frame,445,480):range(frame,STARTS[index+1]-38,STARTS[index+1]-4);
  return enter*(1-leave);
};
export const courtyardOpacity=frame=>(.35+.65*range(frame,0,72))*(1-chapterOpacity(frame,3)*.94);

export function createStoryMotion(initialFrame=90){
  let frame=initialFrame;
  const listeners=new Set();
  return {
    get frame(){return frame;},
    setFrame(value){
      if(!Number.isFinite(value)||value===frame)return;
      frame=value;for(const listener of listeners)listener(frame);
    },
    subscribe(listener){listeners.add(listener);listener(frame);return()=>listeners.delete(listener);},
  };
}
