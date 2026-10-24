import * as THREE from 'three';

// These are ink diagrams printed onto modelled paper / a physical laptop screen.
// The architecture and vegetation remain mesh geometry with real perspective.
export function createStudioSurfaces(specs) {
  const group=new THREE.Group(),resources=[];
  for(const spec of specs) {
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=800;
    const ctx=canvas.getContext('2d');
    const ink='#37453d',red='#a15c49';
    ctx.fillStyle='#f3f0e5';ctx.fillRect(0,0,1200,800);
    let seed=47;const random=()=>((seed=1664525*seed+1013904223>>>0)/4294967296);
    for(let i=0;i<7500;i++) {ctx.fillStyle=`rgba(67,70,54,${random()*.06})`;ctx.fillRect(random()*1200,random()*800,random()*3+1,1);}
    const text=(label,x,y,size=48,color=ink,font='monospace')=>{ctx.font=`${size}px ${font}`;ctx.fillStyle=color;ctx.fillText(label,x,y);};
    const stroke=(x1,y1,x2,y2,color=ink,width=2)=>{
      for(let pass=0;pass<3;pass++) {
        ctx.strokeStyle=color;ctx.globalAlpha=pass===0?.65:.16;ctx.lineWidth=width+(pass===0?0:3);ctx.beginPath();
        ctx.moveTo(x1,y1+pass*.8);ctx.bezierCurveTo(x1+(x2-x1)*.3,y1-2,x1+(x2-x1)*.7,y2+2,x2,y2);ctx.stroke();
      }ctx.globalAlpha=1;
    };
    if(spec.kind==='agent') {
      text('AGENT / WORKBENCH',72,110,62);
      text('从模型到真实业务',76,170,30,ink,'"Songti SC",serif');
      stroke(72,210,1128,210,ink);
      const node=(x,y,label,caption)=>{
        ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.strokeRect(x,y,430,150);
        text(label,x+24,y+62,38);text(caption,x+24,y+113,25,'#788275');
      };
      node(72,275,'CLAUDE CODE','kernel integration');
      node(695,275,'AGENT','business workflows');
      node(72,545,'SKILLS','refine & compose');
      node(695,545,'BAD CASE STUDIO','review & iterate');
      stroke(502,350,695,350,red,4);stroke(910,425,910,545,red,4);
      stroke(695,620,502,620,red,4);stroke(287,545,287,425,red,4);
      for(const [x,y] of [[602,350],[910,486],[602,620],[287,486]]) {
        ctx.fillStyle=red;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();
      }
    } else if(spec.kind==='terminal') {
      text('> agent.run()',70,140,74);stroke(72,195,1128,195);
      ['observe(context)','plan → call_tool()','review(bad_case)','refine(skill)'].forEach((line,i)=>text(line,90,300+i*105,48,i===2?red:ink));
      text('●',1030,140,50,red);
    } else {
      text('RESEARCH NOTES',64,100,42);
      text('OPD + RL',64,255,110,ink,'Georgia,serif');
      stroke(64,325,1120,325,ink);
      text('distill → train → evaluate',64,435,48);
      text('OPEN BENCHMARK',64,600,42);
      text('SOTA',64,715,86,red,'Georgia,serif');
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
    const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
    const geometry=new THREE.PlaneGeometry(...spec.size),mesh=new THREE.Mesh(geometry,material);
    mesh.name=`studio-${spec.kind}`;mesh.position.set(...spec.position);mesh.rotation.set(...spec.rotation);group.add(mesh);
    resources.push(texture,material,geometry);
  }
  return {group,dispose(){resources.forEach(resource=>resource.dispose());}};
}
