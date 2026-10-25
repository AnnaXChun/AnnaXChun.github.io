import React,{lazy,Suspense,useEffect,useState} from 'react';
import {AbsoluteFill,Img,useCurrentFrame} from 'remotion';
import MinnanScene from './MinnanScene';
const loadBadminton=()=>import('./BadmintonScene');
const BadmintonScene=lazy(loadBadminton);
import './cinematic.css';

export const FPS=30;
export const INTRO_END_FRAME=90;
export const STARTS=[0,270,540,810,1050];
export const TOTAL_FRAMES=1560;
export const CHAPTERS=[
  {title:'起笔',line:'椿襄 · Agent 开发、后训练算法工程师'},
  {title:'后训练',line:'OPD + RL · 开源 benchmark SOTA'},
  {title:'实习',line:'字节跳动 · 国际商业化 · Agent 开发'},
  {title:'成果',line:'与伙伴一起，让成果落地。'},
  {title:'生活',line:'工作之外，也有自己的节奏。'},
];
const clamp=t=>Math.min(1,Math.max(0,t));
const range=(frame,start,end)=>{const t=clamp((frame-start)/(end-start));return t*t*(3-2*t);};
const chapterOpacity=(frame,index)=>{
  const enter=range(frame,index===0?0:index===2?576:STARTS[index]+4,index===0?48:index===2?612:STARTS[index]+42);
  const leave=index===4?0:index===1?range(frame,445,480):range(frame,STARTS[index+1]-38,STARTS[index+1]-4);
  return enter*(1-leave);
};
const STORIES=[
  {eyebrow:'CHUNXIANG / PORTFOLIO',depth:'椿襄',title:['Agent 开发','后训练算法工程师'],body:'专注智能体工具调用、强化学习后训练与多步推理。从模型训练，走向真实业务中的 Agent 开发。',note:'武汉大学 · 软件工程背景'},
  {eyebrow:'01 / POST-TRAINING',depth:'OPD + RL',title:['开源 benchmark','SOTA'],body:'围绕 OPD + RL 开展智能体后训练研究。从训练方法，到可比较的评测结果。',note:'OPD + RL / Agent Post-training'},
  {eyebrow:'02 / AGENT ENGINEERING',depth:'AGENT',title:['在字节跳动，','开发 Agent。'],body:'将 Claude Code 内核接入内部 Agent，适配国际商业化业务，开展 Skill 优化与 Bad Case Studio 开发。',note:'2026.09.20 — 至今 · 国际商业化'},
  {eyebrow:'03 / SELECTED WORK',depth:'一起成形',title:['与伙伴，一起探索。'],body:'从 DeepDog 到数字孪生三维人体重建，技术路线、团队协作与验证，最终落在看得见的成果上。',note:'团队成果 / 原始材料'},
  {eyebrow:'04 / OFF THE CLOCK',depth:'球场见',title:['读拍面，','看重心。'],body:'享受单打的节奏，也重视双打里的补位、喊球和默契。观察、调整，再试一次。',note:'羽毛球 / 健身 / 视频剪辑'},
];
function DepthTitle({index,frame}) {
  const alpha=chapterOpacity(frame,index);if(!alpha)return null;
  const end=index===1?480:STARTS[index+1]??TOTAL_FRAMES;
  const outgoing=index===4?range(frame,1280,1410):range(frame,end-70,end-3);
  const incoming=range(frame,STARTS[index]+4,STARTS[index]+60);
  return <div className={`depth-title depth-title-${index}`} data-leaf-surface={index<4&&alpha>.98&&outgoing<.001?index:undefined} data-leaf-pose={Math.round((1-incoming)*650)} style={{opacity:alpha*(index===4?1-range(frame,1370,1445):1),zIndex:outgoing>.15?6:1}} aria-hidden="true">
    {[...STORIES[index].depth].map((letter,i)=><span key={i} style={{transform:`translate3d(${outgoing*(i%2?18:-18)}px,${(1-incoming)*65-outgoing*(100+i*24)}px,${outgoing*520}px) rotateY(${outgoing*(i%2?20:-24)}deg) rotateX(${-outgoing*12}deg) rotate(${outgoing*(i%2?8:-9)}deg)`,opacity:1-outgoing*.8}}>{letter}</span>)}
  </div>;
}
function StoryPanel({index,frame}) {
  const alpha=chapterOpacity(frame,index);if(!alpha)return null;
  const lifeClear=index===4?1-range(frame,1265,1320)+range(frame,1470,1530):1;
  const progress=range(frame,STARTS[index]+45,(STARTS[index+1]??TOTAL_FRAMES)-45);
  return <div className={`shot-copy shot-copy-${index}`} style={{opacity:alpha*lifeClear,transform:`translate3d(0,${(1-alpha)*35-progress*18}px,0)`}}>
    <div className="shot-eyebrow">{STORIES[index].eyebrow}</div>
    <h2 className="shot-title">{STORIES[index].title.map(line=><span key={line}>{line}</span>)}</h2>
    <p className="shot-description">{STORIES[index].body}</p>
    <div className="shot-note">{STORIES[index].note}</div>
  </div>;
}
function EvidenceCards({frame}) {
  const alpha=chapterOpacity(frame,3);if(!alpha)return null;
  const p=range(frame,810,1035);
  return <div className="cinema-evidence" style={{opacity:alpha}}>
    <figure className="cinema-evidence-primary" style={{transform:`translate3d(${(1-p)*-4}%,${(1-p)*14}%,0) rotate(${-7+p*5}deg)`}}>
      <div className="evidence-mount"><Img src="./assets/xiaomi-2025-first.webp" alt="DeepDog 小米杯全国一等奖获奖证书" /></div>
      <figcaption><strong>全国一等奖</strong><span>DeepDog · 小米杯</span></figcaption>
    </figure>
    <figure className="cinema-evidence-secondary" style={{transform:`translate3d(0,${(1-p)*-9}%,0) rotate(${6-p*3}deg)`}}>
      <div className="evidence-mount"><Img src="./assets/design-digital-twin-first.webp" alt="数字孪生三维人体重建，中南地区一等奖获奖证书" /></div>
      <figcaption><strong>中南地区一等奖</strong><span>数字孪生 · 三维重建</span></figcaption>
    </figure>
  </div>;
}
function CourtyardBackdrop({frame,opacity}){
  return <div className="courtyard-tone" style={{opacity,'--drift':`${-Math.min(frame,1050)/65}px`}} aria-hidden="true">
    <div className="courtyard-daylight"/>
    <svg className="courtyard-distance" viewBox="0 0 1600 900" preserveAspectRatio="none">
      <defs>
        <linearGradient id="ridge-wash" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7298ae" stopOpacity=".28"/><stop offset="1" stopColor="#d1e8f2" stopOpacity="0"/></linearGradient>
        <linearGradient id="near-wash" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#789da7" stopOpacity=".17"/><stop offset="1" stopColor="#edf7fa" stopOpacity="0"/></linearGradient>
        <filter id="distant-air"><feGaussianBlur stdDeviation="1.3"/></filter>
      </defs>
      <g filter="url(#distant-air)" fill="url(#ridge-wash)">
        <path d="M-80 470 C30 455 63 406 122 395 C174 385 195 343 246 356 C291 368 308 391 346 381 C391 368 419 423 469 427 C528 435 572 391 628 400 C675 411 718 451 759 446 C809 434 844 411 898 430 C944 448 975 410 1012 385 C1044 365 1080 378 1119 342 C1154 309 1199 325 1238 367 C1285 418 1321 385 1370 409 C1430 437 1459 395 1516 414 C1564 430 1623 455 1680 451 L1680 760 L-80 760Z"/>
      </g>
      <path fill="url(#near-wash)" d="M-80 580 C5 534 56 551 119 513 C164 487 198 499 244 523 C283 542 314 526 361 550 C410 574 465 556 518 576 C600 607 649 578 713 591 C796 610 848 564 922 587 C990 605 1054 558 1108 550 C1163 541 1197 572 1254 542 C1316 507 1372 533 1415 505 C1482 463 1510 504 1584 490 L1680 690 L1680 900 L-80 900Z"/>
    </svg>
    <svg className="courtyard-cast-shade" viewBox="0 0 700 800" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="#476c81" strokeLinecap="round"><path d="M-60 850 Q220 600 210 410 Q218 205 470 -35" strokeWidth="11"/><path d="M212 470 Q340 400 502 415 M220 348 Q107 231 60 140 M285 190 Q447 205 590 100 M202 570 Q88 530 10 438" strokeWidth="5"/></g>
      <g fill="#476c81">
        <path d="M213 340 Q135 252 141 197 Q213 229 213 340 M290 189 Q280 110 329 57 Q356 134 290 189 M403 200 Q421 117 484 105 Q477 179 403 200 M350 408 Q350 329 408 302 Q424 366 350 408 M467 414 Q527 353 582 371 Q540 427 467 414 M121 530 Q87 458 108 412 Q163 463 121 530 M73 181 Q10 142 4 79 Q78 95 73 181"/>
      </g>
    </svg>
    <div className="courtyard-ground-air"/>
  </div>;
}
export default function Film() {
  const frame=useCurrentFrame(),chapter=Math.max(0,STARTS.findLastIndex(f=>frame>=f));
  const warmLife=frame>800;
  const [lifeMounted,setLifeMounted]=useState(frame>975);
  useEffect(()=>{if(frame>975)setLifeMounted(true);},[frame]);
  useEffect(()=>{if(warmLife)loadBadminton().then(m=>m.preloadSportAssets()).catch(()=>{});},[warmLife]);
  const life=range(frame,1015,1080);
  return <AbsoluteFill className={`ink-film cinematic-film scene-${chapter}`}>
    <CourtyardBackdrop frame={frame} opacity={1-life}/>
    <div className="life-tone" style={{opacity:life}}/>
    {STORIES.map((_,index)=><DepthTitle key={index} index={index} frame={frame}/>)}
    <div className="ink-landscape full-courtyard-frame" style={{opacity:1-life}}><MinnanScene frame={frame} active={frame<1080} opacity={(.35+.65*range(frame,0,72))*(1-chapterOpacity(frame,3)*.94)}/></div>
    {lifeMounted&&<div className="life-visual" style={{opacity:life}}><Suspense fallback={null}><BadmintonScene frame={frame} active={frame>975}/></Suspense></div>}
    {STORIES.map((_,index)=><StoryPanel key={index} index={index} frame={frame}/>)}
    <EvidenceCards frame={frame}/>
    {chapter===4&&<div className="scroll-cue" style={{opacity:1-range(frame,1190,1240)}}>向下滚动，随之挥拍 <span>↓</span></div>}
    {chapter===0&&<div className="ink-signature" aria-hidden="true"><span>椿</span><span>襄</span></div>}
  </AbsoluteFill>;
}
