import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3,Quaternion} from 'three';
import {createBadmintonModel} from '../src/BadmintonModel.js';
import {badmintonShot,LIFE_START,LIFE_END,IMPACT} from '../src/BadmintonMotion.js';

test('macro model has finite curved feathers, woven strings, grommets and a helical grip',()=>{
  const model=createBadmintonModel();
  try {
    for(const group of [model.shuttle,model.racket]) {
      const size=new Box3().setFromObject(group).getSize(new Vector3());
      assert.ok(size.x>1&&size.y>1&&size.z>.05);
      group.traverse(node=>{if(node.isMesh)for(const name of ['position','normal'])assert.ok(Array.from(node.geometry.attributes[name].array).every(Number.isFinite));});
    }
    for(const name of ['sixteen-curved-feathers','feather-barbs','feather-shafts','binding-knots','rounded-cork'])assert.ok(model.shuttle.getObjectByName(name),name);
    for(const name of ['woven-string-bed','string-grommets','helical-grip-seam','aerodynamic-frame'])assert.ok(model.racket.getObjectByName(name),name);
    const bed=model.racket.getObjectByName('woven-string-bed').geometry;
    bed.computeBoundingBox();assert.ok(bed.boundingBox.max.z-bed.boundingBox.min.z>.01,'strings interweave in depth');
  }finally{model.dispose();}
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
