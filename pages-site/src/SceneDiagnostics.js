// Opt-in development evidence. No timers, telemetry or product UI in production.
export function createSceneDiagnostics(host, renderer) {
  if (!import.meta.env?.DEV || !new URLSearchParams(location.search).has('renderAudit')) return {draw: fn=>fn(), resize(){},background(){}};
  const samples=[];let draws=0,resizes=0,backgroundDraws=0;
  return {
    resize(){resizes++;},
    background(){backgroundDraws++;},
    draw(fn){
      const start=performance.now();fn();const elapsed=performance.now()-start;draws++;
      if(draws>5){samples.push(elapsed);if(samples.length>120)samples.shift();}
      const sorted=[...samples].sort((a,b)=>a-b),at=p=>+(sorted[Math.floor((sorted.length-1)*p)]||0).toFixed(2);
      host.dataset.renderAudit=JSON.stringify({draws,resizes,backgroundDraws,cpuP50:at(.5),cpuP95:at(.95),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,buffer:[renderer.domElement.width,renderer.domElement.height],heapMiB:Math.round((performance.memory?.usedJSHeapSize||0)/1048576)});
    },
  };
}
