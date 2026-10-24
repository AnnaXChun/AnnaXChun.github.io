import * as THREE from 'three';

// Sparse, bold typography belongs to physical books, a laptop and the carved
// lintel. Match each texture to its object's aspect ratio; do not squeeze captions.
export function createStudioSurfaces(specs) {
  const group=new THREE.Group(),resources=[];
  for(const spec of specs) {
    const canvas=document.createElement('canvas');canvas.width=1600;
    canvas.height=Math.round(1600*spec.size[1]/spec.size[0]);
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    const dark=spec.kind==='lintel'||spec.kind==='skills';
    const ink=dark?'#f8f0da':'#1f3028',red=dark?'#f8f0da':'#91422e';
    ctx.fillStyle=spec.kind==='lintel'?'#494735':spec.kind==='skills'?'#8f432f':'#f3efdf';ctx.fillRect(0,0,w,h);
    const text=(label,x,y,size,color=ink,font='"Arial",sans-serif')=>{
      ctx.font=`700 ${size}px ${font}`;ctx.fillStyle=color;ctx.fillText(label,x,y);
    };
    const rule=(y)=>{ctx.fillStyle=red;ctx.fillRect(w*.07,y,w*.86,4);};
    if(spec.kind==='terminal') {
      text('AGENT',w*.07,h*.39,h*.29);
      rule(h*.50);
      text('CLAUDE CODE',w*.07,h*.72,h*.13);
      text('开发 · 迭代',w*.07,h*.91,h*.115,red);
    } else if(spec.kind==='research') {
      text('OPD + RL',w*.06,h*.40,h*.25,ink,'Georgia,serif');
      rule(h*.52);
      text('SOTA',w*.06,h*.84,h*.24,red,'Georgia,serif');
      text('后训练',w*.59,h*.83,h*.16);
    } else if(spec.kind==='skills') {
      text('SKILLS',w*.06,h*.75,h*.72);
    } else if(spec.kind==='cases') {
      text('BAD CASE STUDIO',w*.055,h*.75,h*.59);
    } else {
      text('知    行',w*.30,h*.79,h*.72,ink,'"Songti SC",serif');
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
    const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
    const geometry=new THREE.PlaneGeometry(...spec.size),mesh=new THREE.Mesh(geometry,material);
    mesh.name=`studio-${spec.kind}`;mesh.position.set(...spec.position);mesh.rotation.set(...spec.rotation);group.add(mesh);
    resources.push(texture,material,geometry);
  }
  return {group,dispose(){resources.forEach(resource=>resource.dispose());}};
}
