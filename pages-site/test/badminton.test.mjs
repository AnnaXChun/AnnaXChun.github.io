import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Quaternion} from 'three';
import {readFileSync} from 'node:fs';
import {badmintonShot,LIFE_START,LIFE_END,IMPACT} from '../src/BadmintonMotion.js';

function readGlb(name) {
  const buffer=readFileSync(new URL(`../public/models/${name}.glb`,import.meta.url));
  assert.equal(buffer.toString('utf8',0,4),'glTF');assert.equal(buffer.readUInt32LE(8),buffer.length);
  const jsonLength=buffer.readUInt32LE(12),gltf=JSON.parse(buffer.toString('utf8',20,20+jsonLength));
  const binaryOffset=28+jsonLength;
  function positions(accessorIndex){
    const a=gltf.accessors[accessorIndex],v=gltf.bufferViews[a.bufferView];assert.equal(a.componentType,5126);assert.equal(a.type,'VEC3');
    const stride=v.byteStride||12,start=binaryOffset+(v.byteOffset||0)+(a.byteOffset||0);
    return Array.from({length:a.count},(_,i)=>[0,4,8].map(c=>buffer.readFloatLE(start+i*stride+c)));
  }
  return {gltf,positions,bytes:buffer.length};
}

test('imported models retain detailed finite geometry and self-contained material textures',()=>{
  let triangles=0,totalBytes=0;
  for(const name of ['kin-chen-racket','kyle1003-shuttlecock','libhand']) {
    const {gltf,positions,bytes}=readGlb(name);totalBytes+=bytes;
    assert.ok(!gltf.extensionsRequired?.includes('KHR_draco_mesh_compression'),'no remote decoder dependency');
    for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
      const values=positions(primitive.attributes.POSITION);
      assert.ok(values.flat().every(Number.isFinite),`${name} has finite geometry`);
      triangles+=(primitive.indices===undefined?values.length:gltf.accessors[primitive.indices].count)/3;
    }
    for(const image of gltf.images||[])assert.ok(image.bufferView!==undefined,'all model textures embedded');
    if(name!=='kyle1003-shuttlecock')assert.ok(gltf.images?.length>0,'skin and grip retain authored texture detail');
  }
  assert.ok(triangles>400000&&triangles<550000,'preserve real feather branches and authored anatomy within budget');
  assert.ok(totalBytes<19000000,'deferred assets stay under 19 MB');
});

test('authored racket string bed and shuttle cork align with the scroll contact contract',()=>{
  const {gltf,positions}=readGlb('kin-chen-racket');
  const net=gltf.meshes[gltf.nodes.find(n=>n.name==='KinChen_net')?.mesh];assert.ok(net,'authored string bed exists');
  const all=net.primitives.flatMap(p=>positions(p.attributes.POSITION));
  const min=[0,1,2].map(k=>Math.min(...all.map(v=>v[k]))),max=[0,1,2].map(k=>Math.max(...all.map(v=>v[k])));
  const bed=new Vector3(...min.map((v,k)=>(v+max[k])/2)).multiplyScalar(4.64).add(new Vector3(0,-.310535196*4.64,.011762467*4.64));
  assert.ok(bed.length()<.00001,'actual imported bed is at the motion pivot');
  const shuttle=readGlb('kyle1003-shuttlecock');
  const corkTip=Math.max(...shuttle.gltf.accessors.filter(a=>a.type==='VEC3'&&a.max).map(a=>a.max[1]));
  assert.ok(Math.abs(-corkTip*1.46+.07+.66)<.00001,'actual cork tip matches the -0.66 contact point');
});

test('scroll score meets the string bed and is continuous, deterministic and reversible',()=>{
  const impact=badmintonShot(LIFE_START+IMPACT*(LIFE_END-LIFE_START));
  const tip=new Vector3(0,-.66,0).multiplyScalar(impact.shuttleScale).applyQuaternion(new Quaternion().fromArray(impact.shuttleQuaternion)).add(new Vector3(...impact.shuttlePosition));
  assert.ok(tip.distanceTo(new Vector3(...impact.racketPosition))<1e-6,'cork tip meets string bed');
  const frames=Array.from({length:LIFE_END-LIFE_START+1},(_,i)=>LIFE_START+i),forward=frames.map(badmintonShot);
  for(let i=1;i<forward.length;i++) {
    const a=forward[i-1],b=forward[i];
    for(const key of ['racketPosition','shuttlePosition','cameraPosition'])assert.ok(new Vector3(...a[key]).distanceTo(new Vector3(...b[key]))<.12,`${key} has no reset jump`);
    assert.ok(new Quaternion().fromArray(a.shuttleQuaternion).angleTo(new Quaternion().fromArray(b.shuttleQuaternion))<.3,'orientation stays continuous');
  }
  assert.deepEqual(frames.toReversed().map(badmintonShot).toReversed(),forward,'backward scrolling restores exactly the same pose');
  assert.ok(forward.some(shot=>shot.shuttlePosition[2]>4),'shuttle flies towards lens in world space');
});
