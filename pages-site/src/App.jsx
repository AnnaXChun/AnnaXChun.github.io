import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import SportChapter from './SportChapter';
import {profile,projects,awards,interests} from './data';
import {pointerPose} from './RetroMotion';
gsap.registerPlugin(ScrollTrigger);

function useReducedMotion(){
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  return reduced;
}
function SectionLabel({number,children,aside}){return <div className="section-label"><span>{number} / {children}</span>{aside&&<span>{aside}</span>}</div>;}
function Hero({reduced}){
  const root=useRef(null);
  useLayoutEffect(()=>{
    const element=root.current;
    if(reduced)return;
    let alive=true,context;
    Promise.all([document.fonts.ready,element.querySelector('img').decode().catch(()=>{})]).then(()=>{
      if(!alive)return;
      context=gsap.context(()=>{
        gsap.from('.hero-line > span',{yPercent:105,duration:1.05,ease:'power3.out',stagger:.1,clearProps:'transform'});
        gsap.from('.hero-detail',{y:16,opacity:0,duration:.8,delay:.2,stagger:.07,clearProps:'all'});
        gsap.from('.forest-entrance',{y:45,opacity:0,scale:1.025,duration:1.25,ease:'power3.out',clearProps:'all'});
        gsap.to('.forest-parallax',{yPercent:9,rotation:2,ease:'none',scrollTrigger:{trigger:element,start:'top top',end:'bottom top',scrub:.35}});
        gsap.to('.hero-landscape',{yPercent:6,ease:'none',scrollTrigger:{trigger:element,start:'top top',end:'bottom top',scrub:.7}});
        gsap.to('.hero-copy',{yPercent:-12,ease:'none',scrollTrigger:{trigger:element,start:'top top',end:'bottom top',scrub:.35}});
      },element);
    });
    const observer=new IntersectionObserver(([entry])=>{element.dataset.visible=String(entry.isIntersecting);});observer.observe(element);
    const head=element.querySelector('.forest-head'),body=element.querySelector('.forest-body');
    const targets=[[head,'rotationY',.65],[head,'rotationX',.65],[head,'rotation',.7],[head,'x',.7],[body,'x',.95]];
    const setters=targets.map(([node,key,duration])=>gsap.quickTo(node,key,{duration,ease:'power3.out'}));
    const move=event=>{
      if(event.pointerType==='touch')return;
      const pose=pointerPose(event.clientX/innerWidth,event.clientY/innerHeight);
      [pose.yaw,pose.pitch,pose.roll,pose.shift,pose.shift*.25].forEach((value,i)=>setters[i](value));
    };
    const leave=()=>setters.forEach(set=>set(0));element.addEventListener('pointermove',move);element.addEventListener('pointerleave',leave);
    return()=>{alive=false;context?.revert();observer.disconnect();element.removeEventListener('pointermove',move);element.removeEventListener('pointerleave',leave);setters.forEach(set=>set.tween.kill());gsap.set([head,body],{clearProps:'transform'});};
  },[reduced]);
  return <section className="storybook-hero" id="top" ref={root} data-visible="true" aria-labelledby="hero-title">
    <div className="hero-landscape" aria-hidden="true"><img src="./assets/story-landscape.webp" alt="" width="1672" height="941" fetchPriority="high"/></div>
    <div className="hero-wordmark">椿襄<span aria-hidden="true">✳</span></div>
    <a className="hero-contact" href="#contact">打个招呼 <span>↗</span></a>
    <div className="hero-edition">CHUNXIANG’S FIELD NOTES<br/>在研究、生活与好奇之间</div>
    <div className="hero-copy">
      <p className="hero-kicker hero-detail"><i/> 你好，我是椿襄。</p>
      <h1 id="hero-title"><span className="hero-line"><span>带着好奇，</span></span><span className="hero-line"><span>让想法生长。</span></span></h1>
      <p className="hero-role hero-detail">Agent 开发、后训练算法工程师</p>
      <p className="hero-intro hero-detail">从 OPD + RL 到真实业务中的 Agent。<br/>让研究有结果，让想法能运行。</p>
      <div className="hero-links hero-detail"><a className="pill" href="#research">看看我的研究 <span>↗</span></a><a className="pill" href="#experience">现在在字节 <span>↗</span></a><a className="pill pill-outline" href="#about">认识我 <span>↓</span></a></div>
    </div>
    <div className="forest-parallax" aria-hidden="true"><div className="forest-entrance"><div className="forest-character"><img className="forest-body" src="./assets/story-body.webp" alt="" width="1086" height="1448" fetchPriority="high"/><div className="forest-head"><img src="./assets/story-messenger.webp" alt="" width="1086" height="1448"/></div></div></div></div>
    <p className="hero-postcard" aria-hidden="true">带着好奇，去远一点。<span>一封写给未来的信 ↗</span></p>
    <div className="hero-bottom"><span>武汉大学 · 软件工程</span><a href="#research">向下探索 <span>↓</span></a><span>一点好奇，一直向前。</span></div>
  </section>;
}
function Research(){return <section id="research" className="research section-pad" aria-labelledby="research-title">
  <SectionLabel number="01" aside="一页研究手记">后训练 · 探索新的可能</SectionLabel>
  <div className="research-heading"><h2 id="research-title" data-reveal>让模型，<br/>更进一步。</h2><p data-reveal>我关注智能体后训练，<br/>从训练方法到真实评测，<br/>持续追问能力的下一步。</p></div>
  <div className="training-composition" data-tilt-stage aria-label="OPD 加强化学习，开源 benchmark SOTA"><div className="training-type" data-drift><span>OPD</span><em>+</em><span>RL</span></div><div className="paper-depth" data-tilt><div className="paper-scroll"><img src="./assets/story-plane.webp" alt="" width="1280" height="1280" loading="lazy"/></div></div><div className="sota-stamp"><span>OPEN BENCHMARK</span><strong>SOTA</strong><span>AGENT POST-TRAINING ↗</span></div><span className="flight-note" aria-hidden="true">每一次尝试，向前一点。<svg viewBox="0 0 300 85"><path d="M4 70 C100 10 150 120 240 25 L255 8 M235 10 L255 8 L250 29" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 7"/></svg></span></div>
  <div className="research-bottom"><p>围绕 OPD + RL 开展智能体后训练研究，<br/>在开源 benchmark 上取得 SOTA。</p><span>探索 → 训练 → 评测</span></div>
</section>;}
function Experience(){return <section className="experience section-pad" id="experience" aria-labelledby="experience-title">
  <SectionLabel number="02" aside="2026.09.20 — 至今">实习 · 把想法带进日常</SectionLabel>
  <div className="experience-grid"><div className="experience-title" data-reveal><p>字节跳动 · 国际商业化</p><h2 id="experience-title">让想法，<br/>走进日常<span>。</span></h2><span className="experience-role">Agent 开发实习</span><p className="experience-intro">把模型能力接入业务，<br/>让 Agent 在真实流程里工作。</p></div>
  <div className="experience-list" data-tilt-stage>{[
    ['01','Claude Code','内核接入','将 Claude Code 内核接入公司内部 Agent，连接模型与工具执行。'],
    ['02','Workflow','业务流程适配','围绕国际商业化场景，适配 Agent 工作流与业务流程。'],
    ['03','Skills','能力优化','开展 Skill 优化，让智能体能力更贴合实际任务。'],
    ['04','Bad Case Studio','问题分析与迭代','参与 Bad Case Studio 相关开发，从实际问题推进系统改进。'],
  ].map(([n,en,title,body])=><article key={n} className="experience-file" data-file><span>{n}</span><div><h3>{en}</h3><h4>{title}</h4><p>{body}</p></div></article>)}</div></div>
</section>;}
function Archive(){
  const [selected,setSelected]=useState(null);const dialog=useRef(null),opener=useRef(null);
  useEffect(()=>{if(!selected)return;dialog.current.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[selected]);
  const open=(event,award)=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0||!dialog.current?.showModal)return;event.preventDefault();opener.current=event.currentTarget;setSelected(award);};
  const close=()=>{setSelected(null);opener.current?.focus({preventScroll:true});};
  return <section id="work" className="work section-pad" aria-labelledby="work-title"><SectionLabel number="03" aside="沿途收获">作品与成果</SectionLabel><div className="work-heading"><h2 id="work-title" data-reveal>一起，把想法做成。</h2><p>项目、协作，和看得见的成果。</p></div>
    <div className="award-featured">{[awards[0],awards[4]].map((a,index)=><a key={a.id} href={a.image} onClick={e=>open(e,a)} aria-haspopup="dialog" className={`award-print award-print-${index}`}><div className="award-image"><img src={a.image} alt={`${a.title}原始获奖证书`} loading="lazy"/></div><div className="award-caption"><span><strong>{a.title}</strong><small>{a.meta}</small></span><span aria-hidden="true">↗</span></div></a>)}</div>
    <div className="project-register"><h3>更多研究与经历 <span>INDEX / 04</span></h3>{projects.slice(2).map((p,i)=><details key={p.id}><summary><span>0{i+1}</span><div><strong>{p.title}</strong><small>{p.period||p.organization}</small></div><b aria-hidden="true">+</b></summary><div className="project-detail"><p>{p.summary}</p>{p.details&&<p>{p.details}</p>}<div className="tags">{p.stack.map(s=><span key={s}>{s}</span>)}</div>{p.proof&&<p>{p.proof}</p>}{p.image&&<a href={p.image} target="_blank" rel="noreferrer"><img src={p.image} alt={p.imageAlt} loading="lazy"/><span>{p.imageCredit||'查看原始材料'} ↗</span></a>}</div></details>)}</div>
    <details className="award-register"><summary>查看完整成果档案 <span>08 RECORDS <b>+</b></span></summary><div>{awards.map(a=><a key={a.id} href={a.image} onClick={e=>open(e,a)} aria-haspopup="dialog"><span>{a.year||'研究'}</span><strong>{a.title}<small>{a.meta}</small></strong><span>↗</span></a>)}</div></details>
    <dialog ref={dialog} className="archive-dialog" aria-labelledby="archive-title" onClose={close} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.current.close();}}}><div className="dialog-top"><span>ARCHIVE / 原始材料</span><button autoFocus onClick={()=>dialog.current.close()}>关闭 ×</button></div>{selected&&<><img src={selected.image} alt={`${selected.title}原始材料`}/><h3 id="archive-title">{selected.title}</h3><p>{selected.description}</p><a href={selected.image} target="_blank" rel="noreferrer">打开原图 ↗</a></>}</dialog>
  </section>;
}
function About(){return <section id="about" className="about section-pad" aria-labelledby="about-title"><SectionLabel number="04" aside="生活不止一种答案">关于我</SectionLabel><div className="about-grid" data-tilt-stage><figure className="about-photo" data-tilt><img src={profile.portrait} alt="椿襄的手绘风格肖像" width="1122" height="1402" loading="lazy"/><figcaption>CHUNXIANG / ENFP</figcaption></figure><div className="about-copy" data-reveal><p className="eyebrow">屏幕之外，我是椿襄。</p><h2 id="about-title">保持好奇。<br/>认真投入。</h2><p>{profile.introduction}</p><p className="about-education">{profile.education}<br/>Agent 开发、后训练算法工程师</p><div className="tags"><span>羽毛球</span><span>健身</span><span>视频剪辑</span></div><a className="text-link" href="#life">下一站，球场见 ↓</a></div></div></section>;}
function Contact(){return <section id="contact" className="contact section-pad"><SectionLabel number="06" aside="故事还在继续">留一封信</SectionLabel><div className="contact-heading"><h2>下一段旅程，<br/>一起出发。</h2><a className="contact-arrow" href={`mailto:${profile.email}`} aria-label="发邮件给椿襄">↗</a></div><div className="contact-links"><a href={`mailto:${profile.email}`}>{profile.email} ↗</a><a href="https://github.com/AnnaXChun" target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.phoneHref}>{profile.phone} ↗</a></div><div className="life-notes">{interests.slice(1).map(i=><p key={i.id}><strong>{i.title}</strong>{i.description}</p>)}</div><footer><a href="#top">椿襄 <span>CHUNXIANG</span></a><a href="./model-credits.html">素材署名 ↗</a><a href="#top">回到顶部 ↑</a></footer></section>;}
export default function App(){
  const reduced=useReducedMotion(),root=useRef(null);
  useLayoutEffect(()=>{
    if(reduced)return;
    const context=gsap.context(()=>{
      gsap.utils.toArray('[data-reveal]').forEach(node=>gsap.from(node,{y:38,opacity:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:node,start:'top 94%',once:true}}));
      gsap.fromTo('.paper-scroll',{rotation:-12,x:-35,y:80},{rotation:9,x:35,y:-70,ease:'none',scrollTrigger:{trigger:'.training-composition',start:'top bottom',end:'bottom top',scrub:.55}});
      gsap.utils.toArray('[data-file]').forEach((node,i)=>gsap.from(node,{x:i%2?-65:65,y:60,rotation:i%2?-8:8,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:node,start:'top 94%',once:true},clearProps:'all'}));
      gsap.utils.toArray('[data-drift]').forEach(node=>gsap.fromTo(node,{xPercent:-3},{xPercent:3,ease:'none',scrollTrigger:{trigger:node,start:'top bottom',end:'bottom top',scrub:.4}}));
    },root);
    const tiltCleanup=gsap.utils.toArray('[data-tilt-stage]',root.current).map(stage=>{
      const nodes=[...stage.querySelectorAll('[data-tilt],[data-file]')];let bounds;
      const setters=nodes.map(node=>({node,x:gsap.quickTo(node,'rotationY',{duration:.8,ease:'power3.out'}),y:gsap.quickTo(node,'rotationX',{duration:.8,ease:'power3.out'})}));
      const enter=()=>{bounds=stage.getBoundingClientRect();};
      const move=event=>{if(event.pointerType==='touch')return;if(!bounds)enter();const pose=pointerPose((event.clientX-bounds.left)/bounds.width,(event.clientY-bounds.top)/bounds.height);setters.forEach((set,i)=>{set.x(pose.yaw*(.55+i*.06));set.y(pose.pitch*.7);});};
      const leave=()=>{bounds=null;setters.forEach(set=>{set.x(0);set.y(0);});};
      stage.addEventListener('pointerenter',enter);stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);
      return()=>{stage.removeEventListener('pointerenter',enter);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);setters.forEach(set=>{set.x.tween.kill();set.y.tween.kill();gsap.set(set.node,{clearProps:'transform'});});};
    });
    let raf;const refresh=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>ScrollTrigger.refresh());};
    const observer=new ResizeObserver(refresh);observer.observe(root.current);document.fonts.ready.then(refresh);
    return()=>{tiltCleanup.forEach(cleanup=>cleanup());context.revert();observer.disconnect();cancelAnimationFrame(raf);};
  },[reduced]);
  return <><a className="skip-link" href="#research">跳到研究与经历</a><main ref={root}><Hero reduced={reduced}/><Research/><Experience/><Archive/><About/><SportChapter reduced={reduced}/><Contact/></main></>;
}
