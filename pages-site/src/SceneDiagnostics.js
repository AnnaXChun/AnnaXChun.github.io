// Opt-in development evidence. No timers, telemetry or product UI in production.
export function createSceneDiagnostics(host, renderer) {
  if (!import.meta.env?.DEV || !new URLSearchParams(location.search).has('renderAudit')) return {draw: fn=>fn(),simulate:fn=>fn(),resize(){},background(){},physics(){},letters(){}};
  const samples=[],updates=[];let draws=0,resizes=0,backgroundDraws=0;
  return {
    physics(read){host.dataset.leafPhysics=JSON.stringify(read());},
    letters(boxes){host.dataset.leafColliders=JSON.stringify(boxes);},
    simulate(fn){const start=performance.now();fn();updates.push(performance.now()-start);if(updates.length>120)updates.shift();},
    resize(){resizes++;},
    background(){backgroundDraws++;},
    draw(fn){
      const start=performance.now();fn();const elapsed=performance.now()-start;draws++;
      if(draws>5){samples.push(elapsed);if(samples.length>120)samples.shift();}
      const sorted=[...samples].sort((a,b)=>a-b),at=p=>+(sorted[Math.floor((sorted.length-1)*p)]||0).toFixed(2);
      const updateSorted=[...updates].sort((a,b)=>a-b),updateAt=p=>+(updateSorted[Math.floor((updateSorted.length-1)*p)]||0).toFixed(2);
      host.dataset.renderAudit=JSON.stringify({draws,resizes,backgroundDraws,cpuP50:at(.5),cpuP95:at(.95),updateCpuP50:updateAt(.5),updateCpuP95:updateAt(.95),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,buffer:[renderer.domElement.width,renderer.domElement.height],heapMiB:Math.round((performance.memory?.usedJSHeapSize||0)/1048576)});
    },
  };
}
