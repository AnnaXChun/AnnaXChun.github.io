import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createMapleLeafGeometry,createMapleLeafAsset} from '../src/MapleLeafAsset.js';

test('maple leaves have a closed orientable shell, finite volume and visible curl',()=>{
  const geometry=createMapleLeafGeometry(),p=geometry.attributes.position,indices=geometry.index.array;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),cross=new THREE.Vector3();
  const edges=new Map();let volume=0;
  for(const attribute of Object.values(geometry.attributes))assert.ok([...attribute.array].every(Number.isFinite));
  for(let i=0;i<indices.length;i+=3){
    const ids=[indices[i],indices[i+1],indices[i+2]];
    a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);
    volume+=a.dot(cross.crossVectors(b,c))/6;
    b.sub(a);c.sub(a);assert.ok(cross.crossVectors(b,c).lengthSq()>1e-16);
    for(let j=0;j<3;j++){
      const u=ids[j],v=ids[(j+1)%3],key=u<v?`${u}:${v}`:`${v}:${u}`;
      const edge=edges.get(key)??{count:0,winding:0};edge.count++;edge.winding+=u<v?1:-1;edges.set(key,edge);
    }
  }
  for(const edge of edges.values()){assert.equal(edge.count,2);assert.equal(edge.winding,0);}
  assert.ok(volume>.0001,'a folded zero-thickness plane is insufficient');
  const size=geometry.boundingBox.getSize(new THREE.Vector3());
  assert.ok(size.z/size.y>.12&&size.z/size.y<.4,'curl must remain visible at a grazing angle');
  assert.ok(indices.length/3<3000,'detailed instances retain a bounded geometry budget');
  geometry.dispose();
});

test('leaf ownership releases geometry and material once without a browser',()=>{
  const asset=createMapleLeafAsset({loadTextures:false});let disposed=0;
  asset.geometry.addEventListener('dispose',()=>disposed++);asset.material.addEventListener('dispose',()=>disposed++);
  assert.equal(asset.material.side,THREE.FrontSide);assert.equal(asset.material.alphaMap,null);
  asset.dispose();asset.dispose();assert.equal(disposed,2);
});
