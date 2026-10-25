import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inkRectangles} from '../src/LeafTextColliders.js';

test('font collision rectangles preserve every stroke and leave counterforms and spaces empty',()=>{
  const lines=['111001110','101000100','111000100','000000000','110001110'];
  const width=lines[0].length,alpha=Uint8Array.from(lines.join(''),v=>v==='1'?255:0);
  const rectangles=inkRectangles(alpha,width,lines.length),coverage=new Uint8Array(alpha.length);
  for(const {x,y,width:w,height:h} of rectangles)for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++)coverage[row*width+col]++;
  for(let i=0;i<alpha.length;i++)assert.equal(coverage[i],alpha[i]?1:0);
  assert.equal(coverage[width+1],0,'the O counter remains empty');
  assert.equal(coverage[3],0,'inter-letter whitespace remains empty');
  assert.ok(rectangles.length<alpha.filter(Boolean).length,'solid runs merge instead of one body per pixel');
});
