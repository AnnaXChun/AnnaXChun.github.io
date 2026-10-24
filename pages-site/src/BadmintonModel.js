import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Modelled feather vanes, quills, binding thread and a rounded cork nose.
// The shuttle is open, with visible space between feathers and a true 3D skirt.
export function createBadmintonModel() {
  const shuttle=new THREE.Group(),racket=new THREE.Group(),resources=new Set();
  const material=(color,roughness=.8,metalness=0)=>{
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness});resources.add(m);return m;
  };
  const feather=material(0xf6f0dd),quill=material(0xcac5ae),cork=material(0xd1b88e),ink=material(0x263c34,.38),red=material(0xa34f3e,.5),string=material(0xc1b79e);
  feather.side=THREE.DoubleSide;
  const batches=new Map();
  function add(g,m,parent,position=[0,0,0],rotation=[0,0,0]) {
    const mesh=new THREE.Mesh(g,m);mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);resources.add(g);return mesh;
  }
  function stroke(points,radius,m,parent) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    return add(new THREE.TubeGeometry(curve,Math.max(8,points.length*3),radius,5,false),m,parent);
  }
  function batch(g,m) {
    const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();flat.deleteAttribute('uv');
    if(!batches.has(m))batches.set(m,[]);batches.get(m).push(flat);
  }
  const corkProfile=[new THREE.Vector2(0,-.66),new THREE.Vector2(.13,-.64),new THREE.Vector2(.23,-.56),new THREE.Vector2(.27,-.43),new THREE.Vector2(.27,-.18),new THREE.Vector2(.24,-.12)];
  add(new THREE.LatheGeometry(corkProfile,40),cork,shuttle);
  add(new THREE.CylinderGeometry(.275,.275,.10,40),ink,shuttle,[0,-.20,0]);
  add(new THREE.TorusGeometry(.273,.014,8,40),red,shuttle,[0,-.15,0],[Math.PI/2,0,0]);
  for(let i=0;i<16;i++) {
    const angle=i/16*Math.PI*2,transform=new THREE.Matrix4().makeRotationY(angle);
    const positions=[],indices=[],rows=12,cols=6;
    for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++) {
      const t=row/rows,u=(col/cols-.5)*2;
      const width=.12*Math.pow(Math.sin(Math.PI*(.05+.9*t)),.52);
      const y=.24+t*1.18,radial=.36+t*.49;
      positions.push(u*width,y-.065*u*u,radial+.055*Math.sin(t*Math.PI)+.035*u*u);
    }
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++) {
      const a=row*(cols+1)+col;indices.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);
    }
    const vane=new THREE.BufferGeometry();vane.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));vane.setIndex(indices);vane.computeVertexNormals();vane.applyMatrix4(transform);batch(vane,feather);
    const veinPoints=[[0,-.14,.20],[0,.26,.36],[0,.80,.62],[0,1.43,.85]];
    const vein=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(veinPoints.map(p=>new THREE.Vector3(...p))),14,.009,5,false);vein.applyMatrix4(transform);batch(vein,quill);
    for(let j=0;j<7;j++)for(const side of [-1,1]) {
      const t=.14+j*.105,y=.24+t*1.18,r=.36+t*.49+.055*Math.sin(t*Math.PI),w=.115*Math.pow(Math.sin(Math.PI*(.05+.9*t)),.52);
      const barb=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,y,r+.008),new THREE.Vector3(side*w*.6,y+.045,r+.029),new THREE.Vector3(side*w,y+.07,r+.04)]),4,.003,3,false);
      barb.applyMatrix4(transform);batch(barb,quill);
    }
  }
  for(const [y,r] of [[.28,.38],[.49,.47]])add(new THREE.TorusGeometry(r,.014,6,64),quill,shuttle,[0,y,0],[Math.PI/2,0,0]);
  for(const [m,geometries] of batches) {
    const g=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());add(g,m,shuttle);
  }
  // An oval racket has a narrow carbon frame, open string bed and wrapped handle.
  const oval=(radius)=>Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2;return[Math.sin(a)*.72*radius,Math.cos(a)*.92*radius,0];});
  stroke(oval(1),.036,ink,racket);stroke(oval(.94),.011,red,racket);
  for(let i=-7;i<=7;i++) {
    const x=i*.085,y=.87*Math.sqrt(1-(x/.68)**2);
    stroke([[x,-y,0],[x,y,0]],.005,string,racket);
  }
  for(let i=-9;i<=9;i++) {
    const y=i*.085,x=.68*Math.sqrt(1-(y/.87)**2);
    stroke([[-x,y,0],[x,y,0]],.005,string,racket);
  }
  stroke([[-.24,-.87,0],[-.13,-1.07,0],[0,-1.16,0],[.13,-1.07,0],[.24,-.87,0]],.028,ink,racket);
  add(new THREE.CylinderGeometry(.023,.028,.88,12),ink,racket,[0,-1.58,0]);
  add(new THREE.CylinderGeometry(.068,.074,.65,20),red,racket,[0,-2.31,0]);
  for(let i=0;i<13;i++)add(new THREE.TorusGeometry(.071,.005,4,20),ink,racket,[0,-2.60+i*.046,0],[Math.PI/2,0,0]);
  return {shuttle,racket,dispose(){resources.forEach(r=>r.dispose());}};
}

// Each sample is deterministic: scrolling back restores the same flight phase.
export function shuttleFlight(progress) {
  const t=Math.max(0,Math.min(1,progress));
  return {
    position:[.72+Math.sin(t*Math.PI*1.4)*.24,.15+Math.sin(t*Math.PI)*.36,.45+Math.cos(t*Math.PI)*.18],
    rotation:[.30+t*.26,-t*Math.PI*3,-.64+t*.22],
  };
}

const ease=t=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
const blend=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*ease(t));
export function rallyPose(progress) {
  const t=Math.max(0,Math.min(1,progress));
  const rest=[-.65,-.10,-.15],windup=[-1.05,.35,-.25],contact=[.35,.10,.25],follow=[1.2,-.55,.4];
  const position=t<.18?blend(rest,windup,t/.18):t<.34?blend(windup,contact,(t-.18)/.16):t<.56?blend(contact,follow,(t-.34)/.22):blend(follow,rest,(t-.56)/.44);
  const rotation=t<.34?blend([-.22,.32,-.62],[.35,1.1,-.45],t/.34):blend([.35,1.1,-.45],[-.22,.32,-.62],(t-.34)/.66);
  // The cork's tip (local y=-.66) exactly meets the string bed at impact.
  const contactRotation=[0,0,-.7],tip=new THREE.Vector3(0,-.66,0).applyEuler(new THREE.Euler(...contactRotation));
  const shuttleContact=contact.map((v,i)=>v-tip.getComponent(i));
  const flight=Math.max(0,(t-.34)/.44);
  return {position,rotation,contact,contactRotation,shuttleContact,flight,approach:ease(t/.25),reset:t>=.78?ease((t-.78)/.22):null};
}
