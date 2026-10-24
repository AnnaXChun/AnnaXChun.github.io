import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Player} from '@remotion/player';
import Film, {CHAPTERS, FPS, INTRO_END_FRAME, STARTS, TOTAL_FRAMES} from './Film';
import Dossier from './Dossier';
import {profile} from './data';
import MinnanScene from './MinnanScene';

const LAST_FRAME = TOTAL_FRAMES - 1;
const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
const getChapter = frame => Math.max(0,STARTS.findLastIndex(start=>frame>=start));
const contentHash = () => Boolean(window.location.hash && !['#top','#story'].includes(window.location.hash));

function Story() {
  const [initial] = useState(()=>({intro:!contentHash() && window.scrollY<8}));
  const initialFrame=initial.intro?0:INTRO_END_FRAME;
  const story=useRef(null),stage=useRef(null),viewport=useRef(null),player=useRef(null);
  const progress=useRef(null),progressTrack=useRef(null);
  const driverRef=useRef(initial.intro?'intro':'scroll'),isPlaying=useRef(false);
  const pendingIntroRef=useRef(initial.intro);
  const lastFrame=useRef(initialFrame),currentChapter=useRef(0);
  const [driver,setDriverState]=useState(driverRef.current);
  const [playing,setPlaying]=useState(false),[chapter,setChapter]=useState(0);
  const [size,setSize]=useState(()=>{
    return {width:window.innerWidth,height:window.innerHeight};
  });

  const setDriver=useCallback(value=>{driverRef.current=value;setDriverState(value);},[]);
  const pause=useCallback(()=>{
    isPlaying.current=false;
    player.current?.pause();
    setPlaying(false);
  },[]);
  const scrollTopForFrame=useCallback(frame=>{
    const element=story.current;
    if(!element) return window.scrollY;
    const top=element.getBoundingClientRect().top+window.scrollY;
    const height=stage.current?.getBoundingClientRect().height || window.innerHeight;
    const travel=Math.max(1,element.offsetHeight-height);
    const fraction=clamp((frame-INTRO_END_FRAME)/(LAST_FRAME-INTRO_END_FRAME),0,1);
    return top+travel*fraction;
  },[]);
  const scrollToFrame=useCallback((frame,behavior='instant')=>{
    const top=scrollTopForFrame(frame);
    window.scrollTo({top,behavior});
  },[scrollTopForFrame]);
  const finishIntro=useCallback(()=>{
    pendingIntroRef.current=false;
    pause();
    setDriver('scroll');
    lastFrame.current=INTRO_END_FRAME;
    player.current?.seekTo(INTRO_END_FRAME);
  },[pause,setDriver]);
  const takeOver=useCallback(()=>{
    pendingIntroRef.current=false;
    if(driverRef.current==='scroll') return;
    if(driverRef.current==='intro'){finishIntro();return;}
    pause();
    setDriver('scroll');
    if(lastFrame.current<INTRO_END_FRAME){
      lastFrame.current=INTRO_END_FRAME;
      player.current?.seekTo(INTRO_END_FRAME);
    }
  },[finishIntro,pause,setDriver]);
  const leaveStory=useCallback(()=>{pendingIntroRef.current=false;pause();setDriver('scroll');},[pause,setDriver]);

  useEffect(()=>{
    const element=viewport.current;
    if(!element) return;
    const observer=new ResizeObserver(entries=>{
      const rect=entries[0].contentRect;
      if(rect.width<=0 || rect.height<=0) return;
      // Typography uses real CSS pixels, independent of the illustration resolution.
      const width=Math.max(1,Math.round(rect.width));
      const height=Math.max(1,Math.round(rect.height));
      setSize(previous=>previous.width===width&&previous.height===height?previous:{width,height});
    });
    observer.observe(element);
    return ()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    const p=player.current;
    if(!p) return;
    let scrollRaf=0,startRaf=0;
    const report=frame=>{
      lastFrame.current=frame;
      const fraction=clamp((frame-INTRO_END_FRAME)/(LAST_FRAME-INTRO_END_FRAME),0,1);
      if(progress.current) progress.current.style.width=`${fraction*100}%`;
      const next=getChapter(frame);
      if(progressTrack.current){
        progressTrack.current.setAttribute('aria-valuenow',String(Math.round(fraction*100)));
        progressTrack.current.setAttribute('aria-valuetext',CHAPTERS[next].title);
      }
      if(next!==currentChapter.current){currentChapter.current=next;setChapter(next);}
      if(story.current){story.current.dataset.chapter=String(next);story.current.dataset.opening=String(frame<INTRO_END_FRAME);}
    };
    const updateFromScroll=()=>{
      scrollRaf=0;
      if(driverRef.current!=='scroll' || !story.current) return;
      const rect=story.current.getBoundingClientRect();
      const height=stage.current?.getBoundingClientRect().height || window.innerHeight;
      const fraction=clamp(-rect.top/Math.max(1,rect.height-height),0,1);
      const frame=Math.round(INTRO_END_FRAME+fraction*(LAST_FRAME-INTRO_END_FRAME));
      if(frame!==lastFrame.current) p.seekTo(frame);
    };
    const scheduleScroll=()=>{if(!scrollRaf) scrollRaf=requestAnimationFrame(updateFromScroll);};
    const tryStartPendingIntro=()=>{
      if(!pendingIntroRef.current) return;
      if(driverRef.current!=='intro' || contentHash() || window.scrollY>=8){
        pendingIntroRef.current=false;
        setDriver('scroll');
        updateFromScroll();
        return;
      }
      if(document.hidden) return;
      pendingIntroRef.current=false;
      p.play();
    };
    const onFrame=event=>{
      const frame=event.detail.frame;
      report(frame);
      if(driverRef.current==='intro' && frame>=INTRO_END_FRAME){finishIntro();return;}
    };
    const onPlay=()=>{pendingIntroRef.current=false;isPlaying.current=true;setPlaying(true);};
    const onPause=()=>{isPlaying.current=false;setPlaying(false);};
    const onEnded=()=>{onPause();setDriver('scroll');report(LAST_FRAME);};
    const onScroll=()=>{
      if(driverRef.current==='intro' && Math.abs(window.scrollY-scrollTopForFrame(INTRO_END_FRAME))>3) takeOver();
      scheduleScroll();
    };
    const onUserScroll=()=>{takeOver();scheduleScroll();};
    const onKeyScroll=event=>{
      if(event.altKey || event.ctrlKey || event.metaKey) return;
      if(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) return;
      if(event.target instanceof Element){
        if(event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
        if(event.key===' ' && event.target.closest('button,a,[role="button"]')) return;
      }
      onUserScroll();
    };
    const onNavigate=event=>{
      if(event.target instanceof Element && event.target.closest('a[href]')) leaveStory();
    };
    const onHashChange=()=>{leaveStory();scheduleScroll();};
    const onVisibility=()=>{if(document.hidden) pause();else tryStartPendingIntro();};
    p.addEventListener('frameupdate',onFrame);
    p.addEventListener('play',onPlay);
    p.addEventListener('pause',onPause);
    p.addEventListener('ended',onEnded);
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',scheduleScroll,{passive:true});
    window.addEventListener('wheel',onUserScroll,{passive:true});
    window.addEventListener('touchmove',onUserScroll,{passive:true});
    window.addEventListener('keydown',onKeyScroll);
    window.addEventListener('hashchange',onHashChange);
    document.addEventListener('click',onNavigate,true);
    document.addEventListener('visibilitychange',onVisibility);
    report(initialFrame);
    startRaf=requestAnimationFrame(()=>{
      if(pendingIntroRef.current) tryStartPendingIntro();
      else if(driverRef.current==='scroll') updateFromScroll();
    });
    return ()=>{
      cancelAnimationFrame(scrollRaf);cancelAnimationFrame(startRaf);
      p.removeEventListener('frameupdate',onFrame);p.removeEventListener('play',onPlay);
      p.removeEventListener('pause',onPause);p.removeEventListener('ended',onEnded);
      window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',scheduleScroll);
      window.removeEventListener('wheel',onUserScroll);window.removeEventListener('touchmove',onUserScroll);
      window.removeEventListener('keydown',onKeyScroll);window.removeEventListener('hashchange',onHashChange);
      document.removeEventListener('click',onNavigate,true);
      document.removeEventListener('visibilitychange',onVisibility);
      p.pause();
    };
  },[finishIntro,initial,initialFrame,leaveStory,pause,scrollToFrame,scrollTopForFrame,setDriver,takeOver]);

  const toggleOpening=event=>{
    if(isPlaying.current) pause();
    else player.current?.play(event);
  };
  const seekChapter=index=>{
    pendingIntroRef.current=false;
    pause();setDriver('scroll');
    const target=index===0?INTRO_END_FRAME:clamp(STARTS[index]+(index===2?80:45),INTRO_END_FRAME,LAST_FRAME);
    const top=scrollTopForFrame(target);
    if(Math.abs(window.scrollY-top)<1) player.current?.seekTo(target);
    scrollToFrame(target,window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth');
  };

  return <section id="story" className="story-scroll" ref={story} aria-label="椿襄的个人故事" data-chapter={chapter} data-driver={driver}>
    <div className="story-stage" ref={stage}>
      <div className="film-viewport" ref={viewport} aria-hidden="true">
        <Player ref={player} component={Film} compositionWidth={size.width} compositionHeight={size.height} durationInFrames={TOTAL_FRAMES} fps={FPS} initialFrame={initialFrame} controls={false} autoPlay={false} initiallyMuted clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} moveToBeginningWhenEnded={false} numberOfSharedAudioTags={0} style={{width:'100%',height:'100%'}} errorFallback={()=> <div className="film-error">动画暂时无法播放，请向下阅读完整档案。</div>}/>
      </div>
      <div className="film-accessible sr-only"><h1>椿襄 · {profile.role}</h1><p>武汉大学软件工程背景。重点介绍 OPD + RL 后训练与开源 benchmark SOTA，以及自 2026 年 9 月 20 日起在字节跳动国际商业化部门的 Agent 开发实习：Claude Code 内核接入、业务流程适配、Skill 优化与 Bad Case Studio。随后是团队成果与生活。三维水墨古厝随滚动切换视角，穿门后进入放有研究手记、开发笔记本和 Agent 流程板的庭院工作台；也可切换章节或直接阅读下方完整资料。</p></div>
      <div className="story-controls">
        <div className="chapter-nav" role="group" aria-label="故事章节">{CHAPTERS.map((item,index)=><button key={item.title} type="button" aria-pressed={chapter===index} onClick={()=>seekChapter(index)}><small>{String(index+1).padStart(2,'0')}</small><span>{item.title}</span></button>)}</div>
        {driver==='intro'&&<div className="story-actions">
          <button type="button" className="journey-toggle" onClick={toggleOpening}>{playing?'暂停开场':'继续开场'}</button>
          <button type="button" className="skip-intro" onClick={finishIntro}>跳过开场 ↗</button>
        </div>}
        {driver!=='intro'&&<a className="story-dossier-link" href="#dossier">项目详录 <span aria-hidden="true">↗</span></a>}
      </div>
      <div className="story-progress" ref={progressTrack} role="progressbar" aria-label="故事进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i ref={progress}/></div>
    </div>
  </section>;
}

function Contact(){
  const [copied,setCopied]=useState('');
  const copy=async()=>{try{await navigator.clipboard.writeText('mshuwhu@whu.edu.cn');setCopied('已复制');}catch{setCopied('请直接选择邮箱复制');}};
  return <section id="contact" className="contact-end"><div className="contact-rule"><span>NEXT / TO BE CONTINUED</span><span>继续下一步</span><i>+</i></div><div className="contact-grid"><div><p>从一次连接开始。</p><h2>下一个想法，<br/>一起做出来。</h2></div><div className="contact-methods"><a href="mailto:mshuwhu@whu.edu.cn"><small>写封邮件</small><strong>mshuwhu@whu.edu.cn</strong><span>↗</span></a><a href="tel:+8618289423880"><small>打个电话</small><strong>+86 182 8942 3880</strong><span>↗</span></a><button onClick={copy}>复制邮箱 ⧉</button><span role="status">{copied}</span></div></div><footer><a href="#top">椿襄 <small>CHUNXIANG</small></a><span>工程、探索与生活，还在继续。</span><a href="#top">回到起点 ↑</a></footer></section>;
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
