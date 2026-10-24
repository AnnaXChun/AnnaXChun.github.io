import React, {useLayoutEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {createMinnanCourtyard} from './MinnanModel';
import {minnanCamera} from './MinnanCamera';
import {createStudioSurfaces} from './MinnanStudio';
import {createAgentJourney} from './MinnanJourney';

export default function MinnanScene({frame=90,still=false}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame);
  const [failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,studio,journey,resize,raf=0,alive=true;
    const resources=[];
    const pointer={x:0,y:0},smoothed={x:0,y:0};
    try {
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
      renderer.setClearColor(0xf7f4eb,0);
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
      renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
      const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xf7f4eb,32,64);
      const camera=new THREE.PerspectiveCamera(42,1,.1,75);
      scene.add(new THREE.HemisphereLight(0xfff9ee,0x929787,2.2));
      const sun=new THREE.DirectionalLight(0xfff7e8,2.4);sun.position.set(-7,14,10);sun.castShadow=true;
      sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:40});
      sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;sun.shadow.radius=2;sun.shadow.blurSamples=4;scene.add(sun);
      const fill=new THREE.DirectionalLight(0xe5e9db,.8);fill.position.set(9,7,-7);scene.add(fill);
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:0x798375,opacity:.075}));
      ground.rotation.x=-Math.PI/2;ground.position.y=-.01;ground.receiveShadow=true;scene.add(ground);resources.push(ground.geometry,ground.material);
      model=createMinnanCourtyard();scene.add(model.group);
      studio=createStudioSurfaces(model.studioLabels);scene.add(studio.group);
      journey=createAgentJourney();scene.add(journey.group);
      let width=1,height=1;
      const draw=()=>{
        if(!alive||!width||!height)return;
        const shot=minnanCamera(current.current);
        camera.position.set(...shot.position);
        camera.position.x+=smoothed.x*.65*shot.pointer;camera.position.y+=smoothed.y*.35*shot.pointer;
        // Only fit exterior views; scaling the dolly would pull it back out of the gate.
        const aspect=width/height,fit=1+(Math.max(1,1.2/aspect)-1)*shot.fit;
        camera.position.sub(new THREE.Vector3(...shot.target)).multiplyScalar(fit).add(new THREE.Vector3(...shot.target));
        camera.lookAt(...shot.target);camera.aspect=aspect;
        // Keep the physical gate path; widen only the inside courtyard lens on
        // narrow screens so the archive and the desk stay inside the composition.
        const interior=Math.min(1,Math.max(0,(current.current-565)/45))*(1-Math.min(1,Math.max(0,(current.current-745)/65)));
        const lens=1+(Math.max(1,1.48/aspect)-1)*interior;
        camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(shot.fov/2))*lens));camera.updateProjectionMatrix();
        journey.update(current.current,still);
        renderer.render(scene,camera);
      };
      const animatePointer=()=>{
        smoothed.x+=(pointer.x-smoothed.x)*.09;smoothed.y+=(pointer.y-smoothed.y)*.09;draw();
        if(Math.abs(smoothed.x-pointer.x)+Math.abs(smoothed.y-pointer.y)>.002)raf=requestAnimationFrame(animatePointer);else raf=0;
      };
      const onPointer=event=>{
        if(still||event.pointerType==='touch'||!container.closest('.story-stage'))return;
        const rect=container.getBoundingClientRect();if(rect.bottom<0||rect.top>window.innerHeight)return;
        pointer.x=(event.clientX/window.innerWidth-.5)*2;pointer.y=(event.clientY/window.innerHeight-.5)*2;
        if(!raf)raf=requestAnimationFrame(animatePointer);
      };
      window.addEventListener('pointermove',onPointer,{passive:true});
      runtime.current={draw,onPointer};
      resize=new ResizeObserver(entries=>{
        const box=entries[0].contentRect;width=Math.round(box.width);height=Math.round(box.height);
        if(width&&height){renderer.setSize(width,height);draw();}
      });resize.observe(container);
    } catch(error) {
      setFailed(true);console.warn('Minnan WebGL scene unavailable:',error.message);
    }
    return ()=>{
      alive=false;resize?.disconnect();cancelAnimationFrame(raf);
      if(runtime.current?.onPointer)window.removeEventListener('pointermove',runtime.current.onPointer);
      runtime.current=null;journey?.dispose();studio?.dispose();model?.dispose();resources.forEach(r=>r.dispose());renderer?.dispose();
      if(renderer?.domElement.parentNode===container)container.removeChild(renderer.domElement);
    };
  },[still]);
  useLayoutEffect(()=>{runtime.current?.draw();},[frame]);
  return <div ref={host} className="minnan-scene">{failed&&<p className="scene-unavailable">三维场景暂不可用，个人资料仍可正常阅读。</p>}</div>;
}
