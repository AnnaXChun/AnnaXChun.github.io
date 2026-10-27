import * as THREE from 'three';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';

export function glyphSideGeometry({ink,unit,left,top},depth=.9){
  const vertices=[];
  const edge=(ax,ay,bx,by)=>{
    const a=[left+ax*unit,top-ay*unit,0],b=[left+bx*unit,top-by*unit,0];
    vertices.push(...a,b[0],b[1],-depth,...b,...a,a[0],a[1],-depth,b[0],b[1],-depth);
  };
  // Interpolate the anti-aliased outline instead of extruding pixel steps.
  // Counterforms become inner walls, with no full-word platform or stair teeth.
  const pairs=[[],[[3,0]],[[0,1]],[[3,1]],[[1,2]],[[3,0],[1,2]],[[0,2]],[[3,2]],[[2,3]],[[2,0]],[[0,1],[2,3]],[[2,1]],[[1,3]],[[1,0]],[[0,3]],[]];
  for(let y=0;y<ink.height-1;y++)for(let x=0;x<ink.width-1;x++){
    const values=[ink.alpha[y*ink.width+x],ink.alpha[y*ink.width+x+1],ink.alpha[(y+1)*ink.width+x+1],ink.alpha[(y+1)*ink.width+x]];
    const code=values.reduce((n,v,i)=>n+(v>120?1<<i:0),0);if(!pairs[code].length)continue;
    const corners=[[x+.5,y+.5],[x+1.5,y+.5],[x+1.5,y+1.5],[x+.5,y+1.5]];
    const point=e=>{const j=(e+1)%4,t=(120-values[e])/(values[j]-values[e]);return [corners[e][0]+(corners[j][0]-corners[e][0])*t,corners[e][1]+(corners[j][1]-corners[e][1])*t];};
    for(const [a,b] of pairs[code])edge(...point(a),...point(b));
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  const continuous=mergeVertices(geometry,1e-5);geometry.dispose();continuous.computeVertexNormals();
  return continuous;
}
