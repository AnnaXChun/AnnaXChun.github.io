import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderPixelRatio,minnanViewport,createSceneRuntime} from '../src/SceneRuntime.js';
import {autumnRetreat,fallingLeafPose,fallingLeafVisibility} from '../src/MinnanAtmosphere.js';

test('render targets have a pixel budget while the physical doorway remains continuous',()=>{
  for(const [w,h] of [[2048,1040],[1440,960],[390,844],[3840,2160]]){
    const dpr=renderPixelRatio(w,h,2);assert.ok(w*h*dpr*dpr<=2_800_001);
    for(let frame=440;frame<=585;frame++){
      const view=minnanViewport(frame,w,h);assert.ok(Object.values(view).every(Number.isFinite));
      assert.ok(view.width>0&&view.height>0);
    }
  }
  const center=minnanViewport(485,1440,960);assert.ok(Math.abs(center.x)<.001&&Math.abs(center.y)<.001);assert.equal(center.width,1440);assert.equal(center.height,960);
});

test('scroll retreat is reversible while wind-driven leaves stay finite and move continuously',()=>{
  assert.equal(autumnRetreat(850),1);assert.equal(autumnRetreat(1080),0);
  for(let f=900;f<1080;f++)assert.ok(autumnRetreat(f+1)<=autumnRetreat(f));
  for(let i=0;i<18;i++){
    const a=fallingLeafPose(i,8),b=fallingLeafPose(i,8+1/30);
    assert.ok(Object.values(a).every(Number.isFinite));assert.ok(a.y>=-5.7&&a.y<=5.7);
    assert.notDeepEqual(a,b);
    if(a.visibility>.05&&b.visibility>.05)assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<.15);
  }
  assert.equal(fallingLeafVisibility(.5,.6,400,true),0);
  assert.equal(fallingLeafVisibility(.8,.5,400,false),0);
  assert.equal(fallingLeafVisibility(.3,.3,400,false),1);
  assert.ok(fallingLeafVisibility(.5,.415,400,true)>0&&fallingLeafVisibility(.5,.415,400,true)<1);
});

test('ambient cadence yields to scroll updates and its clock pauses while hidden',()=>{
  const saved=Object.fromEntries(['ResizeObserver','IntersectionObserver','requestAnimationFrame','cancelAnimationFrame','document','devicePixelRatio'].map(k=>[k,globalThis[k]]));
  const frames=new Map(),times=[];let next=0;
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};globalThis.devicePixelRatio=1;
  globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
  globalThis.ResizeObserver=class{observe(){}disconnect(){}};
  globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
  const host={dataset:{},closest:()=>null},renderer={setPixelRatio(){},setSize(){}};
  const tick=t=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(t));};
  let runtime;
  try{
    runtime=createSceneRuntime({host,renderer,idleFps:30,render(w,h,clock){times.push(clock.time);return true;}});
    runtime.request();tick(0);tick(16);assert.equal(times.length,1);
    tick(34);assert.equal(times.length,2);assert.equal(times[1],.034);
    runtime.request();tick(40);assert.equal(times.length,3);assert.equal(times[2],.04);
    runtime.setActive(false);tick(900);assert.equal(times.length,3);assert.equal(frames.size,0);
    runtime.setActive(true);tick(1040);assert.equal(times.length,4);assert.equal(times[3],.04);
  }finally{runtime?.dispose();for(const [k,v] of Object.entries(saved)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});

test('draw requests coalesce, CSS framing does not reallocate buffers, hidden scenes sleep',()=>{
  const saved=Object.fromEntries(['ResizeObserver','IntersectionObserver','requestAnimationFrame','cancelAnimationFrame','document','devicePixelRatio'].map(k=>[k,globalThis[k]]));
  const frames=new Map();let next=0,sizeCallback,intersectionCallback,draws=0,allocations=0;
  globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};globalThis.devicePixelRatio=2;
  globalThis.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
  globalThis.ResizeObserver=class{constructor(fn){sizeCallback=fn;}observe(){}disconnect(){}};
  globalThis.IntersectionObserver=class{constructor(fn){intersectionCallback=fn;}observe(){}disconnect(){}};
  const viewport={},host={dataset:{},closest:()=>viewport},renderer={setPixelRatio(){},setSize(){allocations++;}};
  const tick=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());};
  let runtime;
  try{
    runtime=createSceneRuntime({host,renderer,render(){draws++;}});
    sizeCallback([{target:host,contentRect:{width:1000,height:800}},{target:viewport,contentRect:{width:1440,height:960}}]);
    runtime.request();runtime.request();tick();assert.equal(draws,1);assert.equal(allocations,1);
    sizeCallback([{target:host,contentRect:{width:1440,height:960}}]);runtime.request();tick();assert.equal(draws,2);assert.equal(allocations,1);
    runtime.setActive(false);runtime.request();tick();assert.equal(draws,2);assert.equal(host.dataset.renderState,'suspended');
    runtime.setActive(true);tick();assert.equal(draws,3);
    intersectionCallback([{isIntersecting:false}]);runtime.request();tick();assert.equal(draws,3);
    intersectionCallback([{isIntersecting:true}]);tick();assert.equal(draws,4);
  }finally{runtime?.dispose();for(const [k,v] of Object.entries(saved)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});
