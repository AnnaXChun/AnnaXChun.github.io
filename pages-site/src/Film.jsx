import React, {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {createWorkshop} from './WorkshopModel';
import {sampleCamera} from './CameraRig';
import {profile} from './data';

export const FPS=30;
export const INTRO_END_FRAME=180;
export const STARTS=[0,330,570,810,1050];
export const TOTAL_FRAMES=1320;
export const CHAPTERS=[
  {title:'起笔',line:'把想法，一层层建成。'},
  {title:'搭建',line:'可靠的系统，从每一处细节开始。'},
  {title:'探索',line:'让推理进入真实的执行过程。'},
  {title:'成形',line:'与伙伴一起，让成果落地。'},
  {title:'生活',line:'下一步，也在屏幕之外。'},
];
const CREAM='#f6f1df', BLUE='#244bc5';
const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
const smooth=t=>t*t*(3-2*t);
const range=(f,a,b)=>smooth(clamp((f-a)/(b-a)));
const mix=(a,b,t)=>a+(b-a)*t;
const cut=(f,keys,values)=>{
  let i=0;while(i<keys.length-2&&f>keys[i+1])i++;
  return mix(values[i],values[i+1],range(f,keys[i],keys[i+1]));
};

function ThreeWorkshop({frame,width,height}){
  const host=useRef(null), runtime=useRef(null), current=useRef(frame);
  const [failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    let alive=true;
    const container=host.current;
    let renderer, model;
    const disposables=[];
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.5,1920/width));
      renderer.setSize(width,height);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.0;
      renderer.shadowMap.enabled=true;
      renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      const scene=new THREE.Scene();
      scene.background=new THREE.Color(CREAM);
      scene.fog=new THREE.Fog(CREAM,38,85);
      const camera=new THREE.PerspectiveCamera(37,width/height,.1,110);
      scene.add(new THREE.HemisphereLight(0xfffbef,0x5576df,1.7));
      const sun=new THREE.DirectionalLight(0xfff5df,2.7);
      sun.position.set(-7,15,7);sun.castShadow=true;
      sun.shadow.mapSize.set(2048,2048);
      sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;
      sun.shadow.camera.near=1;sun.shadow.camera.far=45;sun.shadow.normalBias=.045;sun.shadow.bias=-.0001;
      sun.shadow.blurSamples=6;
      scene.add(sun);
      const fill=new THREE.DirectionalLight(0x4673ff,.65);fill.position.set(12,5,-8);scene.add(fill);
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshBasicMaterial({color:CREAM,toneMapped:false}));
      ground.rotation.x=-Math.PI/2;ground.position.y=-.32;ground.receiveShadow=true;scene.add(ground);
      disposables.push(ground.geometry,ground.material);
      const contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.ShadowMaterial({color:0x243358,opacity:.13}));
      contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=-.315;contactShadow.receiveShadow=true;scene.add(contactShadow);
      disposables.push(contactShadow.geometry,contactShadow.material);
      model=createWorkshop(THREE);scene.add(model.group);

      // The illustrated portrait is attached to the notebook page in world space.
      // Its angle stays fixed as the camera moves closer to the desk.
      const imageMat=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});
      const imageGeo=new THREE.PlaneGeometry(1,1.25);
      const portrait=new THREE.Mesh(imageGeo,imageMat);
      portrait.name='Portrait printed inside the notebook';
      model.portraitAnchor.add(portrait);
      const texture=new THREE.TextureLoader().load(profile.portrait,()=>{
        if(!alive)return;
        texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());imageMat.map=texture;imageMat.needsUpdate=true;
        runtime.current?.draw(current.current);
      });
      disposables.push(imageGeo,imageMat,texture);
      const mobile=width<900;
      const draw=f=>{
        const p=clamp((f-65)/(1319-65));
        model.update(p);
        const shot=sampleCamera(f,{aspect:width/height,mobile,compact:height/width<1.85});
        camera.fov=shot.fov;
        camera.setViewOffset(width,height,width*shot.shift,height*shot.verticalShift,width,height);
        camera.position.copy(shot.position);
        camera.lookAt(shot.target);
        camera.updateProjectionMatrix();
        renderer.render(scene,camera);
      };
      runtime.current={draw};
      draw(current.current);
    }catch(error){
      setFailed(true);
      console.warn('3D preview fallback:',error.message);
    }
    return ()=>{
      alive=false;runtime.current=null;model?.dispose();
      disposables.forEach(item=>item.dispose?.());
      renderer?.dispose();
      if(renderer?.domElement.parentNode===container)container.removeChild(renderer.domElement);
    };
  },[width,height]);
  useLayoutEffect(()=>{runtime.current?.draw(frame);},[frame]);
  return <div ref={host} className="three-workshop">{failed&&<div className="workshop-fallback"><Img src="./assets/pavilion.svg" style={{width:'72%',height:'100%',objectFit:'contain'}}/><span>工作台 · 静态视图</span></div>}</div>;
}

