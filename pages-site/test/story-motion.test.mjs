import test from 'node:test';
import assert from 'node:assert/strict';
import {createStoryMotion,chapterOpacity} from '../src/StoryMotion.js';

test('one continuous playhead reaches DOM and camera subscribers in both directions',()=>{
  const motion=createStoryMotion(90),dom=[],camera=[];
  const unsubscribe=motion.subscribe(f=>dom.push(f));motion.subscribe(f=>camera.push(f));
  for(const frame of [90.125,90.125,612.75,1559,400.5,NaN,Infinity])motion.setFrame(frame);
  assert.deepEqual(dom,[90,90.125,612.75,1559,400.5]);assert.deepEqual(camera,dom);
  unsubscribe();motion.setFrame(100.25);assert.equal(dom.at(-1),400.5);assert.equal(camera.at(-1),100.25);
});

test('chapter visibility has no direction-dependent state and preserves the empty gate passage',()=>{
  const frames=[90,315,465,500,560,620,855,1095,1480];
  const forward=frames.map(f=>Array.from({length:5},(_,i)=>chapterOpacity(f,i)));
  const reverse=[...frames].reverse().map(f=>Array.from({length:5},(_,i)=>chapterOpacity(f,i))).reverse();
  assert.deepEqual(forward,reverse);assert.ok(forward.flat().every(a=>a>=0&&a<=1));
  assert.equal(forward[3].reduce((a,b)=>a+b,0),0);
  assert.equal(chapterOpacity(620,2),1);assert.equal(chapterOpacity(855,3),1);
});
