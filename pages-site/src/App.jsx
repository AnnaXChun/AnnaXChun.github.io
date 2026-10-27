import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Film, {CHAPTERS, INTRO_END_FRAME, STARTS, TOTAL_FRAMES} from './Film';
import {createStoryMotion} from './StoryMotion';
gsap.registerPlugin(ScrollTrigger);
import Dossier from './Dossier';
import {profile} from './data';
import MinnanScene from './MinnanScene';

const LAST_FRAME = TOTAL_FRAMES - 1;
const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
const getChapter = frame => Math.max(0,STARTS.findLastIndex(start=>frame>=start));
const contentHash = () => Boolean(window.location.hash && !['#top','#story'].includes(window.location.hash));

function Story() {
  const story=useRef(null),stage=useRef(null),progress=useRef(null),progressTrack=useRef(null),controls=useRef(null);
  const [motion]=useState(()=>createStoryMotion(!contentHash()&&window.scrollY<8?0:INTRO_END_FRAME));
  const [chapter,setChapter]=useState(0);
  useLayoutEffect(()=>{
    let currentChapter=-1,lastPercent=-1,intro;
    const playhead={frame:INTRO_END_FRAME};
    const report=frame=>{
      const fraction=clamp((frame-INTRO_END_FRAME)/(LAST_FRAME-INTRO_END_FRAME),0,1),next=getChapter(frame),percent=Math.round(fraction*100);
      progress.current.style.transform=`scaleX(${fraction})`;
      if(percent!==lastPercent){progressTrack.current.setAttribute('aria-valuenow',String(percent));lastPercent=percent;}
      if(next!==currentChapter){
        currentChapter=next;setChapter(next);story.current.dataset.chapter=String(next);
        progressTrack.current.setAttribute('aria-valuetext',CHAPTERS[next].title);
      }
      story.current.dataset.opening=String(frame<INTRO_END_FRAME);
    };
    const unsubscribe=motion.subscribe(report);
    const context=gsap.context(()=>{
      // The documented ScrollTrigger pattern caches document geometry at
      // refresh. No seekTo(), React frame state or layout reads on each scroll.
      const scrollTween=gsap.fromTo(playhead,{frame:INTRO_END_FRAME},{frame:LAST_FRAME,ease:'none',paused:true,
        onUpdate:()=>{if(!intro?.isActive())motion.setFrame(playhead.frame);},
        scrollTrigger:{trigger:story.current,start:'top top',end:()=>`+=${Math.max(1,story.current.offsetHeight-stage.current.offsetHeight)}`,
          scrub:.22,invalidateOnRefresh:true,
          onUpdate:self=>{if(self.progress>0&&intro?.isActive()){intro.kill();motion.setFrame(playhead.frame);}},
        },
      });
      const trigger=scrollTween.scrollTrigger;
      controls.current={seek(index){
        intro?.kill();
        const target=index===0?INTRO_END_FRAME:clamp(STARTS[index]+(index===2?80:45),INTRO_END_FRAME,LAST_FRAME);
        const fraction=(target-INTRO_END_FRAME)/(LAST_FRAME-INTRO_END_FRAME);
        window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*fraction,behavior:'smooth'});
        if(Math.abs(window.scrollY-trigger.start-(trigger.end-trigger.start)*fraction)<1)motion.setFrame(target);
      }};
      if(motion.frame<INTRO_END_FRAME){
        const opening={frame:motion.frame};
        intro=gsap.to(opening,{frame:INTRO_END_FRAME,duration:1.4,ease:'power2.out',onUpdate:()=>motion.setFrame(opening.frame)});
      }else motion.setFrame(playhead.frame);
      document.fonts?.ready.then(()=>{if(controls.current)trigger.refresh();});
    },story);
    const visibility=()=>{if(document.hidden)intro?.pause();else if(intro?.paused())intro.resume();};
    document.addEventListener('visibilitychange',visibility);
    return()=>{controls.current=null;unsubscribe();context.revert();document.removeEventListener('visibilitychange',visibility);};
  },[motion]);
  return <section id="story" className="story-scroll cinematic-story" ref={story} aria-label="椿襄的个人故事" data-chapter={chapter} data-driver="scrolltrigger">
    <div className="story-stage" ref={stage}>
      <div className="film-viewport" aria-hidden="true"><Film motion={motion}/></div>
      <div className="film-accessible sr-only"><h1>椿襄 · {profile.role}</h1><p>武汉大学软件工程背景。重点介绍 OPD + RL 后训练与开源 benchmark SOTA，以及自 2026 年 9 月 20 日起在字节跳动国际商业化部门的 Agent 开发实习：Claude Code 内核接入、业务流程适配、Skill 优化与 Bad Case Studio。随后是团队成果与生活。生活章节的三维球拍随滚动蓄势、击球，羽毛球掠过镜头；向上滚动可沿原路径回退。三维水墨古厝随滚动切换视角，朱砂线随镜头穿门，连接研究书案、开发笔记本与 Skills / Bad Case 卷宗架；也可切换章节或直接阅读下方完整资料。</p></div>
      <div className="story-controls">
        <div className="chapter-nav" role="group" aria-label="故事章节">{CHAPTERS.map((item,index)=><button key={item.title} type="button" aria-pressed={chapter===index} onClick={()=>controls.current?.seek(index)}><small>{String(index+1).padStart(2,'0')}</small><span>{item.title}</span></button>)}</div>
        <a className="story-dossier-link" href="#dossier">个人详录 <span aria-hidden="true">↗</span></a>
      </div>
      <div className="story-progress" ref={progressTrack} role="progressbar" aria-label="故事进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i ref={progress} style={{width:'100%',transform:'scaleX(0)',transformOrigin:'left'}}/></div>
    </div>
  </section>;
}

