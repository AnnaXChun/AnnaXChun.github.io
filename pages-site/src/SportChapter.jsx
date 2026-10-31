import React,{lazy,Suspense,useLayoutEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {createStoryMotion,range} from './StoryMotion';
const loadSport=()=>import('./BadmintonScene');
const BadmintonScene=lazy(loadSport);
gsap.registerPlugin(ScrollTrigger);

// A stale deployment tab or interrupted chunk request must not remove the rest
// of the portfolio. Reloading also clears React.lazy's rejected import cache.
class SportSceneBoundary extends React.Component{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){
    if(this.state.failed)return <div className="sport-load-error" role="status">
      <h3>球场画面暂未加载</h3>
      <p>连接可能中断，或页面刚刚更新。刷新后再试，其他内容仍可继续浏览。</p>
      <button type="button" onClick={()=>window.location.reload()}>刷新页面重试 ↻</button>
    </div>;
    return this.props.children;
  }
}

// Preserve the accepted imported assets, materials and 1050–1559 camera score.
// Only its enclosing chapter changes from the old five-scene film.
export default function SportChapter({reduced}){
  const section=useRef(null),copy=useRef(null),title=useRef(null),cue=useRef(null),bar=useRef(null);
  const [motion]=useState(()=>createStoryMotion(1050));const [ready,setReady]=useState(false);
  useLayoutEffect(()=>{
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadSport().then(m=>m.preloadSportAssets()).catch(()=>{});setReady(true);observer.disconnect();}},{rootMargin:'1200px'});observer.observe(section.current);return()=>observer.disconnect();
  },[]);
  useLayoutEffect(()=>{
    if(reduced){motion.setFrame(1160);return;}
    const playhead={frame:1050};
    const unsubscribe=motion.subscribe(frame=>{
      copy.current.style.opacity=String(1-range(frame,1265,1320)+range(frame,1470,1530));
      title.current.style.opacity=String(1-range(frame,1370,1445));
      title.current.style.transform=`translate3d(0,${-range(frame,1280,1410)*180}px,0)`;
      cue.current.style.opacity=String(1-range(frame,1190,1240));
      bar.current.style.transform=`scaleX(${(frame-1050)/509})`;
      section.current.dataset.frame=String(Math.round(frame));
    });
    const context=gsap.context(()=>gsap.fromTo(playhead,{frame:1050},{frame:1559,ease:'none',onUpdate:()=>motion.setFrame(playhead.frame),scrollTrigger:{trigger:section.current,start:'top top',end:'bottom bottom',scrub:.22}}),section);
    return()=>{unsubscribe();context.revert();for(const node of [copy.current,title.current,cue.current,bar.current])if(node){node.style.opacity='';node.style.transform='';}};
  },[motion,reduced]);
  return <section id="life" ref={section} className={`sport-chapter${reduced?' sport-still':''}`} aria-labelledby="life-title"><div className="sport-stage">
    <div className="sport-depth" ref={title} aria-hidden="true">球场见</div>
    <div className="sport-visual">{ready&&<SportSceneBoundary><Suspense fallback={null}><BadmintonScene motion={motion} still={reduced}/></Suspense></SportSceneBoundary>}</div>
    <div className="sport-copy" ref={copy}><h2 id="life-title">读拍面，<br/>看重心。</h2><p>享受单打的节奏，也重视双打里的补位、喊球和默契。观察、调整，再试一次。</p><span>羽毛球 / 健身 / 视频剪辑</span></div>
    <div className="sport-cue" ref={cue}>{reduced?'05 / OFF THE CLOCK':'向下滚动，随之挥拍'} <span aria-hidden="true">↓</span></div>
    <div className="sport-bottom"><span>05 / OFF THE CLOCK</span><a href="#contact">聊聊下一步 ↗</a></div>
    <div className="sport-progress"><i ref={bar}/></div>
  </div></section>;
}
