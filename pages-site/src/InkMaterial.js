import * as THREE from 'three';

let pigmentCache=null;

// One small, linear-data texture replaces six procedural 3D noises per fragment.
// Each channel carries a different pigment scale; all materials share its lifetime.
function acquirePigment() {
  if(!pigmentCache) {
    const size=128,pixels=new Uint8Array(size*size*4);
    const hash=(x,y,salt)=>{
      let n=Math.imul(x+salt,374761393)^Math.imul(y+salt*3,668265263);
      n=Math.imul(n^(n>>>13),1274126177);
      return ((n^(n>>>16))>>>0)/4294967295;
    };
    const noise=(x,y,cells,salt)=>{
      const px=x/size*cells,py=y/size*cells,ix=Math.floor(px),iy=Math.floor(py);
      let fx=px-ix,fy=py-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
      const a=hash(ix%cells,iy%cells,salt),b=hash((ix+1)%cells,iy%cells,salt);
      const c=hash(ix%cells,(iy+1)%cells,salt),d=hash((ix+1)%cells,(iy+1)%cells,salt);
      return a+(b-a)*fx+(c-a+(d-c-b+a)*fx)*fy;
    };
    for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
      const i=(y*size+x)*4;
      pixels[i]=Math.round(255*(noise(x,y,8,17)*.7+noise(x,y,16,31)*.3));
      pixels[i+1]=Math.round(255*noise(x,y,32,53));
      pixels[i+2]=Math.round(255*hash(x,y,97));pixels[i+3]=255;
    }
    const texture=new THREE.DataTexture(pixels,size,size);
    texture.name='shared mineral pigment / wash, dry deposit, grain';
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
    texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps=true;texture.needsUpdate=true;
    pigmentCache={texture,refs:0};
  }
  pigmentCache.refs++;
  return pigmentCache;
}

function bindPigment(material) {
  const entry=acquirePigment();let released=false;
  material.addEventListener('dispose',()=>{
    if(released)return;released=true;
    if(--entry.refs===0){entry.texture.dispose();if(pigmentCache===entry)pigmentCache=null;}
  });
  return entry.texture;
}

const pigmentProjection='vec2(vInkPosition.x+vInkPosition.z*.37,vInkPosition.y+vInkPosition.z*.71)';

// The caller owns a shared frame uniform. No clocks, per-leaf matrices or RAFs.
const foliageShader=`
  attribute vec2 leafMotion;
  uniform float foliageTime;
  uniform float foliageStrength;
  float leafAngle() {
    return foliageStrength*leafMotion.y*(sin(foliageTime*1.1+leafMotion.x)*.055+sin(foliageTime*1.9+leafMotion.x*1.7)*.018);
  }
`;

export function createInkMaterial(color,strength=.7,foliage=false,motion=null) {
  const material=new THREE.MeshStandardMaterial({color,roughness:1,metalness:0,side:foliage?THREE.DoubleSide:THREE.FrontSide});
  const texture=bindPigment(material);
  material.name=foliage?'curved ink foliage':'granulated mineral pigment';
  material.onBeforeCompile=shader=>{
    shader.uniforms.inkStrength={value:strength};shader.uniforms.inkFoliage={value:foliage?1:0};
    shader.uniforms.inkPigment={value:texture};
    if(motion) {
      shader.uniforms.foliageTime=motion.time;shader.uniforms.foliageStrength=motion.strength;
      shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\n${foliageShader}`);
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        float foliageNormalAngle=leafAngle();float foliageNormalCos=cos(foliageNormalAngle),foliageNormalSin=sin(foliageNormalAngle);
        objectNormal.yz=mat2(foliageNormalCos,foliageNormalSin,-foliageNormalSin,foliageNormalCos)*objectNormal.yz;
      `);
    }
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      ${motion?'float foliageAngle=leafAngle();float foliageCos=cos(foliageAngle),foliageSin=sin(foliageAngle);transformed.yz=mat2(foliageCos,foliageSin,-foliageSin,foliageCos)*transformed.yz;':''}
      vec4 pigmentPoint=vec4(transformed,1.);
      #ifdef USE_INSTANCING
        pigmentPoint=instanceMatrix*pigmentPoint;
      #endif
      vInkPosition=pigmentPoint.xyz;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vInkPosition;uniform sampler2D inkPigment;
      uniform float inkStrength;uniform float inkFoliage;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec2 pigmentUV=${pigmentProjection};
      vec3 washSample=texture2D(inkPigment,pigmentUV*.27).rgb;
      vec3 detailSample=texture2D(inkPigment,pigmentUV*2.1+vec2(.37,.19)).rgb;
      float wash=washSample.r*.7+detailSample.r*.3;
      float pool=1.-smoothstep(.02,.12,abs(wash-.45));
      float dry=smoothstep(.64,.83,detailSample.g);
      float stroke=smoothstep(.57,.73,detailSample.g)*smoothstep(.51,.66,washSample.r);
      float pigment=1.+inkStrength*((wash-.5)*.34-pool*.12+(detailSample.b-.5)*.06);
      diffuseColor.rgb*=pigment*(1.-stroke*.16*inkStrength);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.89,.86,.78),dry*.020*inkStrength*(1.-inkFoliage*.65));
    `);
    // Only albedo changes: directional light and shaded eaves retain PBR volume.
  };
  material.customProgramCacheKey=()=>`mineral-ink-v6-texture-${motion?'sway':'static'}`;
  return material;
}

export function createInkLines() {
  const material=new THREE.LineBasicMaterial({color:0x30372e,transparent:true,opacity:.37,depthWrite:false});
  const texture=bindPigment(material);
  material.onBeforeCompile=shader=>{
    shader.uniforms.inkPigment={value:texture};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvInkPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;uniform sampler2D inkPigment;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      diffuseColor.a*=smoothstep(.16,.56,texture2D(inkPigment,${pigmentProjection}*1.1).g);
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey=()=> 'broken-ink-contours-v3-texture';
  return material;
}
