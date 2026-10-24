import * as THREE from 'three';

const noise = `
  float inkHash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
  float inkNoise(vec3 p) {
    vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(inkHash(i),inkHash(i+vec3(1,0,0)),f.x),mix(inkHash(i+vec3(0,1,0)),inkHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(inkHash(i+vec3(0,0,1)),inkHash(i+vec3(1,0,1)),f.x),mix(inkHash(i+vec3(0,1,1)),inkHash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
`;

// Local pigment deposits follow the geometry. No blur, bright directional stripes,
// or paper veil: the masonry, roof relief and leaf silhouettes supply the detail.
export function createInkMaterial(color, strength=.7, foliage=false) {
  const material=new THREE.MeshStandardMaterial({color,roughness:1,metalness:0,side:foliage?THREE.DoubleSide:THREE.FrontSide});
  material.name=foliage?'banyan ink leaves':'granulated mineral pigment';
  material.onBeforeCompile=shader=>{
    shader.uniforms.inkStrength={value:strength};
    shader.uniforms.inkFoliage={value:foliage?1:0};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvInkPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vInkPosition;
      uniform float inkStrength;
      uniform float inkFoliage;
      ${noise}
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 p=vInkPosition;
      float wash=inkNoise(p*2.7)*.6+inkNoise(p*8.1)*.4;
      float granule=inkNoise(p*66.0);
      float pool=1.0-smoothstep(.02,.12,abs(wash-.45));
      float dry=smoothstep(.64,.83,inkNoise(p*vec3(38.,56.,43.)));
      float stroke=smoothstep(.57,.73,inkNoise(p*vec3(31.,57.,25.)+wash*2.));
      float strokePatch=smoothstep(.51,.66,inkNoise(p*1.7));
      float pigment=1.0+inkStrength*((wash-.5)*.34-pool*.12+(granule-.5)*.06);
      diffuseColor.rgb*=pigment*(1.-stroke*strokePatch*.16*inkStrength);
      // Sparse broken paper flecks occur in dry patches, never across every face.
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.89,.86,.78),dry*.020*inkStrength*(1.-inkFoliage*.65));
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      // Retain directional shading and contact shadows, softly limit the highlights.
      float lightValue=dot(outgoingLight,vec3(.2126,.7152,.0722))/max(.025,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)));
      outgoingLight=diffuseColor.rgb*(.43+.70*smoothstep(.08,2.0,lightValue));
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey=()=> 'mineral-ink-v4';
  return material;
}

export function createInkLines() {
  const material=new THREE.LineBasicMaterial({color:0x30372e,transparent:true,opacity:.37,depthWrite:false});
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvInkPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vInkPosition;\n${noise}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      diffuseColor.a*=smoothstep(.16,.56,inkNoise(vInkPosition*vec3(18.,21.,15.)));
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey=()=> 'broken-ink-contours-v2';
  return material;
}
