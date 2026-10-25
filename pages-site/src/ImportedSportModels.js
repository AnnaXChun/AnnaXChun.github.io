import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const files=['kin-chen-racket','kyle1003-shuttlecock','libhand'];
const pending=new Map();
function assetBytes(name){
  if(!pending.has(name))pending.set(name,fetch(`/models/${name}.glb`).then(r=>{if(!r.ok)throw new Error(`${name}: ${r.status}`);return r.arrayBuffer();}).catch(e=>{pending.delete(name);throw e;}));
  return pending.get(name);
}
export function preloadSportAssets(){return Promise.all(files.map(assetBytes));}

function disposeTree(root) {
  const resources=new Set();
  root.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){resources.add(m);for(const value of Object.values(m))if(value?.isTexture)resources.add(value);}});
  resources.forEach(r=>r.dispose());
}

export function createImportedSportModels(onReady,onError) {
  const racket=new THREE.Group(),shuttle=new THREE.Group(),hand=new THREE.Group();
  const roots=[racket,shuttle,hand];let disposed=false;
  const handFade={bottom:{value:.035},top:{value:.18}};
  const loader=new GLTFLoader();
  const load=(name,target,configure)=>assetBytes(name).then(bytes=>loader.parseAsync(bytes,'/models/')).then(gltf=>{
    if(disposed){disposeTree(gltf.scene);return;}
    configure(gltf.scene);gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.map)m.map.anisotropy=8;}}});target.add(gltf.scene);onReady();
  }).catch(onError);
  // Converted source files are normalized by the reproducible Blender script.
  load('kin-chen-racket',racket,root=>{root.scale.setScalar(4.64);root.position.set(0,-.310535196*4.64,.011762467*4.64);});
  load('kyle1003-shuttlecock',shuttle,root=>{
    root.rotation.z=Math.PI;root.scale.setScalar(1.46);root.position.y=.07;
    root.traverse(o=>{if(!o.isMesh)return;const m=o.material;m.envMapIntensity=.35;
      if(m.name==='DefaultSG'){m.color.set(0xbdcbd3);m.roughness=.84;}
      if(m.name==='VRayFastSSS2Mtl1SG'){m.color.set(0xcbd1d3);m.roughness=.72;}
      if(o.name==='Kyle1003_Object_1'){
        // The source's cork has geometry but no UVs. Add a minute leather grain;
        // keep the authored shape, seams and feather meshes intact.
        const p=o.geometry.attributes.position,uv=[];
        for(let i=0;i<p.count;i++)uv.push(Math.atan2(p.getZ(i),p.getX(i))/(Math.PI*2)+.5,(p.getY(i)-.235)/.265);
        o.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
        const pixels=new Uint8Array(128*128*4);
        for(let i=0;i<128*128;i++){const v=120+((Math.imul(i+97,1103515245)>>>16)%110);pixels.set([v,v,v,255],i*4);}
        const grain=new THREE.DataTexture(pixels,128,128);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(7,4);grain.needsUpdate=true;
        o.material=m.clone();o.material.color.set(0xd0d6d9);o.material.roughness=.7;o.material.bumpMap=grain;o.material.bumpScale=.00045;
      }
    });
  });
  load('libhand',hand,root=>{
    root.rotation.z=Math.PI;
    const box=new THREE.Box3().setFromObject(root),center=box.getCenter(new THREE.Vector3());
    root.position.set(-center.x,.9-box.max.y,-center.z);
    root.traverse(o=>{if(o.isMesh){
      const m=o.material;m.roughness=.48;m.metalness=0;m.transparent=true;
      m.onBeforeCompile=shader=>{
        shader.uniforms.handFadeBottom=handFade.bottom;shader.uniforms.handFadeTop=handFade.top;
        shader.vertexShader='varying vec4 vHandClip;\n'+shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvHandClip=gl_Position;');
        shader.fragmentShader='varying vec4 vHandClip;uniform float handFadeBottom;uniform float handFadeTop;\n'+shader.fragmentShader.replace('#include <opaque_fragment>','diffuseColor.a*=smoothstep(handFadeBottom,handFadeTop,vHandClip.y/vHandClip.w*.5+.5);\n#include <opaque_fragment>');
      };
    }});
  });
  return {racket,shuttle,hand,fit(aspect){handFade.bottom.value=aspect<1?.18:.035;handFade.top.value=aspect<1?.34:.18;},dispose(){disposed=true;roots.forEach(disposeTree);}};
}
