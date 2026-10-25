import React,{useLayoutEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createImportedSportModels} from './ImportedSportModels';
import {createPhotographicFinish,createGlassHalo} from './PhotographicFinish';
import {badmintonShot} from './BadmintonMotion';
import {createStudioEnvironment,createStudioShadows} from './StudioLighting';
import {createProductLights} from './ProductLights';

export default function BadmintonScene({frame=1050,still=false}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame),[failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,observer,environment,lights,shadows,finish,halo,alive=true,width=1,height=1;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,premultipliedAlpha:false});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,50);
      environment=createStudioEnvironment(renderer,true);scene.environment=environment.texture;scene.environmentIntensity=.65;
      lights=createProductLights(scene);shadows=createStudioShadows(scene);
      finish=createPhotographicFinish(renderer);halo=createGlassHalo(scene);
      model=createImportedSportModels(()=>runtime.current?.draw(),error=>{if(alive){setFailed(true);console.warn('Sport asset unavailable:',error.message);}});scene.add(model.shuttle,model.racket,model.hand);
      const draw=()=>{
        if(!alive||!width||!height||document.hidden)return;
        const shot=badmintonShot(still?1160:current.current);
        model.racket.position.set(...shot.racketPosition);model.racket.rotation.set(...shot.racketRotation);
        model.shuttle.scale.setScalar(shot.shuttleScale);model.shuttle.position.set(...shot.shuttlePosition);model.shuttle.quaternion.fromArray(shot.shuttleQuaternion);
        const release=THREE.MathUtils.smoothstep(shot.progress,.04,.37);
        model.hand.position.set(.45+release*.45,.55-release*5.6,.4-release*.5);
        model.hand.rotation.set(.05,-.62+release*.35,-.32-release*.3);model.hand.scale.setScalar(.88);model.hand.visible=shot.progress<.38;
        halo.group.rotation.y=-.2+shot.progress*.35;
        camera.aspect=width/height;model.fit(camera.aspect);
        const framing=camera.aspect>=1?Math.max(0,1.9-camera.aspect)*1.5*(1-THREE.MathUtils.smoothstep(shot.progress,.25,.45)):0;
        camera.position.set(shot.cameraPosition[0]+framing,shot.cameraPosition[1],shot.cameraPosition[2]);camera.lookAt(shot.cameraTarget[0]+framing,shot.cameraTarget[1],shot.cameraTarget[2]);camera.fov=shot.fov;
        // Portrait crops retain the flight axis; motion still approaches the real camera.
        if(camera.aspect<1)camera.fov+=13;
        camera.updateProjectionMatrix();finish.render(scene,camera);
      };
      document.addEventListener('visibilitychange',draw);runtime.current={draw};
      observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;width=Math.round(r.width);height=Math.round(r.height);if(width&&height){renderer.setSize(width,height);finish.resize(width,height);draw();}});observer.observe(container);
    }catch(error){setFailed(true);console.warn('Badminton scene unavailable:',error.message);}
    return()=>{alive=false;observer?.disconnect();if(runtime.current)document.removeEventListener('visibilitychange',runtime.current.draw);runtime.current=null;model?.dispose();finish?.dispose();halo?.dispose();shadows?.dispose();lights?.dispose();environment?.dispose();renderer?.dispose();renderer?.domElement.remove();};
  },[still]);
  useLayoutEffect(()=>{runtime.current?.draw();},[frame]);
  return <div className="badminton-scene" ref={host}>{failed&&<div className="badminton-fallback">羽毛球 · 预判与节奏</div>}</div>;
}

export {preloadSportAssets} from './ImportedSportModels';
