import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {createMapleLeafAsset} from './MapleLeafAsset.js';
import {createMaplePhysics} from './MaplePhysics.js';
import {createGlyphShelves,frameAutumnCamera} from './GlyphShelves.js';

const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
export function autumnRetreat(frame){return 1-smooth(900,1080,frame);}
export function fallingLeafVisibility(x,y,frame,portrait){
  // Screen-space copy reserves avoid DOM measurement during scroll. Fade before
  // a leaf reaches the text, rather than drawing the text over red fragments.
  if(portrait)return 1-smooth(.38,.45,y);
  const chapter=frame<270?0:frame<540?1:frame<810?2:3;
  const [left,right,top,bottom]=[[.035,.46,.38,.88],[.60,.99,.29,.88],[.56,.99,.06,.74],[.50,.99,.54,.92]][chapter];
  const inside=smooth(left-.05,left,x)*(1-smooth(right,right+.05,x))*smooth(top-.05,top,y)*(1-smooth(bottom,bottom+.05,y));
  return (1-inside)*(1-smooth(.80,.86,y));
}
export function createAutumnFrame(onReady=()=>{}){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);
  frameAutumnCamera(camera,1);
  const ambient=new THREE.HemisphereLight(0xecf6ff,0x4b251e,2);ambient.layers.enable(1);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffede1,3);sun.position.set(-3,6,8);sun.layers.enable(1);scene.add(sun);
  sun.castShadow=true;sun.shadow.mapSize.set(512,512);sun.shadow.camera.layers.enable(1);
  Object.assign(sun.shadow.camera,{left:-9,right:9,top:6,bottom:-6,near:1,far:24});
  sun.shadow.normalBias=.008;sun.shadow.bias=-.0001;sun.shadow.radius=2;sun.shadow.blurSamples=4;
  const shelves=createGlyphShelves(onReady);scene.add(shelves.group);
  const releaseShadow=()=>{sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();sun.shadow.map=null;sun.shadow.mapPass=null;};
  const branch=new THREE.Group();scene.add(branch);
  const wood=new THREE.MeshStandardMaterial({color:0x503a32,roughness:.94});
  const asset=createMapleLeafAsset(),leaf=asset.material,leafGeo=asset.geometry;
  asset.ready.then(onReady);
  const wind={value:0};
  leaf.onBeforeCompile=s=>{
    s.uniforms.autumnWind=wind;
    s.vertexShader='uniform float autumnWind;\n'+s.vertexShader
      .replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
        float leafAngle=sin(autumnWind+instanceMatrix[3].x*2.+instanceMatrix[3].y)*.11;
        mat2 leafBend=mat2(cos(leafAngle),sin(leafAngle),-sin(leafAngle),cos(leafAngle));
        objectNormal.yz=leafBend*objectNormal.yz;`)
      .replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.yz=leafBend*vec2(position.y+.5,position.z);transformed.y-=.5;');
  };
  leaf.customProgramCacheKey=()=> 'closed-maple-wind-v1';
  const leafCount=132,leaves=new THREE.InstancedMesh(leafGeo,leaf,leafCount),pose=new THREE.Object3D();
  const palette=[0xffffff,0xf8e0c8,0xffd6ba,0xe8c4ad,0xf9ead3].map(c=>new THREE.Color(c));
  const twigs=[];
  function twig(points,radius){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const g=new THREE.TubeGeometry(curve,18,radius,7,false);const m=new THREE.Mesh(g,wood);branch.add(m);twigs.push(g);return curve;}
  twig([[.6,.3,0],[0,.07,.05],[-1.2,-.4,.10],[-2.3,-.53,.07],[-3.5,-1.10,0]],.035);
  const tips=[];
  for(let i=0;i<12;i++){
    const t=(i+.4)/12,x=-3.1*t,y=-.55*t,sign=i%2?1:-1;
    const tip=[x-.4,y+sign*(.45+Math.sin(i)*.18),Math.sin(i)*.12];
    twig([[x,y,0],[x-.2,y+sign*.18,.05],tip],.009);tips.push(tip);
  }
  for(let i=0;i<leafCount;i++){
    const tip=tips[i%tips.length],a=i*2.39996,r=.1+Math.sqrt((i*.754877)%1)*.42;
    pose.position.set(tip[0]+Math.cos(a)*r,tip[1]+Math.sin(a)*r*.6,tip[2]+Math.sin(i*4.3)*.28);
    pose.rotation.set(.3+Math.sin(i)*.95,Math.sin(i*1.7)*.8,a);
    pose.scale.setScalar(.34+(i%7)*.024);pose.updateMatrix();leaves.setMatrixAt(i,pose.matrix);leaves.setColorAt(i,palette[i%palette.length]);
  }
  leaves.instanceMatrix.needsUpdate=true;branch.add(leaves);
  const fallingCount=12,fallingGeo=leafGeo.clone(),visibility=new THREE.InstancedBufferAttribute(new Float32Array(fallingCount),1);
  visibility.setUsage(THREE.DynamicDrawUsage);fallingGeo.setAttribute('leafVisibility',visibility);
  const fallingMaterial=leaf.clone();fallingMaterial.transparent=true;fallingMaterial.depthWrite=false;
  fallingMaterial.onBeforeCompile=s=>{
    s.vertexShader='attribute float leafVisibility;varying float vLeafVisibility;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafVisibility=leafVisibility;');
    s.fragmentShader='varying float vLeafVisibility;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vLeafVisibility;');
  };
  fallingMaterial.customProgramCacheKey=()=> 'closed-maple-rigid-body-v2';
  const falling=new THREE.InstancedMesh(fallingGeo,fallingMaterial,fallingCount),projected=new THREE.Vector3();falling.instanceMatrix.setUsage(THREE.DynamicDrawUsage);falling.frustumCulled=false;falling.castShadow=true;scene.add(falling);
  for(let i=0;i<fallingCount;i++)falling.setColorAt(i,palette[i%palette.length]);
  const physics=createMaplePhysics({count:fallingCount});
  let lastFrame=-1,lastAspect=0,lastTime=-1;
  return {scene,camera,branch,falling,getDiagnostics:()=>physics.getDiagnostics(),setPaused(value){physics.setPaused(value);if(value)releaseShadow();},
    drawShelves(renderer){if(!shelves.group.children.length)return;camera.layers.set(1);renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);camera.layers.set(0);},
    update(frame,aspect,still=false,time=0,delta=0,textSurface=null){
      const windTime=still?0:time;
      if(lastFrame===frame&&lastAspect===aspect&&lastTime===windTime&&!textSurface)return;
      const halfHeight=13*Math.tan(THREE.MathUtils.degToRad(17.5)),halfWidth=halfHeight*aspect;
      if(lastAspect!==aspect)physics.resize({halfWidth,halfHeight,portrait:aspect<1});
      if(textSurface){physics.setTextColliders(textSurface.boxes,textSurface.key);shelves.update(textSurface);}
      lastFrame=frame;lastAspect=aspect;lastTime=windTime;
      const f=still?90:frame,remain=autumnRetreat(f);
      const portrait=aspect<1;
      scene.visible=remain>0;frameAutumnCamera(camera,aspect);
      const breeze=still?0:Math.sin(windTime*.68)*.022+Math.sin(windTime*1.31)*.007;
      // Keep the large crown above the lettering; its resting leaves still
      // belong to the title. Narrow desktop views need more top clearance.
      const crownClearance=portrait?0:1.1+.4*(1-smooth(1.45,2,aspect));
      branch.position.set(halfWidth+(portrait?.55:.8)+(1-remain)*5,(portrait?4.7:4.3+crownClearance)+(1-remain)*2.5+breeze*.8,0);
      branch.scale.setScalar((portrait?.7:1.65)*(.55+.45*remain));branch.rotation.set(breeze*.5,breeze*.9,breeze+(1-remain)*.2);
      wind.value=windTime*2.4;
      const poses=physics.step(still?0:delta,time);
      for(let i=0;i<fallingCount;i++){
        const p=poses[i];pose.position.fromArray(p.position);pose.position.y+=(1-remain)*7;
        projected.copy(pose.position).project(camera);visibility.setX(i,fallingLeafVisibility(projected.x*.5+.5,.5-projected.y*.5,f,portrait));
        pose.quaternion.fromArray(p.quaternion);
        pose.scale.setScalar(p.scale*remain);pose.updateMatrix();falling.setMatrixAt(i,pose.matrix);
      }
      falling.instanceMatrix.needsUpdate=true;visibility.needsUpdate=true;
    },
    dispose(){physics.dispose();shelves.dispose();releaseShadow();fallingGeo.dispose();fallingMaterial.dispose();asset.dispose();wood.dispose();twigs.forEach(g=>g.dispose());leaves.dispose();falling.dispose();}
  };
}

export function createCourtyardWater(){
  const shader={
    uniforms:{color:{value:new THREE.Color(0xa8c0ca)},tDiffuse:{value:null},textureMatrix:{value:new THREE.Matrix4()},waterPhase:{value:0}},
    vertexShader:`uniform mat4 textureMatrix;varying vec4 vReflect;varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;vReflect=textureMatrix*vec4(position,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform float waterPhase;varying vec4 vReflect;varying vec3 vWorld;
      float basin(vec2 p,vec2 center,vec2 radius){return 1.-smoothstep(.65,1.,length((p-center)/radius)+sin(p.x*3.+p.y*2.)*.055+sin(p.y*6.-p.x)*.035);}
      void main(){vec2 p=vWorld.xz;float mask=max(basin(p,vec2(.5,5.8),vec2(4.2,1.7)),max(basin(p,vec2(-1.7,2.0),vec2(1.25,.72)),basin(p,vec2(3.,.7),vec2(.75,1.45))));if(mask<.01)discard;
        vec2 uv=vReflect.xy/vReflect.w;uv+=vec2(sin(p.y*19.+waterPhase),cos(p.x*15.+waterPhase*.7))*.00065;
        vec4 reflected=texture2D(tDiffuse,uv);vec3 tint=mix(vec3(.68,.79,.84),reflected.rgb,.78*reflected.a);
        gl_FragColor=vec4(tint,mask*.56);#include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`.replace(';#include',';\n#include'),
  };
  const geometry=new THREE.PlaneGeometry(18,18),water=new Reflector(geometry,{textureWidth:768,textureHeight:512,multisample:0,clipBias:.003,shader});
  water.name='rain-wet stone / reflected roof and maple';water.rotation.x=-Math.PI/2;water.position.y=.052;water.material.transparent=true;water.material.depthWrite=false;
  // Reflections use a bounded buffer and share the cached architectural shadow.
  return {mesh:water,update(frame){water.material.uniforms.waterPhase.value=frame/18;},resize(active){water.getRenderTarget().setSize(active?768:1,active?512:1);},dispose(){water.dispose();geometry.dispose();}};
}
