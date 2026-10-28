// Local, opt-in benchmark UI. Injected into a copy of the production build by
// prepare-benchmark.mjs; never imported by the site or deployed with it.
const panel=document.createElement('aside');
panel.id='motion-performance-probe';
panel.style.cssText='position:fixed;right:12px;bottom:12px;z-index:99999;max-width:420px;padding:12px;background:#fff;color:#172d3b;border:1px solid #93adc0;font:12px/1.4 monospace';
panel.innerHTML='<button type="button">Run motion benchmark</button><output style="display:block;max-height:220px;overflow:auto">Production build · 19 second forward/reverse scroll</output>';
document.body.append(panel);
const button=panel.querySelector('button'),output=panel.querySelector('output');
let run=0;
button.onclick=()=>{
  const legacy=Boolean(document.querySelector('#story'));
  const story=document.querySelector('#story')||document.querySelector('main');
  if(!story){output.textContent='Motion story unavailable (check reduced motion).';return;}
  button.disabled=true;run++;
  const initialViewport=[innerWidth,innerHeight,devicePixelRatio];let interrupted=document.hidden;
  const validate=()=>{if(document.hidden||innerWidth!==initialViewport[0]||innerHeight!==initialViewport[1]||devicePixelRatio!==initialViewport[2])interrupted=true;};
  document.addEventListener('visibilitychange',validate);window.addEventListener('resize',validate);
  const rect=story.getBoundingClientRect(),top=rect.top+scrollY;
  const travel=legacy?rect.height-document.querySelector('.story-stage').getBoundingClientRect().height:Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const sportsTop=legacy ? 0.68 :(document.querySelector('#life').getBoundingClientRect().top+scrollY)/travel;
  const samples=[],longTasks=[],longFrames=[];
  const observe=(type,entries)=>{
    if(!PerformanceObserver.supportedEntryTypes.includes(type))return null;
    const observer=new PerformanceObserver(list=>entries.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration,blocking:e.blockingDuration}))));
    observer.observe({type,buffered:false});return observer;
  };
  const taskObserver=observe('longtask',longTasks),frameObserver=observe('long-animation-frame',longFrames);
  scrollTo({top,behavior:'instant'});
  let start=0,previous=0,lastReport=0;
  const tick=now=>{
    if(!start)start=now;
    const elapsed=now-start;
    // One second for the initial pose, then a repeatable 12s forward + 6s reverse.
    const time=Math.max(0,elapsed-1000);
    const fraction=time<=12000?time/12000:Math.max(0,1-(time-12000)/6000);
    if(previous&&elapsed>1000)samples.push({dt:now-previous,fraction});
    previous=now;
    scrollTo({top:top+travel*Math.min(1,fraction),behavior:'instant'});
    if(now-lastReport>500){output.textContent=`Run ${run}: ${(elapsed/1000).toFixed(1)}s / 19s`;lastReport=now;}
    if(elapsed<19000){requestAnimationFrame(tick);return;}
    taskObserver?.disconnect();frameObserver?.disconnect();
    document.removeEventListener('visibilitychange',validate);window.removeEventListener('resize',validate);
    const summarize=rows=>{
      const values=rows.map(s=>s.dt).sort((a,b)=>a-b),total=values.reduce((a,b)=>a+b,0);
      const at=p=>+(values[Math.floor((values.length-1)*p)]||0).toFixed(2);
      return {samples:values.length,rafHz:+(1000*values.length/total).toFixed(1),p50Ms:at(.5),p95Ms:at(.95),p99Ms:at(.99),over25ms:values.filter(n=>n>25).length,over50ms:values.filter(n=>n>50).length};
    };
    const authoredNodes=[...document.querySelectorAll(legacy?'.depth-title span,.shot-copy,.cinema-evidence-primary,.cinema-evidence-secondary':'.crt-parallax,.reel-scroll')];
    const authoredTransforms=authoredNodes.length>0&&authoredNodes.every(node=>node.style.transform&&getComputedStyle(node).transform!=='none');
    const result={run,build:document.documentElement.dataset.benchmarkBuild,valid:!interrupted,authoredTransforms,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,visibility:document.visibilityState,...summarize(samples),front:summarize(samples.filter(s=>s.fraction<sportsTop)),sports:summarize(samples.filter(s=>s.fraction>=sportsTop)),longTasks:longTasks.filter(e=>e.start>=start+1000),longAnimationFrames:longFrames.filter(e=>e.start>=start+1000)};
    output.textContent=JSON.stringify(result,null,2);panel.dataset.result=JSON.stringify(result);button.disabled=false;
  };
  requestAnimationFrame(tick);
};