const STORIES=[
  {eyebrow:'01 / THE FIRST DRAFT',title:['把想法，','一层层建成。'],body:'我是椿襄，软件开发工程师。喜欢把陌生的问题拆开，再亲手把它做出来。',note:'武汉大学软件工程背景 · ENFP',tag:'开始认识我'},
  {eyebrow:'02 / BUILD SOMETHING RELIABLE',title:['看见表面，','也照顾内部。'],body:'从中帆协官网的支付链路，到泰康的数据库与接口开发。系统能否可靠运行，藏在每个状态和异常路径里。',note:'锁机制 / 状态机 / MySQL / RESTful API',tag:'后端与支付'},
  {eyebrow:'03 / OPEN THE POSSIBILITIES',title:['打开结构，','让推理行动。'],body:'在生命科学推理智能体中，让模型调用工具、进入沙箱执行，再根据结果继续推理。',note:'Verl / Agent Loop / Python / SFT / GRPO',tag:'生命科学推理智能体'},
  {eyebrow:'04 / MAKE IT REAL, TOGETHER',title:['一人起笔，','一起成形。'],body:'从 DeepDog 到数字孪生三维人体重建，技术路线、团队协作与验证，最终落在看得见的成果上。',note:'小米杯全国一等奖队长 / 中南地区计算机设计一等奖',tag:'团队与成果'},
  {eyebrow:'05 / BEYOND THE DESK',title:['合上电脑，','还有下一场。'],body:'球场上的预判，训练时的调整，剪辑里的取舍。工作之外，我也喜欢在反馈里找到下一步。',note:'羽毛球 / 健身 / 视频剪辑',tag:'屏幕之外'},
];

function StoryPanel({index,frame}){
  const data=STORIES[index];
  const start=index===0?142:STARTS[index]+4,end=index===4?TOTAL_FRAMES:STARTS[index+1];
  const enter=range(frame,start,start+(index===0?36:42));
  const leave=index===4?0:index===0?range(frame,215,265):range(frame,end-42,end-4);
  const alpha=enter*(1-leave);
  if(alpha<=0)return null;
  const shift=(1-enter)*32+(leave*-24);
  return <div className={`film-copy ${index%2===0?'is-right':'is-left'}`} style={{opacity:alpha,transform:`translateY(${shift}px)`}}>
    <div className="film-eyebrow">{data.eyebrow}</div>
    <div className="film-title">
      {data.title.map((line,i)=><div key={line} style={{overflow:'hidden'}}><div style={{transform:'translateY('+((1-range(frame,start+i*5,start+(index===0?32:34)+i*5))*110)+'%)'}}>{line}</div></div>)}
    </div>
    <p className="film-description">{data.body}</p>
    {index===0&&<div className="film-person"><strong>椿襄 <span>CHUNXIANG</span></strong><span>软件开发工程师</span></div>}
    <div className="film-note">{data.note}</div>
  </div>;
}

function EvidenceCards({frame}){
  // Give the evidence the whole settled chapter, including chapter navigation's landing frame.
  const appear=range(frame,828,862)*(1-range(frame,1020,1050));
  if(appear<=0)return null;
  return <div className="film-evidence" style={{transform:`translateY(${36*(1-appear)}px)`,opacity:appear}}>
    <figure className="evidence-primary">
      <div className="evidence-mount"><Img src="./assets/xiaomi-2025-first.webp" alt="DeepDog 小米杯全国一等奖获奖证书" /></div>
      <figcaption><strong>全国一等奖</strong><span>DeepDog · 小米杯</span></figcaption>
    </figure>
    <figure className="evidence-secondary">
      <div className="evidence-mount"><Img src="./assets/design-digital-twin-first.webp" alt="数字孪生三维人体重建，中南地区一等奖获奖证书" /></div>
      <figcaption><strong>中南地区一等奖</strong><span>数字孪生 · 三维重建</span></figcaption>
    </figure>
  </div>;
}

export default function Film(){
  const frame=useCurrentFrame(),{width,height}=useVideoConfig(),mobile=width<900;
  const introAlpha=1-range(frame,48,96);
  const panel=range(frame,142,180);
  const active=Math.max(0,STARTS.findLastIndex(start=>frame>=start));
  const side=active%2===0?'right':'left';
  const panelLeft=cut(frame,[0,300,372,540,612,780,852,1020,1092,1319],[61,61,0,0,61,61,0,0,61,61]);
  const closePass=range(frame,210,270)*(1-range(frame,300,375));
  const curtainOpacity=panel*(1-closePass)*(1-range(frame,1280,1319)*.1);
  return <AbsoluteFill style={{background:CREAM,fontFamily:'"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif',overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0}}>
      <ThreeWorkshop frame={frame} width={width} height={height}/>
      <div className="film-paper-panel" style={{position:'absolute',opacity:curtainOpacity,...(mobile?{left:0,right:0,bottom:0,height:'60%',background:'linear-gradient(0deg,'+CREAM+' 90%,#f6f1df00)'}:{top:0,bottom:0,left:panelLeft+'%',width:'39%',background:side==='right'?'linear-gradient(90deg,#f6f1df00,'+CREAM+' 18%)':'linear-gradient(270deg,#f6f1df00,'+CREAM+' 18%)'})}}/>
    </div>
    {introAlpha>0&&<div style={{position:'absolute',inset:0,opacity:introAlpha,pointerEvents:'none'}}>
      <div style={{position:'absolute',bottom:mobile?'18%':'19%',left:'5%',padding:'18px 22px',background:'#f6f1dfed',borderLeft:'2px solid '+BLUE,color:BLUE,transform:'translateY('+mix(15,0,range(frame,0,35))+'px)'}}>
        <div style={{fontSize:mobile?44:48,lineHeight:1,fontWeight:500,letterSpacing:1}}>CHUNXIANG</div>
        <div style={{fontSize:mobile?17:13,letterSpacing:3,marginTop:13}}>一张图纸，一次新的开始。</div>
      </div>
    </div>}
    {STORIES.map((_,index)=><StoryPanel key={index} index={index} frame={frame}/>)}
    <div className="evidence-backdrop" style={{opacity:range(frame,828,862)*(1-range(frame,1020,1050))}} />
    <EvidenceCards frame={frame}/>
  </AbsoluteFill>;
}
