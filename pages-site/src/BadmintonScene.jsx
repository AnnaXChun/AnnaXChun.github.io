import React,{useLayoutEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createBadmintonModel} from './BadmintonModel';
import {badmintonShot} from './BadmintonMotion';

export default function BadmintonScene({frame=1050,still=false}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame),[failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,observer,alive=true,width=1,height=1;
    const resources=[];
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
      renderer.domElement.setAttribute('aria-hidden','true');container.appendChild(renderer.domElement);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,50);
      scene.add(new THREE.HemisphereLight(0xfff8e4,0x545d4e,1.8));
      const key=new THREE.DirectionalLight(0xfff6e3,3.6);key.position.set(-3,5,5);scene.add(key);
      const rim=new THREE.DirectionalLight(0xeef7ef,3.1);rim.position.set(3,2,-4);scene.add(rim);
      const bounce=new THREE.DirectionalLight(0xd8a98b,.65);bounce.position.set(-2,-3,2);scene.add(bounce);
      model=createBadmintonModel();scene.add(model.shuttle,model.racket);
      const lineMat=new THREE.LineBasicMaterial({color:0x9f5845,transparent:true,opacity:.17});resources.push(lineMat);
      for(const points of [[[-8,-2.7,-3],[8,-2.7,-3],[8,-2.7,4]],[[-3,-2.7,-3],[-3,-2.7,4]],[[-8,-2.7,1],[8,-2.7,1]]]) {
        const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));resources.push(geometry);scene.add(new THREE.Line(geometry,lineMat));
      }
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
    return()=>{alive=false;observer?.disconnect();if(runtime.current)document.removeEventListener('visibilitychange',runtime.current.draw);runtime.current=null;model?.dispose();resources.forEach(r=>r.dispose());renderer?.dispose();renderer?.domElement.remove();};
  },[still]);
  useLayoutEffect(()=>{runtime.current?.draw();},[frame]);
  return <div className="badminton-scene" ref={host}>{failed&&<div className="badminton-fallback">羽毛球 · 预判与节奏</div>}</div>;
}
