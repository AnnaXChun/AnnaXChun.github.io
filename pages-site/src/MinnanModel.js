import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createInkMaterial,createInkLines} from './InkMaterial.js';

// All architecture is modelled in world space. No painting planes or image depth maps.
export function createMinnanCourtyard() {
  const group = new THREE.Group();
  group.name = 'Minnan courtyard / red brick, granite and swallowtail ridges';
  const batches = new Map(), resources = new Set();
  let seed = 317;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const ink=createInkLines();
  resources.add(ink);
  const washMaterial=(color,strength=.7,foliage=false)=>{
    const material=createInkMaterial(color,strength,foliage);resources.add(material);return material;
  };
  const mat = {
    plaster: washMaterial(0xdcd8ca,.75), stone: washMaterial(0xb5b7af,.75),
    brick: washMaterial(0xa76c5b,.95), brickLight: washMaterial(0xd3ad97,.8),
    roof: washMaterial(0x535c57,.9), tile: washMaterial(0x777f75,.9),
    ridge: washMaterial(0xb0b1a3,.7), wood: washMaterial(0x55594c,.8),
    dark: washMaterial(0x303d36,.6), leaf: washMaterial(0x435f50,.7,true),
    paleLeaf: washMaterial(0x819581,.8,true), paving: washMaterial(0xe4dfd2,.95),
    vermilion: washMaterial(0xa1503b,.65),
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
    const radial=radius>.1?9:5;
    const geometry = new THREE.TubeGeometry(curve,steps,radius,radial,false);
    if(tapered) {
      const positions=geometry.getAttribute('position');
      for(let i=0;i<=steps;i++) {
        const center=curve.getPointAt(i/steps), factor=1-i/steps*.93;
        for(let j=0;j<=radial;j++) {
          const idx=i*(radial+1)+j, p=new THREE.Vector3().fromBufferAttribute(positions,idx).sub(center).multiplyScalar(factor).add(center);
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
      if(col%7===3)continue;
      const x=(col/tileCount-.5)*w+(random()-.5)*.025;
      for(const side of [-1,1]) {
        const points=Array.from({length:13},(_,j)=>{const z=side*(.03+j/12*(d/2-.03));return [x,yAt(x,z)+.025,z];});
        path(points,.015+random()*.013,col%3===0?mat.roof:mat.tile,matrix);
      }
    }
    // Fine transverse courses remain geometry, rather than a texture on a flat roof.
    for(const side of [-1,1]) for(let row=2;row<8;row+=2) {
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
        if(row%2===0) {
          if(gate)for(const s of [-1,1])box((w-1.5)/2,.008,.008,s*(w+1.5)/4,yy,side*(d/2+.008),mat.brickLight,M);
          else box(w*.84,.008,.008,0,yy,side*(d/2+.008),mat.brickLight,M);
        }
        for(let b=0;b<Math.floor(w/.42);b++) {
          const xx=-w/2+.14+b*.42+(row%2)*.21;
          if(random()>.55 && xx<w/2-.03 && !(gate&&Math.abs(xx)<.8)) box(.009,.11,.009,xx,yy+.085,side*(d/2+.008),mat.brickLight,M);
        }
        box(.012,.012,d,side*(w/2+.008),yy,0,mat.brickLight,M);
      }
    }
    // Eave posts and a shaded veranda reveal real depth at the front of the hall.
    for(const px of [-w*.43,0,w*.43]) {
      if(gate&&px===0)continue;
      add(new THREE.CylinderGeometry(.065,.083,h-.08,16),mat.wood,[px,h/2,d/2+.36],[0,0,0],M);
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
    if((Math.abs(x)>4.5||Math.abs(z)>3.9)&&random()>.45)continue;
    box(.634,.022,.641,x,.023+(random()-.5)*.006,z,random()>.08?mat.paving:mat.plaster);
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

  // Small curved, smooth-shaded leaves; each is a bent surface in 3D, not
  // a faceted canopy ball or a camera-facing image. Gaps let paper show through.
  function leafGeometry(length,width,bend) {
    const vertices=[],indices=[];
    for(let row=0;row<=4;row++)for(let col=0;col<=2;col++) {
      const t=row/4,u=col-1;
      vertices.push(u*width*Math.sin(Math.PI*t)*.5,t*length,Math.sin(t*Math.PI)*bend+u*u*width*.16);
    }
    for(let row=0;row<4;row++)for(let col=0;col<2;col++) {
      const a=row*3+col;indices.push(a,a+1,a+3,a+1,a+4,a+3);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  function banyan(x,z,size) {
    const p=new THREE.Object3D();p.position.set(x,.08,z);p.scale.setScalar(size);p.updateMatrix();const M=p.matrix;
    path([[0,0,0],[.12,.8,.06],[-.08,1.7,.13],[.16,2.7,0]],.20,mat.wood,M,true);
    for(let i=0;i<18;i++) {
      const a=i*2.3999,r=.65+random()*1.1,y=1.95+random()*1.2;
      const end=[Math.cos(a)*r,y,Math.sin(a)*r];
      path([[0,.8+i*.065,.06],[end[0]*.42,y*.8,end[2]*.38],end],.055,mat.wood,M,true);
      for(let branch=0;branch<3;branch++) {
        const tip=[end[0]+(random()-.5)*.75,end[1]+(random()-.4)*.5,end[2]+(random()-.5)*.75];
        path([end,[(end[0]+tip[0])*.5,tip[1]+.08,(end[2]+tip[2])*.5],tip],.018,mat.dark,M,true);
        for(let j=0;j<23;j++) {
          const theta=random()*Math.PI*2,rr=Math.sqrt(random())*.47;
          add(leafGeometry(.15+random()*.23,.075+random()*.09,.025+random()*.05),random()>.52?mat.paleLeaf:mat.leaf,
            [tip[0]+Math.cos(theta)*rr,tip[1]+(random()-.5)*.4,tip[2]+Math.sin(theta)*rr],
            [1.0+random()*1.5,random()*Math.PI*2,(random()-.5)*1.5],M);
        }
      }
      if(i%4===0)path([end,[end[0]+.04,end[1]-.5,end[2]],[end[0]+.08,.7,end[2]+.03]],.009,mat.wood,M,true);
    }
    for(let i=0;i<10;i++) {const a=i/10*Math.PI*2;box(.3,.10,.23,Math.cos(a)*.56,.04,Math.sin(a)*.56,mat.plaster,M);}
  }
  banyan(5.8,-2.1,1.10);
  banyan(-5.35,2.5,.8);
  // Courtyard well and benches create useful foreground parallax.
  add(new THREE.CylinderGeometry(.37,.4,.36,12,1,true),mat.stone,[-1.35,.29,1.4]);
  add(new THREE.TorusGeometry(.39,.065,6,18),mat.ridge,[-1.35,.49,1.4],[Math.PI/2,0,0]);
  for(const x of [-2.5,2.5]) {
    box(1,.12,.35,x,.48,.65,mat.stone);
    for(const s of [-1,1])box(.16,.36,.27,x+s*.32,.26,.65,mat.stone);
  }
  // A real workbench and freestanding paper workflow board connect the courtyard
  // to the portfolio. Everything stays outside the central gate/camera corridor.
  box(2.65,.09,1,-1.75,.76,-.28,mat.wood);
  for(const x of [-2.88,-.62])for(const z of [-.64,.08])box(.075,.68,.075,x,.39,z,mat.wood);
  box(.86,.035,.58,-2.25,.83,-.40,mat.dark);
  add(new THREE.BoxGeometry(.90,.60,.035),mat.wood,[-2.25,1.14,-.67],[-.14,0,0]);
  box(1.10,.035,.72,-1.03,.835,-.23,mat.plaster);
  box(.045,.045,.74,-1.03,.86,-.23,mat.vermilion);
  box(.65,.06,.38,-2.40,.85,.02,mat.plaster);
  box(2.18,1.60,.055,1.55,1.65,-.95,mat.wood);
  box(2.08,1.50,.025,1.55,1.65,-.91,mat.plaster);
  for(const x of [.57,2.53])box(.055,1.8,.055,x,.98,-.96,mat.wood);
  const studioLabels=[
    {kind:'agent',position:[1.55,1.65,-.891],rotation:[0,0,0],size:[2.03,1.45]},
    {kind:'terminal',position:[-2.25,1.14,-.646],rotation:[-.14,0,0],size:[.83,.53]},
    {kind:'research',position:[-1.03,.858,-.23],rotation:[-Math.PI/2,0,0],size:[1.04,.66]},
  ];
  const nodes=[[-.67,.94,.02],[-.91,1.02,.1],[-1.12,.94,.04]];
  for(const node of nodes)add(new THREE.SphereGeometry(.043,12,8),mat.vermilion,node);
  path(nodes,.009,mat.wood);
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
  return {group,stats,studioLabels,dispose(){resources.forEach(resource=>resource.dispose());}};
}
