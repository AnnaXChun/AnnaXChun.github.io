import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// All architecture is modelled in world space. No painting planes or image depth maps.
export function createMinnanCourtyard() {
  const group = new THREE.Group();
  group.name = 'Minnan courtyard / red brick, granite and swallowtail ridges';
  const batches = new Map(), resources = new Set();
  let seed = 317;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const ink = new THREE.LineBasicMaterial({color: 0x383c35, transparent: true, opacity: .5});
  resources.add(ink);

  function washMaterial(color, amount = .12) {
    const mat = new THREE.MeshStandardMaterial({color, roughness: 1, metalness: 0});
    mat.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vInkPosition;');
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvInkPosition = position;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
        varying vec3 vInkPosition;
        float inkHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
        float inkNoise(vec3 p) {
          vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(inkHash(i),inkHash(i+vec3(1,0,0)),f.x),mix(inkHash(i+vec3(0,1,0)),inkHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(inkHash(i+vec3(0,0,1)),inkHash(i+vec3(1,0,1)),f.x),mix(inkHash(i+vec3(0,1,1)),inkHash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }`);
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float wash = inkNoise(vInkPosition*3.8)*.5 + inkNoise(vInkPosition*vec3(37.0,6.0,29.0))*.35 + inkNoise(vInkPosition*160.0)*.15;
        diffuseColor.rgb *= 1.0 + (wash-.5)*${amount.toFixed(3)}*2.0;
        float grain=inkHash(floor(vInkPosition*280.0));
        diffuseColor.rgb *= .94 + grain*.12;
      `);
    };
    mat.customProgramCacheKey = () => `minnan-wash-${amount}`;
    resources.add(mat);
    return mat;
  }
  const mat = {
    plaster: washMaterial(0xe1daca, .13), stone: washMaterial(0xbab7a7, .22),
    brick: washMaterial(0xa46550, .25), brickLight: washMaterial(0xba8367, .22),
    roof: washMaterial(0x50534c, .45), tile: washMaterial(0x72756b, .42),
    ridge: washMaterial(0xb9b4a1, .18), wood: washMaterial(0x514a3b, .16),
    dark: washMaterial(0x363b33, .22), leaf: washMaterial(0x51594b, .65),
    paleLeaf: washMaterial(0x7c8370, .6), paving: washMaterial(0xd3cdbd, .25),
  };
  const transform = new THREE.Object3D();
  function add(geometry, material, position = [0,0,0], rotation = [0,0,0], parentMatrix = null) {
    transform.position.set(...position); transform.rotation.set(...rotation); transform.scale.set(1,1,1); transform.updateMatrix();
    geometry.applyMatrix4(transform.matrix);
    if (parentMatrix) geometry.applyMatrix4(parentMatrix);
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    if (flat !== geometry) geometry.dispose();
    // Homogeneous attributes keep the static mesh batches compatible.
    flat.deleteAttribute('uv'); flat.deleteAttribute('color');
    if (!flat.getAttribute('normal')) flat.computeVertexNormals();
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(flat);
  }
  function box(w,h,d,x,y,z,m=mat.plaster,matrix=null) {
    add(new THREE.BoxGeometry(w,h,d),m,[x,y,z],[0,0,0],matrix);
  }
  function path(points, radius, m, matrix=null, tapered=false) {
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const steps = Math.max(8, points.length*2);
    const geometry = new THREE.TubeGeometry(curve,steps,radius,5,false);
    if(tapered) {
      const positions=geometry.getAttribute('position');
      for(let i=0;i<=steps;i++) {
        const center=curve.getPointAt(i/steps), factor=1-i/steps*.93;
        for(let j=0;j<=5;j++) {
          const idx=i*6+j, p=new THREE.Vector3().fromBufferAttribute(positions,idx).sub(center).multiplyScalar(factor).add(center);
          positions.setXYZ(idx,p.x,p.y,p.z);
        }
      }
      geometry.computeVertexNormals();
    }
    add(geometry,m,[0,0,0],[0,0,0],matrix);
  }

  function roof(w,d,eave,rise,matrix) {
    const yAt=(x,z)=>eave+rise*Math.pow(1-Math.abs(z)/(d/2),1.6)+.24*Math.pow(Math.abs(z)/(d/2),7)+.26*Math.pow(Math.abs(x)/(w/2),10);
    const positions=[], indices=[], nx=48,nz=28;
    for(let i=0;i<=nx;i++) for(let j=0;j<=nz;j++) {
      const x=(i/nx-.5)*w, z=(j/nz-.5)*d;
      positions.push(x,yAt(x,z),z);
    }
    for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) {
      const a=i*(nz+1)+j,b=a+nz+1;
      indices.push(a,a+1,b,b,a+1,b+1);
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geo.setIndex(indices); geo.computeVertexNormals();
    const underside=geo.clone(); underside.translate(0,-.075,0);
    add(geo,mat.roof,[0,0,0],[0,0,0],matrix);
    // Explicit reverse winding: the eaves have thickness when viewed from below.
    const reverse=underside.index.array;
    for(let i=0;i<reverse.length;i+=3) [reverse[i+1],reverse[i+2]]=[reverse[i+2],reverse[i+1]];
    underside.computeVertexNormals(); add(underside,mat.dark,[0,0,0],[0,0,0],matrix);
    const tileCount=Math.floor(w/.19);
    for(let col=0;col<=tileCount;col++) {
      const x=(col/tileCount-.5)*w;
      for(const side of [-1,1]) {
        const points=Array.from({length:13},(_,j)=>{const z=side*(.03+j/12*(d/2-.03));return [x,yAt(x,z)+.025,z];});
        path(points,.036,col%3===0?mat.roof:mat.tile,matrix);
      }
    }
    // Fine transverse courses remain geometry, rather than a texture on a flat roof.
    for(const side of [-1,1]) for(let row=1;row<8;row++) {
      const z=side*d/2*row/8;
      path(Array.from({length:17},(_,i)=>{const x=(i/16-.5)*w;return[x,yAt(x,z)+.033,z];}),.012,mat.roof,matrix);
    }
    for(const side of [-1,1]) {
      const z=side*d/2;
      path(Array.from({length:25},(_,i)=>{const x=(i/24-.5)*w;return[x,yAt(x,z),z];}),.075,mat.dark,matrix);
      const x=side*w/2;
      path(Array.from({length:21},(_,i)=>{const z=(i/20-.5)*d;return[x,yAt(x,z)+.07,z];}),.085,mat.ridge,matrix);
    }
    const ridgeY=eave+rise;
    path([[-w*.5,ridgeY+.3,0],[-w*.3,ridgeY+.12,0],[0,ridgeY+.10,0],[w*.3,ridgeY+.12,0],[w*.5,ridgeY+.3,0]],.11,mat.ridge,matrix);
    // Forked swallowtail ridge tips are split in depth as well as rising in height.
    for(const sign of [-1,1]) for(const fork of [-1,1]) {
      path([[sign*w*.39,ridgeY+.13,0],[sign*w*.5,ridgeY+.32,fork*.08],[sign*(w*.5+.28),ridgeY+.64,fork*.19],[sign*(w*.5+.34),ridgeY+1.02,fork*.29]],.095,mat.ridge,matrix,true);
    }
  }

  function hall({x,z,w,d,h=2.05,turn=0,gate=false}) {
    const parent=new THREE.Object3D(); parent.position.set(x,.16,z);parent.rotation.y=turn;parent.updateMatrix();const M=parent.matrix;
    box(w+.28,.18,d+.3,0,.02,0,mat.stone,M);
    if(!gate)box(w,.38,d,0,.3,0,mat.stone,M);
    // A gate leaves an actual opening through the building, including its rear wall.
    if(gate) {
      const side=(w-1.5)/2;
      for(const s of [-1,1]) {
        const sx=s*(w/2-side/2);
        box(side,h-.49,d,sx,.49+(h-.49)/2,0,mat.brick,M);
        box(side,.38,d,sx,.3,0,mat.stone,M);
        box(side+.06,.13,d+.06,sx,.53,0,mat.plaster,M);
      }
      box(1.5,.42,d,0,h-.2,0,mat.brick,M);
    } else box(w,h-.49,d,0,.49+(h-.49)/2,0,mat.brick,M);
    if(!gate)box(w+.06,.13,d+.06,0,.53,0,mat.plaster,M);
    box(w+.10,.12,d+.08,0,h-.1,0,mat.plaster,M);
    // Recessed timber bays, pale granite surrounds and individually modelled latticework.
    const bays=gate?1:Math.max(3,Math.floor(w/1.6));
    for(let i=0;i<bays;i++) {
      const bx=(i-(bays-1)/2)*(w/(bays+.15)), door=i===Math.floor(bays/2), bw=gate?1.5:door?.95:.74;
      const by=door?1.02:1.27,bh=door?1.4:.85,front=d/2+.018;
      if(!gate) box(bw,bh,.04,bx,by,front,door?mat.wood:mat.dark,M);
      for(const s of [-1,1]) box(.08,bh+.16,.14,bx+s*(bw/2+.04),by,front+.02,mat.plaster,M);
      for(const sy of [-1,1]) box(bw+.2,.09,.14,bx,by+sy*(bh/2+.04),front+.02,mat.plaster,M);
      if(!gate) {
        for(let n=-2;n<=2;n++) box(.025,bh-.08,.035,bx+n*bw/6,by,front+.05,mat.ridge,M);
        const rows=door?5:3;
        for(let n=1;n<rows;n++) box(bw-.05,.025,.035,bx,by-bh/2+n*bh/rows,front+.05,mat.ridge,M);
        if(door) for(const s of [-1,1]) add(new THREE.TorusGeometry(.052,.012,5,12),mat.ridge,[bx+s*.11,.98,front+.08],[0,0,0],M);
      }
    }
    // Thin mortar joints on every facade; staggered bricks keep the red walls readable.
    for(let row=0;row<7;row++) {
      const yy=.64+row*.17;
      for(const side of [-1,1]) {
        if(gate)for(const s of [-1,1])box((w-1.5)/2,.012,.012,s*(w+1.5)/4,yy,side*(d/2+.008),mat.brickLight,M);
        else box(w,.012,.012,0,yy,side*(d/2+.008),mat.brickLight,M);
        for(let b=0;b<Math.floor(w/.42);b++) {
          const xx=-w/2+.14+b*.42+(row%2)*.21;
          if(xx<w/2-.03 && !(gate&&Math.abs(xx)<.8)) box(.012,.17,.012,xx,yy+.085,side*(d/2+.008),mat.brickLight,M);
        }
        box(.012,.012,d,side*(w/2+.008),yy,0,mat.brickLight,M);
      }
    }
    // Eave posts and a shaded veranda reveal real depth at the front of the hall.
    for(const px of [-w*.43,0,w*.43]) {
      if(gate&&px===0)continue;
      add(new THREE.CylinderGeometry(.065,.083,h-.08,8),mat.wood,[px,h/2,d/2+.36],[0,0,0],M);
      box(.19,.2,.19,px,.23,d/2+.36,mat.stone,M);
    }
    box(w+.25,.16,.16,0,h+.03,d/2+.36,mat.wood,M);
    // Sloped gable infill is a solid volume beneath the curved roof.
    const shape=new THREE.Shape();shape.moveTo(-d/2,0);shape.lineTo(d/2,0);
    for(let j=20;j>=0;j--) {const zz=(j/20-.5)*d;shape.lineTo(zz,.94*Math.pow(1-Math.abs(zz)/(d/2),1.6));}
    shape.closePath();
    const gable=new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false,steps:1});
    add(gable,mat.plaster,[-w/2,h,0],[0,Math.PI/2,0],M);
    roof(w+.65,d+.95,h+.08,.98,M);
    for(let i=0;i<3;i++) box(gate?1.75:w*.56,.075*(i+1),.24,0,-.05+.075*(i+1)/2,d/2+.65+(2-i)*.22,mat.stone,M);
  }

  // The stone court is flush with the paper ground, with no display plinth.
  for(let ix=-8;ix<=8;ix++) for(let iz=-7;iz<=7;iz++) {
    const x=ix*.65+(iz%2)*.15,z=iz*.66;
    if(Math.abs(x)>5.25||Math.abs(z)>4.65) continue;
    box(.625,.045,.63,x,.035+(random()-.5)*.014,z,random()>.18?mat.paving:mat.stone);
  }
  hall({x:0,z:-2.9,w:7.2,d:2.5,h:2.22});
  hall({x:-4.25,z:.1,w:4.8,d:1.8,h:1.65,turn:Math.PI/2});
  hall({x:4.25,z:.1,w:4.8,d:1.8,h:1.65,turn:-Math.PI/2});
  hall({x:0,z:3.65,w:3.1,d:1.25,h:1.65,gate:true});
  for(const s of [-1,1]) {
    box(2.35,1.02,.24,s*2.9,.64,3.64,mat.brick);
    box(2.46,.10,.34,s*2.9,1.2,3.64,mat.ridge);
    box(2.4,.20,.3,s*2.9,.24,3.64,mat.stone);
  }

  function banyan(x,z,size) {
    const p=new THREE.Object3D();p.position.set(x,.08,z);p.scale.setScalar(size);p.updateMatrix();const M=p.matrix;
    path([[0,0,0],[.12,1.1,.06],[-.04,2.1,.12],[.22,3.1,0]],.22,mat.wood,M,true);
    const crowns=[];
    for(let i=0;i<14;i++) {
      const a=i*2.3999,r=.7+random()*.9,y=2.15+random()*1.15;
      const end=[Math.cos(a)*r,y,Math.sin(a)*r];crowns.push(end);
      path([[0,1.1+i*.07,.06],[end[0]*.4,y*.8,end[2]*.4],end],.07,mat.wood,M,true);
    }
    for(const crown of crowns) for(let i=0;i<40;i++) {
      const geo=new THREE.IcosahedronGeometry(.10+random()*.14,0);
      geo.scale(1,.42+random()*.4,1);
      add(geo,random()>.7?mat.paleLeaf:mat.leaf,[crown[0]+(random()-.5)*1.2,crown[1]+(random()-.4)*.7,crown[2]+(random()-.5)*1.1],[random(),random(),random()],M);
    }
    // Stone ring at the roots.
    for(let i=0;i<10;i++) {const a=i/10*Math.PI*2;box(.3,.16,.23,Math.cos(a)*.56,.07,Math.sin(a)*.56,mat.stone,M);}
  }
  banyan(5.8,-2.1,1.18);
  banyan(-5.35,2.5,.8);
  // Courtyard well and benches create useful foreground parallax.
  add(new THREE.CylinderGeometry(.37,.4,.36,12,1,true),mat.stone,[-1.35,.29,1.4]);
  add(new THREE.TorusGeometry(.39,.065,6,18),mat.ridge,[-1.35,.49,1.4],[Math.PI/2,0,0]);
  for(const x of [-2.5,2.5]) {
    box(1,.12,.35,x,.48,.65,mat.stone);
    for(const s of [-1,1])box(.16,.36,.27,x+s*.32,.26,.65,mat.stone);
  }
  for(const [surface,geometries] of batches) {
    const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());resources.add(geometry);
    const mesh=new THREE.Mesh(geometry,surface);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    if(![mat.leaf,mat.paleLeaf,mat.tile,mat.roof,mat.brickLight].includes(surface)) {
      const edges=new THREE.EdgesGeometry(geometry,38);resources.add(edges);
      const lines=new THREE.LineSegments(edges,ink);group.add(lines);
    }
  }
  const stats={meshes:0,vertices:0};
  group.traverse(node=>{if(node.isMesh){stats.meshes++;stats.vertices+=node.geometry.getAttribute('position').count;}});
  return {group,stats,dispose(){resources.forEach(resource=>resource.dispose());}};
}
