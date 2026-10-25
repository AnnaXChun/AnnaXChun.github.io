import * as THREE from 'three';
import {FullScreenQuad} from 'three/addons/postprocessing/Pass.js';

// A single bounded target lets the building recede behind the evidence while
// the maple remains in the foreground. No bloom chain or screen-space reflection.
export function createCourtyardComposite(renderer){
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:2});
  const material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,
    uniforms:{image:{value:target.texture},fade:{value:1},sceneBottom:{value:2},navigation:{value:new THREE.Vector2(-1,-1)}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`uniform sampler2D image;uniform float fade;uniform float sceneBottom;uniform vec2 navigation;varying vec2 vUv;void main(){vec4 b=texture2D(image,vUv);float edge=1.-smoothstep(sceneBottom-.065,sceneBottom,1.-vUv.y);float clearNav=1.-(1.-smoothstep(navigation.x,navigation.x+.055,vUv.x))*(1.-smoothstep(navigation.y,navigation.y+.07,vUv.y));gl_FragColor=vec4(b.rgb/max(b.a,.0001),b.a*fade*edge*clearNav);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
  });
  const quad=new FullScreenQuad(material);
  return {target,resize(w,h,navigation){const dpr=renderer.getPixelRatio();target.setSize(Math.round(w*dpr),Math.round(h*dpr));material.uniforms.navigation.value.set(navigation?.right??-1,navigation?.top??-1);},draw(opacity,sceneBottom=2){material.uniforms.fade.value=opacity;material.uniforms.sceneBottom.value=sceneBottom;quad.render(renderer);},dispose(){target.dispose();material.dispose();quad.dispose();}};
}
