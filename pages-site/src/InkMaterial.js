import * as THREE from 'three';

const noise = `
  float inkHash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
  float inkNoise(vec3 p) {
    vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(inkHash(i),inkHash(i+vec3(1,0,0)),f.x),mix(inkHash(i+vec3(0,1,0)),inkHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(inkHash(i+vec3(0,0,1)),inkHash(i+vec3(1,0,1)),f.x),mix(inkHash(i+vec3(0,1,1)),inkHash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
`;

// Pigment is anchored to the actual surface, so brush marks retain their depth
// during a dolly. Broad wet washes, dragged dry strokes and paper fibres differ.
export function createInkMaterial(color, strength=.7, foliage=false) {
  const material=new THREE.MeshStandardMaterial({color,roughness:1,metalness:0,side:foliage?THREE.DoubleSide:THREE.FrontSide});
  material.name=foliage?'curved ink leaves':'mineral pigment on paper';
  material.onBeforeCompile=shader=>{
    shader.uniforms.inkStrength={value:strength};
    shader.uniforms.inkFoliage={value:foliage?1:0};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;\nvarying vec3 vInkNormal;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvInkPosition=position;vInkNormal=normal;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vInkPosition;
      varying vec3 vInkNormal;
      uniform float inkStrength;
      uniform float inkFoliage;
      ${noise}
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 p=vInkPosition;
      vec3 paper=vec3(.930,.905,.838);
      float cloud=inkNoise(p*.65)*.5+inkNoise(p*2.2)*.32+inkNoise(p*6.4)*.18;
      float roofness=smoothstep(.48,.85,abs(normalize(vInkNormal).y));
      vec3 brushDirection=mix(vec3(7.0,90.0,5.0),vec3(110.0,5.0,7.0),roofness);
      float brush=inkNoise(p*brushDirection+vec3(cloud*1.8));
      float fibre=inkNoise(p*brushDirection*3.0);
      float dry=smoothstep(.52,.78,brush)*(.35+.65*fibre);
      float tide=1.0-smoothstep(.025,.105,abs(cloud-.47));
      float pigment=clamp(mix(.88,.95,inkFoliage)+(cloud-.5)*.48+inkStrength*(tide*.08-dry*.18),.50,1.0);
      diffuseColor.rgb=mix(paper,diffuseColor.rgb,pigment);
      diffuseColor.rgb*=.94+.10*inkHash(floor(p*270.0));
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      // Compress the hard lit / unlit PBR contrast into diluted ink values.
      float lightValue=dot(outgoingLight,vec3(.2126,.7152,.0722))/max(.04,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)));
      float washLight=smoothstep(.12,1.75,lightValue);
      outgoingLight=diffuseColor.rgb*mix(.62,1.04,washLight);
      outgoingLight=mix(outgoingLight,vec3(.930,.905,.838),mix(.035,.012,inkFoliage)*washLight);
      #include <opaque_fragment>
    `);
  };
  // All pigment colours share a program; only the leaf sidedness needs a variant.
  material.customProgramCacheKey=()=> 'ink-wash-v3';
  return material;
}

export function createInkLines() {
  const material=new THREE.LineBasicMaterial({color:0x454740,transparent:true,opacity:.32,depthWrite:false});
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vInkPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvInkPosition=position;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nvarying vec3 vInkPosition;\n${noise}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      diffuseColor.a*=smoothstep(.22,.62,inkNoise(vInkPosition*vec3(14.,9.,18.)));
      #include <opaque_fragment>
    `);
  };
  material.customProgramCacheKey=()=> 'broken-ink-contours-v1';
  return material;
}
