import React,{useLayoutEffect,useRef} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import './PaperFlight.css';

gsap.registerPlugin(ScrollTrigger);

// The wings really meet along a fold in CSS 3D space. Each has a separate
// underside, so a bank or roll reveals paper instead of a mirrored flat poster.
function Wing({lower=false}){
  const shape=lower?'300,0 54,0 6,160':'300,160 6,0 54,160';
  return <span className={`pf-wing ${lower?'pf-wing--lower':'pf-wing--upper'}`}>
    <svg className="pf-surface pf-surface--front" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
      <polygon className="pf-paper" points={shape}/>
      <path className="pf-pencil" d={lower?'M300 0L6 160 M54 0L6 160 M65 8L17 148':'M300 160L6 0 M54 160L6 0 M65 152L17 12'}/>
      <path className="pf-grain" d={lower?'M85 29L35 124 M108 25L51 116 M150 14L86 92 M195 9L128 70':'M85 131L35 36 M108 135L51 44 M150 146L86 68 M195 151L128 90'}/>
      {!lower&&<g className="pf-ink-mark" transform="translate(60 100) rotate(18)"><path d="M0 0c-4-7 5-12 9-5s-4 14-9 5Z"/><path d="M15 2c-3-4 3-7 5-3s-1 8-5 3Z"/></g>}
    </svg>
    <svg className="pf-surface pf-surface--back" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
      <polygon className="pf-paper" points={shape}/>
      <path className="pf-pencil" d={lower?'M300 0L6 160 M54 0L6 160':'M300 160L6 0 M54 160L6 0'}/>
    </svg>
  </span>;
}

export default function PaperFlight({reduced=false}){
  const root=useRef(null);
  useLayoutEffect(()=>{
    const element=root.current;
    if(reduced)return;
    const stage=element.closest('.training-composition');
    const button=element.querySelector('.pf-touch');
    const steering=element.querySelector('.pf-steer');
    let idle,roll,flight,steerX,steerY,visible=false,bounds;
    const context=gsap.context(()=>{
      const small=()=>matchMedia('(max-width:599px)').matches;
      flight=gsap.timeline({scrollTrigger:{trigger:stage,start:'top bottom',end:'bottom top',scrub:.65,invalidateOnRefresh:true}})
        .fromTo('.pf-scroll',{xPercent:20,yPercent:32,z:-150,rotationY:-24,rotationZ:-18,scale:.7},
          {xPercent:0,yPercent:0,z:30,rotationY:9,rotationZ:0,scale:1,duration:.48,ease:'sine.inOut'})
        .to('.pf-scroll',{xPercent:()=>small()?4:10,yPercent:-12,z:75,rotationY:-18,rotationZ:15,duration:.3,ease:'sine.inOut'})
        .to('.pf-scroll',{xPercent:()=>small()?10:28,yPercent:-35,z:-45,rotationY:18,rotationZ:-12,scale:.86,duration:.22,ease:'sine.inOut'});
      idle=gsap.timeline({paused:true,repeat:-1,yoyo:true})
        .fromTo('.pf-float',{y:-5,rotationZ:-1.5},{y:6,rotationZ:1.5,duration:2.7,ease:'sine.inOut'},0)
        .fromTo('.pf-sprig',{rotationZ:-3},{rotationZ:6,duration:2.7,ease:'sine.inOut'},0);
      roll=gsap.timeline({paused:true,onStart:()=>{element.dataset.flying='true';},onComplete:()=>{element.dataset.flying='false';}})
        .to('.pf-roll',{rotationX:-16,y:10,z:-20,duration:.18,ease:'power2.in'})
        .to('.pf-roll',{rotationX:360,y:-50,z:75,duration:1.05,ease:'power2.inOut'})
        .to('.pf-roll',{y:0,z:0,duration:.48,ease:'sine.out'})
        .set('.pf-roll',{rotationX:0});
      steerX=gsap.quickTo(steering,'rotationY',{duration:.65,ease:'power3.out'});
      steerY=gsap.quickTo(steering,'rotationX',{duration:.65,ease:'power3.out'});
    },element);
    const sync=()=>{
      const running=visible&&!document.hidden;
      element.dataset.motion=running?'active':'paused';
      idle.paused(!running);
      if(!running){roll.pause();flight.scrollTrigger.getTween()?.pause();}
      else{
        flight.scrollTrigger.getTween()?.resume();
        if(roll.progress()>0&&roll.progress()<1)roll.play();
      }
    };
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:0});observer.observe(stage);
    const enter=()=>{bounds=button.getBoundingClientRect();};
    const move=event=>{
      if(event.pointerType==='touch'||!visible||document.hidden)return;
      if(!bounds)enter();
      steerX(gsap.utils.clamp(-1,1,(event.clientX-bounds.left)/bounds.width*2-1)*15);
      steerY(gsap.utils.clamp(-1,1,(event.clientY-bounds.top)/bounds.height*2-1)*-12);
    };
    const leave=()=>{bounds=null;steerX(0);steerY(0);};
    const launch=()=>{if(!visible||document.hidden||roll.isActive())return;roll.restart();};
    button.addEventListener('pointerenter',enter);button.addEventListener('pointermove',move);button.addEventListener('pointerleave',leave);button.addEventListener('click',launch);
    document.addEventListener('visibilitychange',sync);
    return()=>{
      observer.disconnect();document.removeEventListener('visibilitychange',sync);
      button.removeEventListener('pointerenter',enter);button.removeEventListener('pointermove',move);button.removeEventListener('pointerleave',leave);button.removeEventListener('click',launch);
      steerX.tween.kill();steerY.tween.kill();context.revert();delete element.dataset.motion;delete element.dataset.flying;
    };
  },[reduced]);
  return <div ref={root} className="paper-flight" data-reduced={reduced}>
    <div className="pf-camera"><div className="pf-scroll"><div className="pf-steer"><div className="pf-float"><div className="pf-roll">
      <button type="button" className="pf-touch" disabled={reduced} aria-label="让纸飞机翻转一圈" title={reduced?undefined:'碰一下，借一阵风'}>
        <span className="pf-airframe" aria-hidden="true">
          <Wing/><Wing lower/>
          <span className="pf-keel"><svg viewBox="0 0 300 95" preserveAspectRatio="none"><polygon points="300,0 54,0 84,95"/><path d="M300 0L84 95L54 0"/></svg></span>
          <span className="pf-spine"/>
          <svg className="pf-sprig" viewBox="0 0 100 130"><path className="pf-stem" d="M54 126C44 90 65 50 51 9"/><path className="pf-leaf pf-leaf-a" d="M53 89C14 87 4 55 6 37C37 37 51 56 53 89Z"/><path className="pf-leaf pf-leaf-b" d="M54 71C88 65 99 35 96 20C69 26 55 44 54 71Z"/><path className="pf-leaf pf-leaf-c" d="M54 41C29 35 30 10 38 2C55 7 58 24 54 41Z"/><path className="pf-vein" d="M54 90L15 48 M55 72L88 30 M54 42L39 9"/></svg>
        </span>
      </button>
    </div></div></div></div></div>
    {!reduced&&<span className="pf-cue" aria-hidden="true">碰一下，借一阵风 <span>↗</span></span>}
  </div>;
}
