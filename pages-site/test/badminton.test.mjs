import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3,Euler} from 'three';
import {createBadmintonModel,rallyPose,shuttleFlight} from '../src/BadmintonModel.js';

test('shuttle and racket are finite 3D geometry with an open feather skirt',()=>{
  const model=createBadmintonModel();
  try {
    for(const group of [model.shuttle,model.racket]) {
      const size=new Box3().setFromObject(group).getSize(new Vector3());
      assert.ok(size.x>1&&size.y>1&&size.z>.05);
      group.traverse(node=>{if(node.isMesh)for(const name of ['position','normal'])assert.ok(Array.from(node.geometry.attributes[name].array).every(Number.isFinite));});
    }
    assert.ok(model.shuttle.children.some(node=>node.geometry?.type==='LatheGeometry'),'cork has a rounded, modelled profile');
    assert.ok(model.racket.children.length>30,'racket string bed is open geometry');
  }finally{model.dispose();}
});

test('rally meets the string bed before the shuttle flies out and restores its pose',()=>{
  const impact=rallyPose(.34);
  const tip=new Vector3(0,-.66,0).applyEuler(new Euler(...impact.contactRotation)).add(new Vector3(...impact.shuttleContact));
  assert.ok(tip.distanceTo(new Vector3(...impact.position))<1e-6,'the cork tip must meet the racket, not an unrelated screen position');
  assert.equal(rallyPose(.2).flight,0);assert.ok(rallyPose(.6).flight>0);
  assert.ok(new Vector3(...rallyPose(1).position).distanceTo(new Vector3(...rallyPose(0).position))<1e-9);assert.equal(rallyPose(1).reset,1);
  assert.deepEqual(shuttleFlight(.4),shuttleFlight(.4),'scroll pose is deterministic');
});
