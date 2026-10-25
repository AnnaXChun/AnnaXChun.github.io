import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Every visible strand, grommet and tape seam is geometry, including in macro shots.
export function createBadmintonModel() {
  const shuttle=new THREE.Group(),racket=new THREE.Group(),resources=new Set(),batches=new Map();
  const material=(color,roughness=.8,metalness=0)=>{
    const m=new THREE.MeshPhysicalMaterial({color,roughness,metalness});resources.add(m);return m;
  };
  const feather=material(0xf8f4e8,.72),quill=material(0xe2ddca,.65),cork=material(0xf0ecdf,.68);
  const ink=material(0x203c34,.32,.08),red=material(0x943d28,.61),string=material(0xe5ddc1,.4),rubber=material(0x17271f,.91);
  Object.assign(feather,{sheen:.22,sheenRoughness:.8,sheenColor:new THREE.Color(0xf6e9cf)});
  Object.assign(ink,{clearcoat:.85,clearcoatRoughness:.19});
  Object.assign(string,{clearcoat:.23,clearcoatRoughness:.4});
  const texture=(sample,repeat=[1,1])=>{
    const size=256,pixels=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
      const v=Math.max(0,Math.min(255,sample(x,y)));pixels.set([v,v,v,255],(y*size+x)*4);
    }
    const t=new THREE.DataTexture(pixels,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;resources.add(t);return t;
  };
  const hash=(x,y)=>((Math.imul(x+Math.imul(y,317)+91,1103515245)>>>8)%255)/255;
  // Competition shuttles use a leather-covered cork, not an exposed yellow cork ball.
  cork.bumpMap=texture((x,y)=>140+42*Math.sin(x*1.7+hash(x,y)*3)*Math.sin(y*1.2)+hash(x,y)*30,[3,2]);cork.bumpScale=.003;
  feather.bumpMap=texture((x,y)=>140+60*Math.sin(y*2.4+Math.abs(x-128)*.45)+hash(x,y)*14);feather.bumpScale=.0011;
  ink.map=texture((x,y)=>{
    const cellX=Math.floor(x/16),cellY=Math.floor(y/16),cross=(cellX+cellY)%4<2;
    return 165+45*Math.sin((cross?x:y)*Math.PI/16)+18*Math.sin((cross?y:x)*Math.PI/2);
  },[18,2]);ink.bumpMap=ink.map;ink.bumpScale=.0007;
  red.bumpMap=texture((x,y)=>170+55*hash(x,y),[3,5]);red.bumpScale=.002;
  feather.side=THREE.DoubleSide;
  function add(g,m,parent,name,position=[0,0,0],rotation=[0,0,0]) {
    const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);resources.add(g);return mesh;
  }
  function batch(g,m,parent,name) {
    const flat=g.index?g.toNonIndexed():g;if(flat!==g)g.dispose();
    if(!flat.attributes.uv)flat.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(flat.attributes.position.count*2),2));
    const key=name;if(!batches.has(key))batches.set(key,{material:m,parent,name,geometries:[]});batches.get(key).geometries.push(flat);
  }
  function tube(points,radius,segments=32,sides=6) {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,radius,sides,false);
  }
  const corkProfile=[[0,-.66],[.09,-.657],[.17,-.63],[.23,-.575],[.263,-.49],[.27,-.39],[.27,-.19],[.255,-.14],[0,-.14]].map(p=>new THREE.Vector2(...p));
  add(new THREE.LatheGeometry(corkProfile,72),cork,shuttle,'rounded-cork');
  add(new THREE.CylinderGeometry(.277,.278,.09,64),ink,shuttle,'woven-collar',[0,-.20,0]);
  for(const y of [-.251,-.154])add(new THREE.TorusGeometry(.278,.006,6,64),red,shuttle,'collar-seam',[0,y,0],[Math.PI/2,0,0]);
  add(new THREE.TorusGeometry(.268,.0028,5,96),quill,shuttle,'leather-fold',[0,-.38,0],[Math.PI/2,0,0]);
  const vanePoint=(t,u,seed=0)=>{
    const width=.195*Math.pow(Math.max(0,Math.sin(Math.PI*t)),.48)*(1+.22*u)*(1+.035*Math.sin(seed*7.3)+.012*Math.sin(t*110+seed)*Math.abs(u));
    return [u*width+.048*t*t,.20+(1.27+.023*Math.sin(seed*3.7))*t-.025*u*u,.34+.50*t+.065*Math.sin(t*Math.PI)+.026*u*u+(.025+.009*Math.cos(seed*2.7))*u];
  };
  for(let i=0;i<16;i++) {
    const transform=new THREE.Matrix4().makeRotationY(i/16*Math.PI*2+.025),positions=[],uv=[],indices=[],rows=48,cols=16;
    for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){positions.push(...vanePoint(row/rows,(col/cols-.5)*2,i));uv.push(col/cols,row/rows);}
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const a=row*(cols+1)+col;indices.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.applyMatrix4(transform);batch(g,feather,shuttle,'sixteen-curved-feathers');
    const spine=[ [0,-.14,.20],...Array.from({length:18},(_,j)=>vanePoint(j/17,0,i)) ];
    batch(tube(spine,.0075,48).applyMatrix4(transform),quill,shuttle,'feather-shafts');
    for(let j=0;j<34;j++)for(const side of [-1,1]) {
      const t=.06+j*.0255;
      const points=[vanePoint(t,0,i),vanePoint(t+.014,side*.5,i),vanePoint(t+.03,side*.98,i)].map(p=>[p[0],p[1],p[2]+.003]);
      batch(tube(points,.0011,6,4).applyMatrix4(transform),quill,shuttle,'feather-barbs');
    }
    for(const [y,r] of [[.28,.378],[.46,.45]]) {
      const knot=new THREE.TorusGeometry(.022,.005,5,12);knot.rotateX(Math.PI/2);knot.translate(0,y,r);knot.applyMatrix4(transform);batch(knot,quill,shuttle,'binding-knots');
    }
  }
  for(const [y,r] of [[.28,.378],[.46,.45]])for(const offset of [-.007,.007])add(new THREE.TorusGeometry(r,.006,6,96),quill,shuttle,'binding-thread',[0,y+offset,0],[Math.PI/2,0,0]);

  // Aerodynamic section: a flattened elliptical frame with an inset string channel.
  const framePositions=[],frameUV=[],frameIndices=[],segments=192,sides=16;
  for(let i=0;i<=segments;i++)for(let j=0;j<=sides;j++) {
    const a=i/segments*Math.PI*2,b=j/sides*Math.PI*2;
    framePositions.push(Math.sin(a)*(.72+Math.cos(b)*.034),Math.cos(a)*(.92+Math.cos(b)*.037),Math.sin(b)*.027);frameUV.push(i/segments,j/sides);
    if(i<segments&&j<sides){const n=i*(sides+1)+j;frameIndices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
  }
  const frame=new THREE.BufferGeometry();frame.setAttribute('position',new THREE.Float32BufferAttribute(framePositions,3));frame.setAttribute('uv',new THREE.Float32BufferAttribute(frameUV,2));frame.setIndex(frameIndices);frame.computeVertexNormals();add(frame,ink,racket,'aerodynamic-frame');
  for(const z of [-.014,.014]) {
    const points=Array.from({length:145},(_,i)=>{const a=i/144*Math.PI*2;return[Math.sin(a)*.705,Math.cos(a)*.905,z];});
    add(tube(points,.004,144,5),red,racket,'frame-pinstripe');
  }
  const grommet=(x,y)=>{
    const normal=new THREE.Vector3(x/(.679*.679),y/(.873*.873),0).normalize();
    const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
    const eyelet=new THREE.CylinderGeometry(.012,.013,.036,12);eyelet.applyQuaternion(rotation);eyelet.translate(x,y,0);batch(eyelet,rubber,racket,'string-grommets');
    const lip=new THREE.TorusGeometry(.010,.003,5,12);lip.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal));
    lip.translate(x-normal.x*.019,y-normal.y*.019,0);batch(lip,rubber,racket,'grommet-lips');
  };
  // Alternating depth at crossings creates a woven string bed, not a flat grid.
  const spacing=.073;
  for(let i=-8;i<=8;i++) {
    const x=i*spacing,y=.873*Math.sqrt(1-(x/.679)**2),points=[[x,-y,0]];
    grommet(x,y);grommet(x,-y);
    for(let j=-11;j<=11;j++)if(Math.abs(j*spacing)<y)points.push([x,j*spacing,((i+j)%2===0?1:-1)*.004]);
    points.push([x,y,0]);batch(tube(points,.0038,80,5),string,racket,'woven-string-bed');
  }
  for(let j=-11;j<=11;j++) {
    const y=j*spacing,x=.679*Math.sqrt(1-(y/.873)**2),points=[[-x,y,0]];
    grommet(x,y);grommet(-x,y);
    for(let i=-8;i<=8;i++)if(Math.abs(i*spacing)<x)points.push([i*spacing,y,((i+j)%2===0?-1:1)*.004]);
    points.push([x,y,0]);batch(tube(points,.0038,64,5),string,racket,'woven-string-bed');
  }
  add(tube([[-.20,-.89,0],[-.11,-1.07,0],[0,-1.15,0],[.11,-1.07,0],[.20,-.89,0]],.023,36,10),ink,racket,'integrated-throat');
  add(new THREE.CylinderGeometry(.019,.026,1.65,32),ink,racket,'tapered-shaft',[0,-1.94,0]);
  add(new THREE.CylinderGeometry(.031,.059,.16,32),rubber,racket,'shaft-collar',[0,-2.82,0]);
  const grip=new THREE.CylinderGeometry(.067,.079,.8,64,8);
  const gripPositions=grip.attributes.position;
  for(let i=0;i<gripPositions.count;i++){
    const x=gripPositions.getX(i),z=gripPositions.getZ(i),a=Math.atan2(x,z),sector=((a+Math.PI/8)%(Math.PI/4)+Math.PI/4)%(Math.PI/4)-Math.PI/8;
    const factor=Math.cos(Math.PI/8)/Math.cos(sector);gripPositions.setXYZ(i,x*factor,gripPositions.getY(i),z*factor);
  }
  grip.computeVertexNormals();add(grip,red,racket,'octagonal-grip',[0,-3.28,0],[0,Math.PI/8,0]);
  const helix=Array.from({length:600},(_,i)=>{
    const t=i/599,a=t*15*Math.PI*2,theta=Math.PI/2-a-Math.PI/8;
    const sector=((theta+Math.PI/8)%(Math.PI/4)+Math.PI/4)%(Math.PI/4)-Math.PI/8;
    const r=(.080-t*.012)*Math.cos(Math.PI/8)/Math.cos(sector);
    return[Math.cos(a)*r,-3.68+t*.8,Math.sin(a)*r];
  });
  add(tube(helix,.0028,600,5),red,racket,'helical-grip-seam');
  add(new THREE.CylinderGeometry(.08,.088,.045,32),rubber,racket,'bevelled-butt-cap',[0,-3.70,0]);
  for(const {material:m,parent,name,geometries} of batches.values()) {
    const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());add(merged,m,parent,name);
  }
  return {shuttle,racket,dispose(){resources.forEach(r=>r.dispose());}};
}
