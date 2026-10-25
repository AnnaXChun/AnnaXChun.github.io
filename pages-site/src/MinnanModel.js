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
  const foliageMotion={time:{value:0},strength:{value:0}};
  const washMaterial=(color,strength=.7,foliage=false)=>{
    const material=createInkMaterial(color,strength,foliage,foliage?foliageMotion:null);resources.add(material);return material;
  };
  const mat = {
    plaster: washMaterial(0xdcd8ca,.75), stone: washMaterial(0xb5b7af,.75),
    brick: washMaterial(0x985d49,.75), brickLight: washMaterial(0xb67d63,.65),
    roof: washMaterial(0x3c4841,.7), tile: washMaterial(0x59675b,.65),
    ridge: washMaterial(0xb7b7a6,.5), wood: washMaterial(0x514d3c,.55),
    dark: washMaterial(0x303d36,.6), leaf: washMaterial(0xffffff,.7,true),
    maple: washMaterial(0xffffff,.7,true), paving: washMaterial(0xe4dfd2,.95),
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
    const radial=radius>.1?16:radius>.04?8:5;
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
    const yAt=(x,z)=>eave+rise*Math.pow(Math.max(0,1-Math.abs(z)/(d/2)),1.6)+.24*Math.pow(Math.abs(z)/(d/2),7)+.26*Math.pow(Math.abs(x)/(w/2),10);
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
    // Individual overlapping barrel tiles: curved sections, not long tube rails.
    const tileCount=Math.floor(w/.18), rows=9;
    for(let col=0;col<tileCount;col++) for(const side of [-1,1]) for(let row=0;row<rows;row++) {
      const x=(col+.5)/tileCount*w-w/2, z0=side*(.025+row/rows*(d/2-.02));
      const z1=side*Math.min(d/2+.018,(row+1.13)/rows*(d/2));
      const v=[],idx=[];
      for(let longitudinal=0;longitudinal<=2;longitudinal++)for(let across=0;across<=5;across++) {
        const angle=across/5*Math.PI,xx=x+Math.cos(angle)*.082,z=z0+(z1-z0)*longitudinal/2;
        v.push(xx,yAt(xx,z)+.015+Math.sin(angle)*.045+(row%2)*.004,z);
      }
      for(let j=0;j<2;j++)for(let k=0;k<5;k++) {
        const a=j*6+k;idx.push(a,a+6,a+1,a+1,a+6,a+7);
      }
      // Opposite roof slopes need opposite winding.
      if(side>0)for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];
      const tile=new THREE.BufferGeometry();tile.setAttribute('position',new THREE.Float32BufferAttribute(v,3));tile.setIndex(idx);tile.computeVertexNormals();
      add(tile,random()>.82?mat.roof:mat.tile,[0,0,0],[0,0,0],matrix);
    }
    // Timber rafters and a second fascia make the overhang readable from the gate.
    for(const side of [-1,1]) {
      for(let i=0;i<Math.floor(w/.34);i++) {
        const x=-w/2+.18+i*.34;
        box(.055,.07,.36,x,yAt(x,side*d/2)-.09,side*(d/2-.14),mat.wood,matrix);
      }
      path(Array.from({length:25},(_,i)=>{const x=(i/24-.5)*w;return[x,yAt(x,side*d/2)-.11,side*(d/2-.05)];}),.032,mat.ridge,matrix);
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
        for(let n=-2;n<=2;n++) box(.022,bh-.08,.045,bx+n*bw/6,by,front+.075,mat.wood,M);
        for(const side of [-1,1])box(.028,bh-.025,.055,bx+side*(bw/2-.045),by,front+.10,mat.wood,M);
        for(const sy of [-1,1])box(bw-.06,.035,.055,bx,by+sy*(bh/2-.045),front+.10,mat.wood,M);
        for(let row=0;row<(door?4:2);row++)for(let col=0;col<3;col++) {
          const cx=bx+(col-1)*bw/3.6,cy=by-bh*.31+row*bh/(door?5:2.6);
          const diamond=[[cx,cy+.105,front+.085],[cx+.09,cy,front+.085],[cx,cy-.105,front+.085],[cx-.09,cy,front+.085],[cx,cy+.105,front+.085]];
          path(diamond,.012,mat.ridge,M);
        }
        const rows=door?5:3;
        for(let n=1;n<rows;n++) box(bw-.05,.025,.035,bx,by-bh/2+n*bh/rows,front+.05,mat.ridge,M);
        if(door) for(const s of [-1,1]) add(new THREE.TorusGeometry(.052,.012,5,12),mat.ridge,[bx+s*.11,.98,front+.08],[0,0,0],M);
      }
    }
    // Relief masonry is modelled brick by brick; recessed joints cast fine shadows.
    for(const side of [-1,1])for(let row=0;row<10;row++) {
      const yy=.65+row*.135;
      for(let b=0;b<Math.ceil(w/.32);b++) {
        const xx=-w/2+.16+b*.32+(row%2)*.16;
        if(xx>w/2-.1 || (gate&&Math.abs(xx)<.79))continue;
        let opening=false;
        if(side===1&&!gate)for(let i=0;i<bays;i++) {
          const bx=(i-(bays-1)/2)*(w/(bays+.15)),door=i===Math.floor(bays/2);
          if(Math.abs(xx-bx)<(door?.61:.5)&&Math.abs(yy-(door?1.02:1.27))<(door?.78:.51))opening=true;
        }
        if(!opening)box(.306,.122,.026+(random()*.008),xx,yy,side*(d/2+.008),random()>.83?mat.brickLight:mat.brick,M);
      }
    }
    // A carved band and terracotta diamond frieze sit below the layered eaves.
    box(w+.12,.055,.08,0,h-.22,d/2+.06,mat.ridge,M);
    for(let i=0;i<Math.floor(w/.36);i++) {
      const xx=-w/2+.2+i*.36;
      add(new THREE.BoxGeometry(.09,.09,.04),mat.brickLight,[xx,h-.31,d/2+.035],[0,0,Math.PI/4],M);
    }
    // Eave posts and a shaded veranda reveal real depth at the front of the hall.
    for(const px of (gate?[-w*.43,w*.43]:[-w*.43,-w*.16,w*.16,w*.43])) {
      if(gate&&px===0)continue;
      add(new THREE.CylinderGeometry(.065,.083,h-.08,24),mat.wood,[px,h/2,d/2+.36],[0,0,0],M);
      box(.19,.2,.19,px,.23,d/2+.36,mat.stone,M);
      add(new THREE.CylinderGeometry(.14,.12,.08,20),mat.ridge,[px,.36,d/2+.36],[0,0,0],M);
      // Curved knee braces reveal the joinery at the veranda.
      for(const sign of [-1,1])path([[px,h-.36,d/2+.36],[px+sign*.12,h-.18,d/2+.36],[px+sign*.30,h-.07,d/2+.36]],.035,mat.wood,M);
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
    for(let row=0;row<=6;row++)for(let col=0;col<=2;col++) {
      const t=row/6,u=col-1;
      vertices.push(u*width*Math.sin(Math.PI*t)*.5,t*length,Math.sin(t*Math.PI)*bend+u*u*width*.16);
    }
    for(let row=0;row<6;row++)for(let col=0;col<2;col++) {
      const a=row*3+col;indices.push(a,a+1,a+3,a+1,a+4,a+3);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  // Five lobes with recessed sinuses, small edge teeth and a gently cupped
  // surface. This silhouette is geometry, not a red oval or sprite.
  function mapleLeafGeometry() {
    const corners=[[0,0],[.10,.20],[.45,.28],[.25,.42],[.62,.82],[.26,.69],[.08,.97],[0,1.20],[-.08,.97],[-.26,.69],[-.62,.82],[-.25,.42],[-.45,.28],[-.10,.20]];
    const outline=[];
    for(let i=0;i<corners.length;i++) {
      const a=corners[i],b=corners[(i+1)%corners.length];outline.push(a);
      if(i<1||i>12)continue;
      const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
      for(const t of [.38,.48,.58]) {
        const tooth=t===.48?.018:0;
        outline.push([a[0]+dx*t+dy/length*tooth,a[1]+dy*t-dx/length*tooth]);
      }
    }
    const vertices=[],indices=[];
    for(const [x,y] of outline) {
      const t=y/1.2;
      vertices.push(x,t,Math.sin(t*Math.PI)*.20+Math.abs(x)*.05);
    }
    // Concave sinuses need proper triangulation; a centre fan folds across
    // these indentations and leaves intersecting/inverted triangles.
    for(const triangle of THREE.ShapeUtils.triangulateShape(outline.map(([x,y])=>new THREE.Vector2(x,y)),[])) {
      const [a,b,c]=triangle.map(i=>outline[i]);
      const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      if(Math.abs(area)>1e-8)indices.push(...triangle);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  function tree(x,z,size,maple=false) {
    const p=new THREE.Object3D();p.position.set(x,.08,z);p.scale.setScalar(size);p.updateMatrix();const M=p.matrix;
    const geometry=maple?mapleLeafGeometry():leafGeometry(1,1,.25),count=18*3*23;
    const motionData=new Float32Array(count*2);
    geometry.setAttribute('leafMotion',new THREE.InstancedBufferAttribute(motionData,2));
    const canopy=new THREE.InstancedMesh(geometry,maple?mat.maple:mat.leaf,count);
    canopy.name=maple?'left five-lobed vermilion maple':'right sparse green canopy';
    canopy.castShadow=true;canopy.receiveShadow=true;
    const leafTransform=new THREE.Object3D(),leafMatrix=new THREE.Matrix4(),color=new THREE.Color();
    const darkColor=new THREE.Color(maple?0x7b2733:0x435f50),lightColor=new THREE.Color(maple?0xc45836:0x819581);
    let leafIndex=0;
    path([[0,0,0],[.12,.8,.06],[-.08,1.7,.13],[.16,2.7,0]],.22,mat.wood,M,true);
    path([[.18,0,.14],[-.02,.6,.18],[.12,1.3,.08],[-.16,2.3,.02]],.13,mat.dark,M,true);
    for(let root=0;root<8;root++) {
      const a=root/8*Math.PI*2,r=.55+random()*.22;
      path([[.03,.65,.06],[Math.cos(a)*.16,.22,Math.sin(a)*.16],[Math.cos(a)*r,.035,Math.sin(a)*r]],.085,mat.wood,M,true);
    }
    for(let i=0;i<18;i++) {
      const a=i*2.3999,r=.65+random()*1.1,y=1.95+random()*1.2;
      const end=[Math.cos(a)*r,y,Math.sin(a)*r];
      path([[0,.8+i*.065,.06],[end[0]*.42,y*.8,end[2]*.38],end],.055,mat.wood,M,true);
      for(let branch=0;branch<3;branch++) {
        const tip=[end[0]+(random()-.5)*.75,end[1]+(random()-.4)*.5,end[2]+(random()-.5)*.75];
        path([end,[(end[0]+tip[0])*.5,tip[1]+.08,(end[2]+tip[2])*.5],tip],.018,mat.dark,M,true);
        for(let j=0;j<23;j++) {
          const theta=random()*Math.PI*2,rr=Math.sqrt(random())*.47;
          // Consume the same seeded samples as the old canopy, so trunks, branch
          // tips and following architecture retain their authored coordinates.
          const length=.13+random()*.18,width=.06+random()*.075,bend=.03+random()*.06,shade=random();
          leafTransform.position.set(tip[0]+Math.cos(theta)*rr,tip[1]+(random()-.5)*.4,tip[2]+Math.sin(theta)*rr);
          leafTransform.rotation.set(1.0+random()*1.5,random()*Math.PI*2,(random()-.5)*1.5);
          leafTransform.scale.set(maple?length*.72:width,length,bend/.25);leafTransform.updateMatrix();
          leafMatrix.multiplyMatrices(M,leafTransform.matrix);canopy.setMatrixAt(leafIndex,leafMatrix);
          canopy.setColorAt(leafIndex,color.copy(darkColor).lerp(lightColor,shade));
          motionData[leafIndex*2]=theta+tip[0]*1.7+tip[2]*2.1;motionData[leafIndex*2+1]=.65+.35*(length-.13)/.18;
          leafIndex++;
        }
      }
      if(i%4===0)path([end,[end[0]+.04,end[1]-.5,end[2]],[end[0]+.08,.7,end[2]+.03]],.009,mat.wood,M,true);
    }
    for(let i=0;i<10;i++) {const a=i/10*Math.PI*2;box(.3,.10,.23,Math.cos(a)*.56,.04,Math.sin(a)*.56,mat.plaster,M);}
    canopy.instanceMatrix.needsUpdate=true;canopy.instanceColor.needsUpdate=true;
    canopy.computeBoundingSphere();canopy.boundingSphere.radius+=.06;
    group.add(canopy);resources.add(canopy);resources.add(geometry);
  }
  tree(5.8,-2.1,1.10);
  tree(-5.35,2.5,.8,true);
  // Courtyard well and benches create useful foreground parallax.
  add(new THREE.CylinderGeometry(.37,.4,.36,32,1,true),mat.stone,[-1.35,.29,1.4]);
  add(new THREE.TorusGeometry(.39,.065,10,40),mat.ridge,[-1.35,.49,1.4],[Math.PI/2,0,0]);
  for(const x of [-2.5,2.5]) {
    box(1,.12,.35,x,.48,.65,mat.stone);
    for(const s of [-1,1])box(.16,.36,.27,x+s*.32,.26,.65,mat.stone);
  }
  // A scholar's work court: a real desk, open folio and a low archive beneath
  // the veranda. No freestanding diagram or billboard occupies the courtyard.
  box(3.5,.11,1.12,-.62,.79,-.65,mat.wood);
  for(const x of [-2.15,.91])for(const z of [-1.06,-.23]) {
    box(.10,.73,.10,x,.40,z,mat.wood);
    box(.14,.06,.14,x,.07,z,mat.dark);
  }
  box(3.12,.08,.06,-.62,.38,-.95,mat.wood);
  box(1.16,.035,.68,-1.58,.88,-.65,mat.dark);
  add(new THREE.BoxGeometry(1.20,.78,.045),mat.wood,[-1.58,1.29,-1.01],[-.10,0,0]);
  // The research folio rests on a sloping bookstand, facing the arriving camera.
  add(new THREE.BoxGeometry(1.38,.88,.065),mat.plaster,[.12,1.12,-.64],[-.85,0,0]);
  add(new THREE.BoxGeometry(.055,.90,.08),mat.vermilion,[-.535,1.12,-.635],[-.85,0,0]);
  for(let i=0;i<3;i++)box(.62,.055,.42,-1.96,.90+i*.055,-.26,mat.plaster);
  // Inkstone, brush rest and cinnabar seals share the desk with the laptop.
  add(new THREE.CylinderGeometry(.12,.13,.025,28),mat.dark,[.64,.867,-.33]);
  path([[.48,.88,-.46],[.77,.88,-.20],[.87,.88,-.12]],.014,mat.wood);
  box(.13,.12,.13,.80,.91,-.86,mat.vermilion);
  // A low open cabinet, tool volumes and case scrolls: labels are large book
  // titles on their actual objects, rather than a second page UI inside the model.
  box(1.65,.08,.64,2.25,.28,-.65,mat.wood);
  box(1.65,.08,.64,2.25,1.00,-.65,mat.wood);
  for(const x of [1.45,3.05])box(.08,.84,.64,x,.57,-.65,mat.wood);
  box(1.62,.66,.045,2.25,.64,-.96,mat.wood);
  box(1.48,.055,.6,2.25,.64,-.65,mat.wood);
  box(1.30,.24,.52,2.24,.46,-.61,mat.vermilion);
  box(1.28,.235,.50,2.24,.79,-.61,mat.plaster);
  for(let i=0;i<3;i++) {
    add(new THREE.CylinderGeometry(.065,.065,.58,20),mat.plaster,[1.87+i*.25,1.12,-.64],[Math.PI/2,0,0]);
    add(new THREE.TorusGeometry(.067,.013,6,20),mat.vermilion,[1.87+i*.25,1.12,-.64],[0,0,0]);
  }
  // Small carved lintel above the rear doorway belongs to the architecture.
  box(1.78,.42,.08,0,2.23,-1.59,mat.wood);
  const studioLabels=[
    {kind:'terminal',position:[-1.58,1.29,-.984],rotation:[-.10,0,0],size:[1.11,.69]},
    {kind:'research',position:[.12,1.146,-.611],rotation:[-.85,0,0],size:[1.28,.79]},
    {kind:'skills',position:[2.24,.46,-.343],rotation:[0,0,0],size:[1.20,.20]},
    {kind:'cases',position:[2.24,.79,-.354],rotation:[0,0,0],size:[1.18,.20]},
    {kind:'lintel',position:[0,2.23,-1.545],rotation:[0,0,0],size:[1.64,.32]},
  ];
  for(const [surface,geometries] of batches) {
    const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());resources.add(geometry);
    const mesh=new THREE.Mesh(geometry,surface);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    if(![mat.tile,mat.roof,mat.brickLight].includes(surface)) {
      const edges=new THREE.EdgesGeometry(geometry,38);resources.add(edges);
      const lines=new THREE.LineSegments(edges,ink);group.add(lines);
    }
  }
  const stats={meshes:0,vertices:0,leafInstances:0};
  group.traverse(node=>{if(node.isMesh){stats.meshes++;stats.vertices+=node.geometry.getAttribute('position').count;if(node.isInstancedMesh)stats.leafInstances+=node.count;}});
  const updateFoliage=(frame,still=false)=>{
    foliageMotion.time.value=Number.isFinite(frame)?frame/30:0;
    foliageMotion.strength.value=still?0:1;
  };
  return {group,stats,studioLabels,updateFoliage,dispose(){resources.forEach(resource=>resource.dispose());}};
}
