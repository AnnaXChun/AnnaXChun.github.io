import React,{useLayoutEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import './ForestStage.css';

gsap.registerPlugin(ScrollTrigger);

/** Hand-painted cutouts. Each source of motion owns a different wrapper. */
export default function ForestStage({reduced=false}){
  const stage=useRef(null),greet=useRef(null);
  const [greeted,setGreeted]=useState(false);

  useLayoutEffect(()=>{
    const element=stage.current,hero=element.closest('.storybook-hero');
    if(reduced||!hero)return;
    let alive=true,visible=false,context=null,greeting=null,greetingActive=false;
    const ambient=[],followers=[];
    const q=selector=>element.querySelector(selector);
    const running=()=>alive&&visible&&!document.hidden;
    const syncVisibility=()=>{
      const active=running();element.dataset.visible=String(active);
      ambient.forEach(animation=>active?animation.resume():animation.pause());
      if(greetingActive&&greeting)(active?greeting.resume():greeting.pause());
      if(!active)followers.forEach(set=>set.tween.pause());
    };
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncVisibility();});
    intersection.observe(element);document.addEventListener('visibilitychange',syncVisibility);
    let move=null,leave=null;

    Promise.all([document.fonts.ready,...[...element.querySelectorAll('img')].map(img=>img.decode().catch(()=>{}))]).then(()=>{
      if(!alive)return;
      context=gsap.context(()=>{
        const head=q('.fs-head-pointer'),character=q('.fs-character-pointer');
        const far=q('.fs-cloud-far .fs-pointer'),near=q('.fs-cloud-near .fs-pointer'),branch=q('.fs-branch .fs-pointer');
        const follow=(node,key,duration=.65)=>{
          const set=gsap.quickTo(node,key,{duration,ease:'power3.out'});followers.push(set);return set;
        };
        const track=[
          [follow(head,'rotationY'),17,'x'],[follow(head,'rotationX'),-9,'y'],[follow(head,'rotation'),2.8,'x'],
          [follow(character,'x',.85),18,'x'],[follow(character,'y',.85),8,'y'],[follow(character,'rotationY',.85),3.5,'x'],
          [follow(far,'x',1.1),-16,'x'],[follow(far,'y',1.1),-8,'y'],
          [follow(near,'x',.95),-31,'x'],[follow(near,'y',.95),-15,'y'],
          [follow(branch,'x',.75),34,'x'],[follow(branch,'y',.75),17,'y'],[follow(branch,'rotationY',.75),-7,'x'],
        ];
        move=event=>{
          if(event.pointerType==='touch'||!running())return;
          const x=gsap.utils.clamp(-1,1,event.clientX/Math.max(1,innerWidth)*2-1);
          const y=gsap.utils.clamp(-1,1,event.clientY/Math.max(1,innerHeight)*2-1);
          track.forEach(([set,amount,axis])=>set((axis==='x'?x:y)*amount));
        };
        leave=()=>{if(running())track.forEach(([set])=>set(0));};
        hero.addEventListener('pointermove',move,{passive:true});hero.addEventListener('pointerleave',leave);

        ambient.push(
          gsap.to(q('.fs-cloud-far .fs-idle'),{x:27,y:-8,duration:6.4,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true}),
          gsap.to(q('.fs-cloud-near .fs-idle'),{x:-34,y:11,duration:5.2,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true}),
          gsap.to(q('.fs-branch .fs-idle'),{rotation:3.8,x:9,y:-4,duration:3.8,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true}),
          gsap.to(q('.fs-character-breath'),{scaleY:1.018,scaleX:1.006,y:-4,duration:2.3,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true}),
          gsap.to(q('.fs-head-idle'),{rotation:-1.7,duration:3.1,repeat:-1,yoyo:true,ease:'sine.inOut',paused:true}),
        );

        // A gentle camera push with much greater foreground travel than the sky.
        // No pin, scroll interception, or time-driven camera is used.
        const camera=gsap.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.45}});
        camera.to(q('.fs-camera'),{z:72,rotationY:2.5,rotationX:-2,ease:'none',duration:1},0)
          .to(q('.fs-character-scroll'),{yPercent:15,xPercent:-3,scale:1.08,z:25,ease:'none',duration:1},0)
          .fromTo(q('.fs-cloud-far .fs-scroll'),{z:-145},{z:-210,xPercent:-25,yPercent:7,ease:'none',duration:1},0)
          .fromTo(q('.fs-cloud-near .fs-scroll'),{z:-55},{z:-95,xPercent:23,yPercent:-15,ease:'none',duration:1},0)
          .fromTo(q('.fs-branch .fs-scroll'),{z:105},{z:160,xPercent:18,yPercent:29,rotation:-7,ease:'none',duration:1},0);

        greeting=gsap.timeline({paused:true,onStart:()=>{greetingActive=true;},onComplete:()=>{greetingActive=false;}})
          .to(q('.fs-character-action'),{y:7,scaleY:.95,scaleX:1.035,duration:.12,ease:'power2.in'})
          .to(q('.fs-character-action'),{y:-43,scaleY:1.035,scaleX:.98,duration:.28,ease:'power2.out'})
          .to(q('.fs-character-action'),{y:0,scaleY:1,scaleX:1,duration:.48,ease:'bounce.out'})
          .to(q('.fs-head-greet'),{rotation:-8,rotationX:7,duration:.22,ease:'power2.out'},.14)
          .to(q('.fs-head-greet'),{rotation:3,rotationX:-3,duration:.23,ease:'sine.inOut'},.36)
          .to(q('.fs-head-greet'),{rotation:0,rotationX:0,duration:.3,ease:'sine.out'},.59)
          .fromTo(q('.fs-reply'),{autoAlpha:0,y:12,scale:.9},{autoAlpha:1,y:0,scale:1,duration:.25,ease:'back.out(1.5)'},.2)
          .to(q('.fs-reply'),{autoAlpha:0,y:-9,duration:.35,ease:'sine.in'},1.55);
        // The reusable timeline is made inside the context, not on every tap.
        greet.current=()=>{if(running()&&!greetingActive)greeting.restart();};
      },element);
      syncVisibility();
    });

    return()=>{
      alive=false;greet.current=null;intersection.disconnect();document.removeEventListener('visibilitychange',syncVisibility);
      if(move)hero.removeEventListener('pointermove',move);if(leave)hero.removeEventListener('pointerleave',leave);
      context?.revert();delete element.dataset.visible;
    };
  },[reduced]);

  const sayHello=()=>{setGreeted(true);greet.current?.();};
  return <div ref={stage} className="forest-stage" data-reduced={String(reduced)} data-greeted={String(greeted)}>
    <div className="fs-camera">
      <div className="fs-layer fs-cloud-far" aria-hidden="true"><div className="fs-scroll"><div className="fs-pointer"><div className="fs-idle"><img src="./assets/story-cloud.webp" alt="" width="1500" height="500" draggable="false"/></div></div></div></div>
      <div className="fs-layer fs-cloud-near" aria-hidden="true"><div className="fs-scroll"><div className="fs-pointer"><div className="fs-idle"><img src="./assets/story-cloud.webp" alt="" width="1500" height="500" draggable="false"/></div></div></div></div>
      <div className="fs-character-scroll"><div className="fs-character-pointer">
        <button type="button" className="fs-character" onClick={sayHello} aria-label="和森林信使打个招呼">
          <span className="fs-character-breath"><span className="fs-character-action">
            <img className="fs-body" src="./assets/story-body.webp" alt="" width="1086" height="1448" fetchPriority="high" draggable="false"/>
            <span className="fs-head-greet"><span className="fs-head-idle"><span className="fs-head-pointer"><img src="./assets/story-messenger.webp" alt="" width="1086" height="1448" draggable="false"/></span></span></span>
          </span></span>
        </button>
      </div></div>
      <div className="fs-layer fs-branch" aria-hidden="true"><div className="fs-scroll"><div className="fs-pointer"><div className="fs-idle"><img src="./assets/story-branch.webp" alt="" width="1000" height="1000" draggable="false"/></div></div></div></div>
    </div>
    <span className="fs-cue" aria-hidden="true">碰一下，打个招呼 <span>↙</span></span>
    <span className="fs-reply" aria-hidden="true">你好呀！</span>
    <span className="fs-announcement" role="status">{greeted?'森林信使向你打了个招呼。':''}</span>
  </div>;
}
