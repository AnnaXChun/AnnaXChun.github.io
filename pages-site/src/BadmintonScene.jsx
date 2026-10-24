import React,{useLayoutEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {createBadmintonModel,shuttleFlight,rallyPose} from './BadmintonModel';

export default function BadmintonScene({frame=1120,still=false}) {
  const host=useRef(null),runtime=useRef(null),current=useRef(frame),[failed,setFailed]=useState(false);
  current.current=frame;
  useLayoutEffect(()=>{
    const container=host.current;
    let renderer,model,observer,raf=0,visible=true,alive=true,shotStart=0,previousTime=0,spin=0;
    let width=1,height=1,dragX=0,dragY=0,dragging=false,lastX=0,lastY=0;
    const resources=[];
    try {
      renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      container.appendChild(renderer.domElement);
      const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.1,40);
      scene.add(new THREE.HemisphereLight(0xfff8e4,0x737d68,2.6));
      const key=new THREE.DirectionalLight(0xfff5dc,3.4);key.position.set(-3,5,6);scene.add(key);
      const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(3,2,-4);scene.add(rim);
      model=createBadmintonModel();scene.add(model.shuttle,model.racket);
      // A fragment of the court becomes a thin, perspectival line drawing.
      const court=new THREE.Group(),lineMat=new THREE.LineBasicMaterial({color:0x9f5845,transparent:true,opacity:.34});resources.push(lineMat);
      for(const points of [[[-2,-2.18,-1],[2.8,-2.18,-1],[2.8,-2.18,2.1]],[[-1.5,-2.18,-1],[-1.5,-2.18,2.1]],[[.45,-2.18,-1],[.45,-2.18,2.1]],[[-2,-2.18,.35],[2.8,-2.18,.35]]]) {
        const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));resources.push(geometry);court.add(new THREE.Line(geometry,lineMat));
      }scene.add(court);
      const shadowGeo=new THREE.CircleGeometry(.8,48),shadowMat=new THREE.MeshBasicMaterial({color:0x4c5444,transparent:true,opacity:.055,depthWrite:false});resources.push(shadowGeo,shadowMat);
      const shadow=new THREE.Mesh(shadowGeo,shadowMat);shadow.rotation.x=-Math.PI/2;shadow.position.set(.8,-2.17,.5);shadow.scale.set(1,.55,1);scene.add(shadow);
      const draw=time=>{
        if(!alive||!visible||document.hidden||!width||!height){raf=0;return;}
        const dt=previousTime?Math.min((time-previousTime)/1000,.05):0;previousTime=time;
        if(!still&&!dragging)spin+=dt*.34;
        const progress=(current.current-1020)/300,flight=shuttleFlight(progress);
        model.shuttle.scale.setScalar(1);model.shuttle.position.set(...flight.position);model.shuttle.rotation.set(flight.rotation[0]+dragY,flight.rotation[1]+spin+dragX,flight.rotation[2]);
        model.racket.position.set(-.65,-.10,-.15);model.racket.rotation.set(-.22,.32,-.62);
        if(shotStart&&!still) {
          const t=Math.min(1,(time-shotStart)/1700),pose=rallyPose(t);
          model.racket.position.set(...pose.position);model.racket.rotation.set(...pose.rotation);
          if(pose.reset!==null)model.shuttle.scale.setScalar(pose.reset);
          else {
            model.shuttle.position.lerp(new THREE.Vector3(...pose.shuttleContact),pose.approach);
            const orientation=new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose.contactRotation));
            model.shuttle.quaternion.slerp(orientation,pose.approach);
            if(t>.34) {
              const f=pose.flight,direction=new THREE.Vector3(.89,-.16,.42).normalize();
              model.shuttle.position.set(...pose.shuttleContact).addScaledVector(direction,f*7);model.shuttle.position.y-=f*f*1.2;
              const outgoing=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,-1,0),direction);
              model.shuttle.quaternion.slerp(outgoing,Math.min(1,f*5));model.shuttle.rotateY(f*Math.PI*3);
            }
          }
          if(t===1)shotStart=0;
        }
        const aspect=width/height;camera.position.set(0,.55,Math.max(7.4,7.4/Math.max(.9,aspect)));camera.lookAt(.1,-.15,0);camera.aspect=aspect;camera.updateProjectionMatrix();
        renderer.render(scene,camera);
        if(!still)raf=requestAnimationFrame(draw);else raf=0;
      };
      const start=()=>{if(!raf&&alive&&visible&&!document.hidden)raf=requestAnimationFrame(draw);};
      const down=e=>{if(still||e.pointerType==='touch')return;dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);};
      const move=e=>{if(!dragging)return;dragX+=(e.clientX-lastX)*.012;dragY=Math.max(-.8,Math.min(.8,dragY+(e.clientY-lastY)*.007));lastX=e.clientX;lastY=e.clientY;};
      const up=()=>{dragging=false;};
      const smash=()=>{if(still||shotStart)return;shotStart=performance.now();start();};
      const visibility=()=>{previousTime=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else start();};
      renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('lostpointercapture',up);
      window.addEventListener('portfolio:smash',smash);document.addEventListener('visibilitychange',visibility);
      observer=new ResizeObserver(entries=>{const r=entries[0].contentRect;width=Math.round(r.width);height=Math.round(r.height);if(width&&height){renderer.setSize(width,height);start();}});observer.observe(container);
      const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0;previousTime=0;}},{threshold:0});intersection.observe(container);
      runtime.current={start,cleanup:()=>{intersection.disconnect();window.removeEventListener('portfolio:smash',smash);document.removeEventListener('visibilitychange',visibility);}};
    }catch(error){setFailed(true);console.warn('Badminton scene unavailable:',error.message);}
    return()=>{alive=false;observer?.disconnect();cancelAnimationFrame(raf);runtime.current?.cleanup();runtime.current=null;model?.dispose();resources.forEach(r=>r.dispose());renderer?.dispose();renderer?.domElement.remove();};
  },[still]);
  useLayoutEffect(()=>{runtime.current?.start();},[frame]);
  return <div className="badminton-scene" ref={host}>{failed&&<div className="badminton-fallback">羽毛球 · 预判与节奏</div>}</div>;
}
