import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {createMapleLeafAsset} from './MapleLeafAsset.js';

const smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
export function autumnRetreat(frame){return 1-smooth(900,1080,frame);}
export function fallingLeafPose(index,time){
  const duration=15+(index*7)%11,phase=((index*.61803398875+time/duration)%1+1)%1;
  const gust=Math.sin(time*.47)*.5+Math.sin(time*1.13+1.8)*.18;
  return {
    x:Math.sin(index*2.4)*4.5+(phase-.5)*2.8+Math.sin(phase*Math.PI*2+index)*.65+gust,
    y:5.5-phase*11+Math.sin(time*1.4+index)*.12,
    z:(index%5===0?3.3:.15+Math.sin(index)*.65)+Math.sin(phase*Math.PI*2+index)*.45,
    turn:time*(.63+index%4*.13)+index,
    flutter:.5+Math.sin(time*(1.35+index%3*.13)+index)*.9,
    scale:index%5===0?.4+(index%3)*.025:.13+(index%4)*.018,
    // Recycle outside the image with a soft birth/death, never snap in view.
    visibility:smooth(0,.07,phase)*(1-smooth(.89,1,phase)),
  };
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
export function createAutumnFrame(onReady=()=>{}){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);
  camera.position.z=13;scene.add(new THREE.HemisphereLight(0xecf6ff,0x4b251e,2));
  const sun=new THREE.DirectionalLight(0xffede1,3);sun.position.set(-3,6,8);scene.add(sun);
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
  const leafCount=180,leaves=new THREE.InstancedMesh(leafGeo,leaf,leafCount),pose=new THREE.Object3D();
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
    pose.scale.setScalar(.22+(i%7)*.018);pose.updateMatrix();leaves.setMatrixAt(i,pose.matrix);leaves.setColorAt(i,palette[i%palette.length]);
  }
  leaves.instanceMatrix.needsUpdate=true;branch.add(leaves);
  const fallingCount=18,fallingGeo=leafGeo.clone(),visibility=new THREE.InstancedBufferAttribute(new Float32Array(fallingCount),1);
  visibility.setUsage(THREE.DynamicDrawUsage);fallingGeo.setAttribute('leafVisibility',visibility);
  const fallingMaterial=leaf.clone();fallingMaterial.transparent=true;fallingMaterial.depthWrite=false;
  fallingMaterial.onBeforeCompile=s=>{
    leaf.onBeforeCompile(s);
    s.vertexShader='attribute float leafVisibility;varying float vLeafVisibility;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLeafVisibility=leafVisibility;');
    s.fragmentShader='varying float vLeafVisibility;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vLeafVisibility;');
  };
  fallingMaterial.customProgramCacheKey=()=> 'closed-maple-falling-reserve-v1';
  const falling=new THREE.InstancedMesh(fallingGeo,fallingMaterial,fallingCount),projected=new THREE.Vector3();falling.instanceMatrix.setUsage(THREE.DynamicDrawUsage);falling.frustumCulled=false;scene.add(falling);
  for(let i=0;i<fallingCount;i++)falling.setColorAt(i,palette[i%palette.length]);
  let lastFrame=-1,lastAspect=0,lastTime=-1;
  return {scene,camera,branch,falling,
    update(frame,aspect,still=false,time=0){
      const windTime=still?0:time;
      if(lastFrame===frame&&lastAspect===aspect&&lastTime===windTime)return;lastFrame=frame;lastAspect=aspect;lastTime=windTime;
      const f=still?90:frame,remain=autumnRetreat(f),halfWidth=13*Math.tan(THREE.MathUtils.degToRad(17.5))*aspect;
      const portrait=aspect<1;
      scene.visible=remain>0;camera.aspect=aspect;camera.updateProjectionMatrix();camera.updateMatrixWorld();
      const breeze=still?0:Math.sin(windTime*.68)*.022+Math.sin(windTime*1.31)*.007;
      branch.position.set(halfWidth+(portrait?.2:.35)+(1-remain)*3,(portrait?4.05:3.35)+(1-remain)*1.8+breeze*.8,0);
      branch.scale.setScalar((portrait?.42:1)*(.55+.45*remain));branch.rotation.set(breeze*.5,breeze*.9,breeze+(1-remain)*.2);
      wind.value=windTime*2.4;
      for(let i=0;i<fallingCount;i++){
        const p=fallingLeafPose(i,windTime);pose.position.set(p.x*(portrait?.32:1),p.y+(1-remain)*7,p.z);
        projected.copy(pose.position).project(camera);visibility.setX(i,p.visibility*fallingLeafVisibility(projected.x*.5+.5,.5-projected.y*.5,f,portrait));
        pose.rotation.set(p.flutter,p.turn,Math.sin(windTime*.67+i)*.55+p.turn*.23);
        pose.scale.setScalar(p.scale*(portrait?.5:1)*remain);pose.updateMatrix();falling.setMatrixAt(i,pose.matrix);
      }
      falling.instanceMatrix.needsUpdate=true;visibility.needsUpdate=true;
    },
    dispose(){fallingGeo.dispose();fallingMaterial.dispose();asset.dispose();wood.dispose();twigs.forEach(g=>g.dispose());leaves.dispose();falling.dispose();}
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
