import * as THREE from 'three';
import {glyphSideGeometry} from './GlyphGeometry.js';

// An off-axis photographic lens sees the top of each stroke, while every point
// on its z=0 front retains the exact DOM projection. No tilted/rasterized text.
export function frameAutumnCamera(camera,aspect){
  camera.position.set(0,5.85,13);camera.aspect=aspect;
  camera.updateProjectionMatrix();
  camera.projectionMatrix.elements[9]=-camera.projectionMatrix.elements[5]*.45;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  camera.updateMatrixWorld();
}

// Geometry is built in a worker once per font/glyph, then reused across all
// chapter visits. Positions/scales stay in the scene graph, not baked buffers.
export {glyphSideGeometry};

export function createGlyphShelves(onReady=()=>{}){
  const group=new THREE.Group();group.name='solid letter strokes / resting surfaces';
  const material=new THREE.MeshStandardMaterial({color:0x7c919f,roughness:.74,metalness:.05,side:THREE.DoubleSide});
  const plane=new THREE.PlaneGeometry(1,1),templates=new Map();
  let worker;
  try{worker=new Worker(new URL('./GlyphGeometry.worker.js',import.meta.url),{type:'module'});}catch{worker=null;}
  let parts=[],disposed=false,fallbackTimer=0;
  const buildFallback=()=>{
    if(disposed)return;
    const template=[...templates.values()].find(t=>!t.geometry);
    if(!template)return;
    template.geometry=glyphSideGeometry({ink:template.ink,unit:1,left:0,top:0});show();onReady();
    fallbackTimer=setTimeout(buildFallback,32);
  };
  const scheduleFallback=()=>{clearTimeout(fallbackTimer);fallbackTimer=setTimeout(buildFallback,32);};
  function show(){
    group.clear();
    for(const part of parts){
      const {ink,unit,left,top}=part,template=templates.get(ink.key);
      if(!template?.geometry)continue;
      const mesh=new THREE.Mesh(template.geometry,material);
      mesh.position.set(left,top,0);mesh.scale.set(unit,unit,1);
      mesh.layers.set(1);mesh.receiveShadow=true;group.add(mesh);
      const front=new THREE.Mesh(plane,template.depthMaterial);
      front.scale.set(ink.width*unit,ink.height*unit,1);
      front.position.set(left+ink.width*unit/2,top-ink.height*unit/2,.002);
      front.renderOrder=-10;front.layers.enable(1);group.add(front);
    }
  }
  const disposeTemplate=t=>{t.geometry?.dispose();t.texture.dispose();t.depthMaterial.dispose();};
  if(worker)worker.onmessage=({data})=>{
    if(disposed)return;
    const template=templates.get(data.key);if(!template||template.geometry)return;
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(data.position,3));
    geometry.setAttribute('normal',new THREE.BufferAttribute(data.normal,3));
    geometry.setIndex(new THREE.BufferAttribute(data.index,1));
    template.geometry=geometry;show();onReady();
  };
  if(worker)worker.onerror=()=>{worker.terminate();worker=null;scheduleFallback();};
  return {group,
    update(surface){
      parts=surface?.parts??[];
      const activeKeys=new Set(parts.map(p=>p.ink.key));
      for(const {ink} of parts){
        if(templates.has(ink.key))continue;
        const texture=new THREE.CanvasTexture(ink.canvas);texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
        const depthMaterial=new THREE.MeshBasicMaterial({map:texture,alphaTest:.5,colorWrite:false,depthWrite:true});
        templates.set(ink.key,{ink,texture,depthMaterial,geometry:null});
        if(worker){const alpha=ink.alpha.slice();worker.postMessage({key:ink.key,alpha,width:ink.width,height:ink.height},[alpha.buffer]);}
        else scheduleFallback();
      }
      // Fixed cache bound, including font changes. Never evict a visible glyph.
      for(const [key,template] of templates){if(templates.size<=32)break;if(!activeKeys.has(key)){disposeTemplate(template);templates.delete(key);}}
      show();
    },
    dispose(){disposed=true;clearTimeout(fallbackTimer);worker?.terminate();group.clear();parts=[];templates.forEach(disposeTemplate);templates.clear();plane.dispose();material.dispose();},
  };
}
