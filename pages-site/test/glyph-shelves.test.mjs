import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {frameAutumnCamera,glyphSideGeometry} from '../src/GlyphShelves.js';

test('off-axis lens reveals resting surfaces while preserving exact DOM glyph alignment',()=>{
  for(const aspect of [.46,1,1.5,2.1]){
    const original=new PerspectiveCamera(35,aspect,.1,40);original.position.z=13;original.updateMatrixWorld();
    const resting=original.clone();frameAutumnCamera(resting,aspect);
    for(const xy of [[0,0],[-3,3],[2,1],[4,-2]]){
      const front=new Vector3(...xy,0),a=front.clone().project(original),b=front.clone().project(resting);
      assert.ok(a.distanceTo(b)<1e-12,'front faces match the crisp DOM text exactly');
      const back=new Vector3(...xy,-.9).project(resting);
      assert.ok(back.y>b.y,'the rear top edge is visible above the front edge');
    }
  }
});

test('extruded font outline preserves inner walls and interpolates anti-aliased boundaries',()=>{
  const rows=['0000000','0111110','0100010','0100010','0100010','0111110','0000000'];
  const ink={width:7,height:7,alpha:Uint8Array.from(rows.join(''),v=>v==='1'?255:0)};
  const geometry=glyphSideGeometry({ink,unit:1,left:0,top:7});
  try{
    geometry.computeBoundingBox();assert.equal(geometry.boundingBox.max.z,0);assert.ok(Math.abs(geometry.boundingBox.min.z+.9)<1e-6);
    const p=geometry.attributes.position.array;assert.ok([...p].every(Number.isFinite));
    let innerWall=false,fractionalEdge=false;
    for(let i=0;i<p.length;i+=3){innerWall ||= p[i]>1.5&&p[i]<5.5&&p[i+1]>1.5&&p[i+1]<5.5;fractionalEdge ||= Math.abs(p[i]-Math.round(p[i]))>.01;}
    assert.ok(innerWall,'the letter hole has actual inner walls');assert.ok(fractionalEdge,'the edge is not a pixel staircase');
  }finally{geometry.dispose();}
});
