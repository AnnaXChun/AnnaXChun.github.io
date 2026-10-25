import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Every visible strand, grommet and tape seam is geometry, including in macro shots.
export function createBadmintonModel() {
  const shuttle=new THREE.Group(),racket=new THREE.Group(),resources=new Set(),batches=new Map();
  const material=(color,roughness=.8,metalness=0)=>{
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness});resources.add(m);return m;
  };
  const feather=material(0xf4efdf,.92),quill=material(0xd8cfb5),cork=material(0xc7a87b,.95);
  const ink=material(0x1b302a,.27,.34),red=material(0xa34f3e,.46),string=material(0xd9cba8,.5),rubber=material(0x19231f,.85);
  const pores=new Uint8Array(128*128*4);
  for(let i=0;i<128*128;i++) {
    const n=((Math.imul(i+19,1103515245)>>>8)%255),v=n>227?65:170+n*.25;
    pores.set([v,v,v,255],i*4);
  }
  const corkBump=new THREE.DataTexture(pores,128,128);corkBump.wrapS=corkBump.wrapT=THREE.RepeatWrapping;corkBump.repeat.set(5,2);corkBump.needsUpdate=true;resources.add(corkBump);cork.bumpMap=corkBump;cork.bumpScale=.006;
  feather.side=THREE.DoubleSide;
  function add(g,m,parent,name,position=[0,0,0],rotation=[0,0,0]) {
    const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);resources.add(g);return mesh;
  }
  function batch(g,m,parent,name) {
    const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();flat.deleteAttribute('uv');
    const key=name;if(!batches.has(key))batches.set(key,{material:m,parent,name,geometries:[]});batches.get(key).geometries.push(flat);
  }
  function tube(points,radius,segments=32,sides=6) {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,radius,sides,false);
  }
  const corkProfile=[[0,-.66],[.09,-.657],[.17,-.63],[.23,-.575],[.263,-.49],[.27,-.39],[.27,-.19],[.255,-.14],[0,-.14]].map(p=>new THREE.Vector2(...p));
  add(new THREE.LatheGeometry(corkProfile,72),cork,shuttle,'rounded-cork');
  add(new THREE.CylinderGeometry(.277,.278,.09,64),ink,shuttle,'woven-collar',[0,-.20,0]);
  for(const y of [-.251,-.154])add(new THREE.TorusGeometry(.278,.006,6,64),red,shuttle,'collar-seam',[0,y,0],[Math.PI/2,0,0]);
  // Fine recessed-looking cork speckles stay dimensional instead of a blurry image filter.
  for(let i=0;i<120;i++) {
    const a=i*2.399963,y=-.48+((i*37)%113)/113*.29,r=.271;
    const g=new THREE.SphereGeometry(.0035+(i%3)*.001,4,3);g.scale(1,1,.35);g.rotateY(a);g.translate(Math.sin(a)*r,y,Math.cos(a)*r);batch(g,quill,shuttle,'cork-grain');
  }
  const vanePoint=(t,u,seed=0)=>{
    const width=.175*Math.pow(Math.sin(Math.PI*(.025+.94*t)),.42)*(1+.12*u)*(1+.035*Math.sin(seed*7.3)+.016*Math.sin(t*73+seed)*Math.abs(u));
    return [u*width+.035*t*t,.20+(1.23+.018*Math.sin(seed*3.7))*t-.05*u*u,.34+.50*t+.065*Math.sin(t*Math.PI)+.04*u*u+(.018+.006*Math.cos(seed*2.7))*u];
  };
  for(let i=0;i<16;i++) {
    const transform=new THREE.Matrix4().makeRotationY(i/16*Math.PI*2+.025),positions=[],indices=[],rows=32,cols=12;
    for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++)positions.push(...vanePoint(row/rows,(col/cols-.5)*2,i));
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const a=row*(cols+1)+col;indices.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();g.applyMatrix4(transform);batch(g,feather,shuttle,'sixteen-curved-feathers');
    const spine=[ [0,-.14,.20],...Array.from({length:18},(_,j)=>vanePoint(j/17,0,i)) ];
    batch(tube(spine,.0075,48).applyMatrix4(transform),quill,shuttle,'feather-shafts');
    for(let j=0;j<34;j++)for(const side of [-1,1]) {
      const t=.06+j*.0255;
      const points=[vanePoint(t,0,i),vanePoint(t+.014,side*.5,i),vanePoint(t+.03,side*.98,i)].map(p=>[p[0],p[1],p[2]+.003]);
      batch(tube(points,.0017,6,4).applyMatrix4(transform),quill,shuttle,'feather-barbs');
    }
    for(const [y,r] of [[.28,.378],[.46,.45]]) {
      const knot=new THREE.TorusGeometry(.022,.005,5,12);knot.rotateX(Math.PI/2);knot.translate(0,y,r);knot.applyMatrix4(transform);batch(knot,quill,shuttle,'binding-knots');
    }
  }
  for(const [y,r] of [[.28,.378],[.46,.45]])for(const offset of [-.007,.007])add(new THREE.TorusGeometry(r,.006,6,96),quill,shuttle,'binding-thread',[0,y+offset,0],[Math.PI/2,0,0]);

  // Aerodynamic section: a flattened elliptical frame with an inset string channel.
  const framePositions=[],frameIndices=[],segments=144,sides=12;
  for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++) {
    const a=i/segments*Math.PI*2,b=j/sides*Math.PI*2;
    framePositions.push(Math.sin(a)*(.72+Math.cos(b)*.034),Math.cos(a)*(.92+Math.cos(b)*.037),Math.sin(b)*.022);
    if(i<segments&&j<sides){const n=i*(sides+1)+j;frameIndices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
  }
  const frame=new THREE.BufferGeometry();frame.setAttribute('position',new THREE.Float32BufferAttribute(framePositions,3));frame.setIndex(frameIndices);frame.computeVertexNormals();add(frame,ink,racket,'aerodynamic-frame');
  for(const z of [-.014,.014]) {
    const points=Array.from({length:145},(_,i)=>{const a=i/144*Math.PI*2;return[Math.sin(a)*.705,Math.cos(a)*.905,z];});
    add(tube(points,.004,144,5),red,racket,'frame-pinstripe');
  }
  for(let i=0;i<76;i++) {
    const a=i/76*Math.PI*2;
    const g=new THREE.CylinderGeometry(.013,.013,.024,8);g.rotateZ(-a);g.translate(Math.sin(a)*.687,Math.cos(a)*.887,0);batch(g,rubber,racket,'string-grommets');
  }
  // Alternating depth at crossings creates a woven string bed, not a flat grid.
  const spacing=.073;
  for(let i=-8;i<=8;i++) {
    const x=i*spacing,y=.873*Math.sqrt(1-(x/.679)**2),points=[[x,-y,0]];
    for(let j=-11;j<=11;j++)if(Math.abs(j*spacing)<y)points.push([x,j*spacing,((i+j)%2===0?1:-1)*.004]);
    points.push([x,y,0]);batch(tube(points,.0038,80,5),string,racket,'woven-string-bed');
  }
  for(let j=-11;j<=11;j++) {
    const y=j*spacing,x=.679*Math.sqrt(1-(y/.873)**2),points=[[-x,y,0]];
    for(let i=-8;i<=8;i++)if(Math.abs(i*spacing)<x)points.push([i*spacing,y,((i+j)%2===0?-1:1)*.004]);
    points.push([x,y,0]);batch(tube(points,.0038,64,5),string,racket,'woven-string-bed');
  }
  add(tube([[-.20,-.89,0],[-.11,-1.07,0],[0,-1.15,0],[.11,-1.07,0],[.20,-.89,0]],.023,36,10),ink,racket,'integrated-throat');
  add(new THREE.CylinderGeometry(.019,.027,.89,24),ink,racket,'tapered-shaft',[0,-1.58,0]);
  add(new THREE.CylinderGeometry(.031,.034,.10,24),red,racket,'shaft-collar',[0,-1.99,0]);
  add(new THREE.CylinderGeometry(.067,.075,.64,8),red,racket,'octagonal-grip',[0,-2.32,0],[0,Math.PI/8,0]);
  const helix=Array.from({length:460},(_,i)=>{const t=i/459,a=t*12*Math.PI*2,r=.076-t*.008;return[Math.cos(a)*r,-2.64+t*.64,Math.sin(a)*r];});
  add(tube(helix,.004,480,5),rubber,racket,'helical-grip-seam');
  add(new THREE.CylinderGeometry(.077,.086,.04,8),rubber,racket,'bevelled-butt-cap',[0,-2.66,0],[0,Math.PI/8,0]);
  for(const {material:m,parent,name,geometries} of batches.values()) {
    const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());add(merged,m,parent,name);
  }
  return {shuttle,racket,dispose(){resources.forEach(r=>r.dispose());}};
}
