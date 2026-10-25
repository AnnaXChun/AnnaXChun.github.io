import {createCourtyardComposite} from './CourtyardComposite';
import React, {useLayoutEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {createMinnanCourtyard} from './MinnanModel';
import {minnanCamera} from './MinnanCamera';
import {createStudioSurfaces} from './MinnanStudio';
import {createAgentJourney} from './MinnanJourney';
import {createStudioEnvironment} from './StudioLighting';
import {createSceneRuntime,minnanViewport} from './SceneRuntime';
import {createSceneDiagnostics} from './SceneDiagnostics';
import {createAutumnFrame,createCourtyardWater,autumnRetreat} from './MinnanAtmosphere';

export default function MinnanScene({frame=90,still=false,active=true,opacity=1}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame),fade=useRef(opacity);
  const [failed,setFailed]=useState(false);current.current=frame;fade.current=opacity;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,studio,journey,environment,water,autumn,composite,loop,alive=true,backgroundDirty=true;
    let previousFrame=-1,previousX=NaN,previousY=NaN,previousWidth=0,previousHeight=0;
    const resources=[],pointer={x:0,y:0},smoothed={x:0,y:0},target=new THREE.Vector3();
    try {
      renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,premultipliedAlpha:false,powerPreference:'high-performance'});
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
      renderer.setClearColor(0,0);renderer.autoClear=false;renderer.info.autoReset=false;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
      renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
      renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
      const audit=createSceneDiagnostics(container,renderer);
      const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xf4f9fc,32,64);
      const camera=new THREE.PerspectiveCamera(42,1,.1,75);camera.viewport=new THREE.Vector4();
      environment=createStudioEnvironment(renderer);scene.environment=environment.texture;scene.environmentIntensity=.24;
      scene.add(new THREE.HemisphereLight(0xf5fbff,0x4b6478,.55));
      const sun=new THREE.DirectionalLight(0xfffcf5,3.2);sun.position.set(-9,11,8);sun.castShadow=true;
      sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:1,far:40});
      sun.shadow.normalBias=.018;sun.shadow.bias=-.00015;sun.shadow.radius=3;sun.shadow.blurSamples=6;scene.add(sun);
      const releaseShadow=()=>{sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();sun.shadow.map=null;sun.shadow.mapPass=null;renderer.shadowMap.needsUpdate=true;};
      resources.push({dispose:releaseShadow});
      const fill=new THREE.DirectionalLight(0xe1eaff,.45);fill.position.set(9,7,-7);scene.add(fill);
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:0x526c80,opacity:.23}));
      ground.rotation.x=-Math.PI/2;ground.position.y=-.01;ground.receiveShadow=true;scene.add(ground);resources.push(ground.geometry,ground.material);
      model=createMinnanCourtyard();scene.add(model.group);
      studio=createStudioSurfaces(model.studioLabels);scene.add(studio.group);
      journey=createAgentJourney();scene.add(journey.group);
      composite=createCourtyardComposite(renderer);water=createCourtyardWater();scene.add(water.mesh);autumn=createAutumnFrame(()=>loop?.request());
      renderer.shadowMap.needsUpdate=true;
      const draw=(width,height,{time})=>{
        if(!alive)return false;
        const f=current.current,shot=minnanCamera(f),view=minnanViewport(f,width,height);
        const moving=Math.abs(smoothed.x-pointer.x)+Math.abs(smoothed.y-pointer.y)>.002;
        if(moving){smoothed.x+=(pointer.x-smoothed.x)*.16;smoothed.y+=(pointer.y-smoothed.y)*.16;}
        else {smoothed.x=pointer.x;smoothed.y=pointer.y;}
        const redrawBackground=backgroundDirty||f!==previousFrame||width!==previousWidth||height!==previousHeight||(shot.pointer>0&&(smoothed.x!==previousX||smoothed.y!==previousY));
        if(redrawBackground){
        camera.position.set(...shot.position);camera.position.x+=smoothed.x*.65*shot.pointer;camera.position.y+=smoothed.y*.35*shot.pointer;
        const aspect=view.width/view.height,fit=1+(Math.max(1,1.2/aspect)-1)*shot.fit;
        target.set(...shot.target);camera.position.sub(target).multiplyScalar(fit).add(target);camera.lookAt(target);camera.aspect=aspect;
        const interior=Math.min(1,Math.max(0,(f-565)/45))*(1-Math.min(1,Math.max(0,(f-745)/65)));
        const lens=1+(Math.max(1,1.48/aspect)-1)*interior;
        camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(shot.fov/2))*lens));camera.updateProjectionMatrix();
        journey.update(f,still);model.updateFoliage?.(f,still);water.update(still?90:f);
        const dpr=renderer.getPixelRatio();camera.viewport.set(view.x*dpr,view.y*dpr,view.width*dpr,view.height*dpr);
        }
        autumn.update(f,width/height,still,time);
        audit.draw(()=>{
          renderer.info.reset();
          if(redrawBackground){
            renderer.setRenderTarget(composite.target);renderer.setViewport(0,0,width,height);renderer.clear();
            renderer.setViewport(view.x,view.y,view.width,view.height);renderer.render(scene,camera);audit.background();
            backgroundDirty=false;previousFrame=f;previousX=smoothed.x;previousY=smoothed.y;previousWidth=width;previousHeight=height;
          }
          renderer.setRenderTarget(null);renderer.setViewport(0,0,width,height);renderer.clear();composite.draw(fade.current,width<height&&f>=270&&f<540?.495:2);renderer.clearDepth();
          if(still||autumnRetreat(f)>0)renderer.render(autumn.scene,autumn.camera);
        });
        return (!still&&autumnRetreat(f)>0)||(shot.pointer>0&&moving);
      };
      loop=createSceneRuntime({host:container,renderer,render:draw,active,idleFps:30,onResize(w,h,enabled){
        // Read layout only when the viewport changes/restores, never per frame.
        // Native browser zoom changes the nav's footprint independently of 3D.
        const nav=enabled?container.closest('.story-stage')?.querySelector('.chapter-nav'):null;
        let navigation;
        if(nav){const n=nav.getBoundingClientRect(),r=container.getBoundingClientRect();if(r.width&&r.height)navigation={right:(n.right-r.left+24)/r.width,top:1-(n.top-r.top-16)/r.height};}
        backgroundDirty=true;audit.resize();composite.resize(w,h,navigation);water.resize(enabled);if(!enabled)releaseShadow();
      }});
      const onPointer=event=>{
        if(still||!loop.active||event.pointerType==='touch'||!container.closest('.story-stage'))return;
        pointer.x=(event.clientX/window.innerWidth-.5)*2;pointer.y=(event.clientY/window.innerHeight-.5)*2;loop.request();
      };
      window.addEventListener('pointermove',onPointer,{passive:true});runtime.current={loop,onPointer};
    }catch(error){setFailed(true);console.warn('Minnan WebGL scene unavailable:',error.message);}
    return()=>{
      alive=false;loop?.dispose();if(runtime.current?.onPointer)window.removeEventListener('pointermove',runtime.current.onPointer);runtime.current=null;
      composite?.dispose();autumn?.dispose();water?.dispose();journey?.dispose();studio?.dispose();model?.dispose();environment?.dispose();resources.forEach(r=>r.dispose());renderer?.dispose();renderer?.forceContextLoss();renderer?.domElement.remove();
    };
  },[still]);
  useLayoutEffect(()=>{runtime.current?.loop.setActive(active);runtime.current?.loop.request();},[frame,active,opacity]);
  return <div ref={host} className="minnan-scene">{failed&&<p className="scene-unavailable">三维场景暂不可用，个人资料仍可正常阅读。</p>}</div>;
}