function Contact(){
  const [copied,setCopied]=useState('');
  const copy=async()=>{try{await navigator.clipboard.writeText('mshuwhu@whu.edu.cn');setCopied('已复制');}catch{setCopied('请直接选择邮箱复制');}};
  return <section id="contact" className="contact-end"><div className="contact-rule"><span>NEXT / TO BE CONTINUED</span><span>继续下一步</span><i>+</i></div><div className="contact-grid"><div><p>从一次连接开始。</p><h2>下一个想法，<br/>一起做出来。</h2></div><div className="contact-methods"><a href="mailto:mshuwhu@whu.edu.cn"><small>写封邮件</small><strong>mshuwhu@whu.edu.cn</strong><span>↗</span></a><a href="tel:+8618289423880"><small>打个电话</small><strong>+86 182 8942 3880</strong><span>↗</span></a><button onClick={copy}>复制邮箱 ⧉</button><span role="status">{copied}</span></div></div><footer><a href="#top">椿襄 <small>CHUNXIANG</small></a><span>工程、探索与生活，还在继续。</span><a href="/model-credits.html">素材署名</a><a href="#top">回到起点 ↑</a></footer></section>;
}

export default function App(){
  const [motion,setMotion]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf=0;
    const onChange=event=>{
      if(!event.matches) return;
      setMotion(false);
      raf=requestAnimationFrame(()=>document.getElementById('dossier')?.scrollIntoView({behavior:'instant'}));
    };
    preference.addEventListener('change',onChange);
    return ()=>{preference.removeEventListener('change',onChange);cancelAnimationFrame(raf);};
  },[]);
  useEffect(()=>{
    if(!['#dossier','#contact'].includes(window.location.hash)) return;
    const raf=requestAnimationFrame(()=>document.getElementById(window.location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return <>
    <a className="skip-link" href="#dossier">跳到完整资料</a>
    <div id="top" />
    <main>
      {motion ? <Story /> : <section className="static-intro">
        <span>CHUNXIANG / PORTFOLIO</span>
        <h1>椿襄</h1>
        <h2>{profile.role}</h2>
        <p>专注智能体工具调用、强化学习后训练与多步推理。这里记录我的研究、实习与作品。</p>
        <div className="static-model" role="img" aria-label="闽南红砖古厝与燕尾脊的三维建筑"><MinnanScene still /></div>
      </section>}
      <Dossier />
      <Contact />
    </main>
  </>;
}
