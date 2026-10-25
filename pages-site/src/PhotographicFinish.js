import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {TexturePass} from 'three/addons/postprocessing/TexturePass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// Keep DOM typography behind the real scene. Bloom affects only radiance above
// the threshold; reconstruct alpha so the ice-white page is never replaced by black.
export function createPhotographicFinish(renderer) {
  const base=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4});
  const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType}));
  const source=new TexturePass(base.texture);
  const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.38,.6,3.5);
  const alpha=new ShaderPass({
    uniforms:{tDiffuse:{value:null},baseImage:{value:null}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform sampler2D tDiffuse;uniform sampler2D baseImage;varying vec2 vUv;
      void main(){vec4 b=texture2D(baseImage,vUv);vec3 c=texture2D(tDiffuse,vUv).rgb;
      vec3 glow=max(c-b.rgb,vec3(0.));float h=max(max(glow.r,glow.g),glow.b);
      float a=clamp(b.a+h,0.,1.);gl_FragColor=vec4(c/max(a,.0001),a);}`,
  });
  alpha.uniforms.baseImage.value=base.texture;
  composer.addPass(source);composer.addPass(bloom);composer.addPass(alpha);composer.addPass(new OutputPass());
  return {
    resize(w,h){const dpr=renderer.getPixelRatio();base.setSize(w*dpr,h*dpr);composer.setSize(w,h);},
    render(scene,camera){const tone=renderer.toneMapping;renderer.toneMapping=THREE.NoToneMapping;renderer.setRenderTarget(base);renderer.clear();renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.toneMapping=tone;composer.render();},
    dispose(){base.dispose();source.dispose();bloom.dispose();alpha.dispose();composer.passes.at(-1).dispose();composer.dispose();},
  };
}

export function createGlassHalo(scene) {
  const group=new THREE.Group();group.position.set(-.3,.15,-1.25);group.rotation.set(.05,-.2,-.12);
  // A tapered refractive ribbon: most of the circumference vanishes into light.
  // The authored opening and a side-lit crescent avoid a uniform decorative hoop.
  const edgeMaterial=new THREE.MeshPhysicalMaterial({color:0xe9f8ff,metalness:.12,roughness:.06,clearcoat:1,transmission:.96,thickness:.12,ior:1.42,transparent:true,opacity:.5});
  const geometry=new THREE.TorusGeometry(2.32,.016,12,192,Math.PI*1.2);
  const positions=geometry.attributes.position;
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),a=Math.atan2(y,x),u=(a<0?a+Math.PI*2:a)/(Math.PI*1.2);
    const taper=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.65),r=Math.hypot(x,y),radius=2.32+(r-2.32)*taper;
    positions.setXYZ(i,x/r*radius,y/r*radius,z*taper);
  }
  geometry.computeVertexNormals();
  const edge=new THREE.Mesh(geometry,edgeMaterial);edge.rotation.z=2.5;group.add(edge);
  const glowGeometry=new THREE.TorusGeometry(2.32,.018,12,96,.8);
  const glintMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;void main(){float a=smoothstep(0.,.3,vUv.x)*(1.-smoothstep(.65,1.,vUv.x));gl_FragColor=vec4(6.,7.,8.,a*.85);}'
  });
  const glint=new THREE.Mesh(glowGeometry,glintMaterial);
  glint.rotation.z=3.25;group.add(glint);
  const haloMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'varying vec2 vUv;void main(){float falloff=pow(max(0.,1.-length(vUv-.5)*2.),3.);gl_FragColor=vec4(1.8,2.4,3.,falloff*.2);}'
  });
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.55),haloMaterial);halo.position.set(-2.03,-1.12,.03);group.add(halo);
  scene.add(group);
  return {group,dispose(){group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}};
}
