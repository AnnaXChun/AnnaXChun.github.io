import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Box3, Raycaster, Vector3} from 'three';
import {createMinnanCourtyard} from '../src/MinnanModel.js';
import {minnanCamera} from '../src/MinnanCamera.js';
import {createAgentJourney} from '../src/MinnanJourney.js';

test('courtyard has finite volume, bounded batches and a genuinely open gate', () => {
  const model=createMinnanCourtyard();
  try {
    model.group.updateMatrixWorld(true);
    const size=new Box3().setFromObject(model.group).getSize(new Vector3());
    assert.ok(size.x>10 && size.y>4 && size.z>8, 'architecture must occupy all three axes');
    assert.ok(model.stats.meshes<=16 && model.stats.vertices<600000, 'keep the model within its rendering budget');
    model.group.traverse(node=>{
      if(!node.isMesh)return;
      for(const name of ['position','normal']) {
        assert.ok(Array.from(node.geometry.getAttribute(name).array).every(Number.isFinite), `${name} must not contain NaN`);
      }
    });
    const ray=new Raycaster(new Vector3(0,1,6),new Vector3(0,0,-1));
    const hit=ray.intersectObjects(model.group.children,false).find(item=>item.object.isMesh);
    assert.ok(hit && hit.distance>5, 'gate opening must remain clear of facade and mortar geometry');
  } finally { model.dispose(); }
});

test('camera dollies through the real doorway and cranes back to an exterior view', () => {
  const model=createMinnanCourtyard();
  try {
    model.group.updateMatrixWorld(true);
    let previous=minnanCamera(475);
    assert.ok(previous.position[2]>4.3);
    for(let frame=476;frame<=565;frame++) {
      const shot=minnanCamera(frame);
      const origin=new Vector3(...previous.position),next=new Vector3(...shot.position);
      const distance=origin.distanceTo(next);
      const ray=new Raycaster(origin,next.clone().sub(origin).normalize(),0,distance+.001);
      assert.equal(ray.intersectObjects(model.group.children,false).filter(hit=>hit.object.isMesh).length,0,`camera must not clip the gate at frame ${frame}`);
      assert.equal(shot.fit,0,'responsive framing must not pull the camera out of the entrance');
      previous=shot;
    }
    assert.ok(previous.position[2]<3,'camera reaches the interior courtyard');
    assert.ok(minnanCamera(815).position[1]>9,'camera rises to reveal the full building again');
    for(let frame=1;frame<1320;frame++) {
      const a=minnanCamera(frame-1),b=minnanCamera(frame);
      assert.ok(new Vector3(...a.position).distanceTo(new Vector3(...b.position))<.4,'scrubbing must remain continuous');
    }
  } finally { model.dispose(); }
});

// A reverse scroll must erase the ink route again; reduced-motion keeps it still.
test('spatial ink route is finite, reversible and fully visible in the still view', () => {
  const journey=createAgentJourney();
  try {
    const line=journey.group.children[0];
    assert.ok(Array.from(line.geometry.attributes.position.array).every(Number.isFinite));
    journey.update(640);const partial=line.geometry.drawRange.count;
    assert.ok(partial>0&&partial<line.geometry.index.count);
    journey.update(750);assert.equal(line.geometry.drawRange.count,line.geometry.index.count);
    journey.update(640);assert.equal(line.geometry.drawRange.count,partial);
    journey.update(300);assert.equal(line.geometry.drawRange.count,0);
    journey.update(90,true);assert.equal(line.geometry.drawRange.count,line.geometry.index.count);
  } finally {journey.dispose();}
});
