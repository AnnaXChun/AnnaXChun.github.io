import React,{useLayoutEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createBadmintonModel} from './BadmintonModel';
import {badmintonShot} from './BadmintonMotion';
import {createStudioEnvironment,createStudioShadows} from './StudioLighting';
import {createProductLights} from './ProductLights';

export default function BadmintonScene({frame=1050,still=false}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame),[failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,observer,environment,lights,shadows,alive=true,width=1,height=1;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,50);
      environment=createStudioEnvironment(renderer,true);scene.environment=environment.texture;scene.environmentIntensity=.65;
      lights=createProductLights(scene);shadows=createStudioShadows(scene);
      model=createBadmintonModel();scene.add(model.shuttle,model.racket);
      const draw=()=>{
        if(!alive||!width||!height||document.hidden)return;
        const shot=badmintonShot(still?1160:current.current);
        model.racket.position.set(...shot.racketPosition);model.racket.rotation.set(...shot.racketRotation);
        model.shuttle.scale.setScalar(shot.shuttleScale);model.shuttle.position.set(...shot.shuttlePosition);model.shuttle.quaternion.fromArray(shot.shuttleQuaternion);
        camera.position.set(...shot.cameraPosition);camera.lookAt(...shot.cameraTarget);camera.aspect=width/height;camera.fov=shot.fov;
        // Portrait crops retain the flight axis; motion still approaches the real camera.
        if(camera.aspect<1)camera.fov+=13;
        camera.updateProjectionMatrix();renderer.render(scene,camera);
      };
      document.addEventListener('visibilitychange',draw);runtime.current={draw};
      observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;width=Math.round(r.width);height=Math.round(r.height);if(width&&height){renderer.setSize(width,height);draw();}});observer.observe(container);
    }catch(error){setFailed(true);console.warn('Badminton scene unavailable:',error.message);}
    return()=>{alive=false;observer?.disconnect();if(runtime.current)document.removeEventListener('visibilitychange',runtime.current.draw);runtime.current=null;model?.dispose();shadows?.dispose();lights?.dispose();environment?.dispose();renderer?.dispose();renderer?.domElement.remove();};
  },[still]);
  useLayoutEffect(()=>{runtime.current?.draw();},[frame]);
  return <div className="badminton-scene" ref={host}>{failed&&<div className="badminton-fallback">羽毛球 · 预判与节奏</div>}</div>;
}
