import {createSceneRuntime} from './SceneRuntime';
import {createSceneDiagnostics} from './SceneDiagnostics';
import React,{useLayoutEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createImportedSportModels} from './ImportedSportModels';
import {createPhotographicFinish,createGlassHalo} from './PhotographicFinish';
import {badmintonShot} from './BadmintonMotion';
import {createStudioEnvironment,createStudioShadows} from './StudioLighting';
import {createProductLights} from './ProductLights';

export default function BadmintonScene({frame=1050,still=false,active=true}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame),[failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,loop,environment,lights,shadows,finish,halo,alive=true;
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,premultipliedAlpha:false});renderer.setClearColor(0,0);renderer.transmissionResolutionScale=.25;
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
      const audit=createSceneDiagnostics(container,renderer);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,50);
      environment=createStudioEnvironment(renderer,true);scene.environment=environment.texture;scene.environmentIntensity=.65;
      lights=createProductLights(scene);shadows=createStudioShadows(scene);
      finish=createPhotographicFinish(renderer);halo=createGlassHalo(scene);
      model=createImportedSportModels(()=>runtime.current?.request(),error=>{if(alive){setFailed(true);console.warn('Sport asset unavailable:',error.message);}});scene.add(model.shuttle,model.racket,model.hand);
      const draw=(width,height)=>{
        if(!alive||!width||!height||document.hidden)return;
        const shot=badmintonShot(still?1160:current.current);
        model.racket.position.set(...shot.racketPosition);model.racket.rotation.set(...shot.racketRotation);
        model.shuttle.scale.setScalar(shot.shuttleScale);model.shuttle.position.set(...shot.shuttlePosition);model.shuttle.quaternion.fromArray(shot.shuttleQuaternion);
        const release=THREE.MathUtils.smoothstep(shot.progress,.04,.37);
        model.hand.position.set(.45+release*.45,.55-release*5.6,.4-release*.5);
        model.hand.rotation.set(.05,-.62+release*.35,-.32-release*.3);model.hand.scale.setScalar(.88);model.hand.visible=shot.progress<.38;
        halo.group.rotation.y=-.2+shot.progress*.35;
        camera.aspect=width/height;model.fit(camera.aspect);
        const shortLandscape=width>=600&&width<900&&height<=520;
        const framing=camera.aspect>=1?(Math.max(0,1.9-camera.aspect)*1.5+(shortLandscape?.85:0))*(1-THREE.MathUtils.smoothstep(shot.progress,.25,.45)):0;
        camera.position.set(shot.cameraPosition[0]+framing,shot.cameraPosition[1],shot.cameraPosition[2]);camera.lookAt(shot.cameraTarget[0]+framing,shot.cameraTarget[1],shot.cameraTarget[2]);camera.fov=shot.fov;
        // Portrait crops retain the flight axis; motion still approaches the real camera.
        if(camera.aspect<1)camera.fov+=13;
        camera.updateProjectionMatrix();audit.draw(()=>finish.render(scene,camera));
      };
      loop=createSceneRuntime({host:container,renderer,render:draw,active,onResize(w,h){audit.resize();finish.resize(w,h);}});runtime.current=loop;
    }catch(error){setFailed(true);console.warn('Badminton scene unavailable:',error.message);}
    return()=>{alive=false;loop?.dispose();runtime.current=null;model?.dispose();finish?.dispose();halo?.dispose();shadows?.dispose();lights?.dispose();environment?.dispose();renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();};
  },[still]);
  useLayoutEffect(()=>{runtime.current?.setActive(active);runtime.current?.request();},[frame,active]);
  return <div className="badminton-scene" ref={host}>{failed&&<div className="badminton-fallback">羽毛球 · 预判与节奏</div>}</div>;
}

export {preloadSportAssets} from './ImportedSportModels';
