import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
export function autumnRetreat(frame){return 1-smooth(900,1080,frame);}
export function fallingLeafPose(index,frame){
  const phase=((index*.61803398875+frame/510)%1+1)%1;
  return {x:Math.sin(index*2.4)*4+Math.sin(phase*5+index)*.6,y:4.9-phase*9.5,z:1+Math.sin(index)*1.2,turn:phase*5+index};
}
export function fallingLeafVisibility(x,y,frame,portrait){
  // Screen-space copy reserves avoid DOM measurement during scroll. Fade before
  // a leaf reaches the text, rather than drawing the text over red fragments.
  if(portrait)return 1-smooth(.38,.45,y);
  const chapter=frame<270?0:frame<540?1:frame<810?2:3;
  const [left,right,top,bottom]=[[.035,.46,.38,.88],[.60,.99,.29,.88],[.56,.99,.06,.74],[.50,.99,.54,.92]][chapter];
  const inside=smooth(left-.05,left,x)*(1-smooth(right,right+.05,x))*smooth(top-.05,top,y)*(1-smooth(bottom,bottom+.05,y));
  return (1-inside)*(1-smooth(.80,.86,y));
}
function mapleGeometry(){
  // Lobed, serrated silhouette with a raised midrib; individual leaves are 3D
  // surfaces, not camera-facing particles or screen-space red confetti.
  const outline=[[0,-.32],[-.09,-.14],[-.37,-.18],[-.31,-.04],[-.53,.10],[-.31,.14],[-.43,.38],[-.22,.29],[-.19,.55],[-.08,.40],[0,.79],[.08,.40],[.19,.55],[.22,.29],[.43,.38],[.31,.14],[.53,.10],[.31,-.04],[.37,-.18],[.09,-.14]];
  const vertices=[0,.12,.055],indices=[];
  for(const [x,y] of outline)vertices.push(x,y,Math.sin(y*3)*.035+Math.abs(x)*.05);
  for(let i=0;i<outline.length;i++)indices.push(0,i+1,(i+1)%outline.length+1);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function createAutumnFrame(){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);
  camera.position.z=13;scene.add(new THREE.HemisphereLight(0xecf6ff,0x4b251e,2));
  const sun=new THREE.DirectionalLight(0xffede1,3);sun.position.set(-3,6,8);scene.add(sun);
  const branch=new THREE.Group();scene.add(branch);
  const wood=new THREE.MeshStandardMaterial({color:0x503a32,roughness:.94});
  const leaf=new THREE.MeshStandardMaterial({color:0xffffff,side:THREE.DoubleSide,roughness:.72,metalness:0,emissive:0x210500,emissiveIntensity:.18});
  const wind={value:0};leaf.onBeforeCompile=s=>{s.uniforms.autumnWind=wind;s.vertexShader='uniform float autumnWind;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z+=sin(autumnWind+instanceMatrix[3].x*2.+instanceMatrix[3].y)*.055*max(0.,position.y);');};
  const leafGeo=mapleGeometry(),leafCount=180,leaves=new THREE.InstancedMesh(leafGeo,leaf,leafCount),pose=new THREE.Object3D();
  const palette=[0xb82f22,0x912a28,0xd64c2c,0x85302a,0xc54b36].map(c=>new THREE.Color(c));
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
    pose.scale.setScalar(.22+(i%7)*.018);pose.updateMatrix();leaves.setMatrixAt(i,pose.matrix);leaves.setColorAt(i,palette[i%palette.length]);
  }
  leaves.instanceMatrix.needsUpdate=true;branch.add(leaves);
  const fallingGeo=leafGeo.clone(),visibility=new THREE.InstancedBufferAttribute(new Float32Array(24),1);
  visibility.setUsage(THREE.DynamicDrawUsage);fallingGeo.setAttribute('leafVisibility',visibility);
  const fallingMaterial=leaf.clone();fallingMaterial.transparent=true;fallingMaterial.depthWrite=false;
  fallingMaterial.onBeforeCompile=s=>{
    leaf.onBeforeCompile(s);
    s.vertexShader='attribute float leafVisibility;varying float vLeafVisibility;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafVisibility=leafVisibility;');
    s.fragmentShader='varying float vLeafVisibility;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vLeafVisibility;');
  };
  fallingMaterial.customProgramCacheKey=()=> 'autumn-copy-reserve-v1';
  const falling=new THREE.InstancedMesh(fallingGeo,fallingMaterial,24),projected=new THREE.Vector3();falling.instanceMatrix.setUsage(THREE.DynamicDrawUsage);falling.frustumCulled=false;scene.add(falling);
  for(let i=0;i<24;i++)falling.setColorAt(i,palette[i%palette.length]);
  let lastFrame=-1,lastAspect=0;
  return {scene,camera,branch,falling,
    update(frame,aspect,still=false){
      if(lastFrame===frame&&lastAspect===aspect)return;lastFrame=frame;lastAspect=aspect;
      const f=still?90:frame,remain=autumnRetreat(f),halfWidth=13*Math.tan(THREE.MathUtils.degToRad(17.5))*aspect;
      const portrait=aspect<1;
      scene.visible=remain>0;camera.aspect=aspect;camera.updateProjectionMatrix();camera.updateMatrixWorld();
      branch.position.set(halfWidth+(portrait?.2:.35)+(1-remain)*3,(portrait?4.05:3.35)+(1-remain)*1.8,0);
      branch.scale.setScalar((portrait?.42:1)*(.55+.45*remain));branch.rotation.z=.025*Math.sin(f/170)+(1-remain)*.2;
      wind.value=f/24;
      for(let i=0;i<24;i++){
        const p=fallingLeafPose(i,f);pose.position.set(p.x*(aspect<1?.40:1),p.y+(1-remain)*7,p.z);
        projected.copy(pose.position).project(camera);visibility.setX(i,fallingLeafVisibility(projected.x*.5+.5,.5-projected.y*.5,f,portrait));
        pose.rotation.set(p.turn*.7,p.turn,p.turn*.6);pose.scale.setScalar((.075+(i%5)*.016)*remain);pose.updateMatrix();falling.setMatrixAt(i,pose.matrix);
      }
      falling.instanceMatrix.needsUpdate=true;visibility.needsUpdate=true;
    },
    dispose(){leafGeo.dispose();fallingGeo.dispose();fallingMaterial.dispose();leaf.dispose();wood.dispose();twigs.forEach(g=>g.dispose());leaves.dispose();falling.dispose();}
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
