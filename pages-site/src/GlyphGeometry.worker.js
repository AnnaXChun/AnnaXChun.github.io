import {glyphSideGeometry} from './GlyphGeometry.js';

self.onmessage=({data})=>{
  const geometry=glyphSideGeometry({ink:data,unit:1,left:0,top:0});
  const position=geometry.attributes.position.array,normal=geometry.attributes.normal.array,index=geometry.index.array;
  self.postMessage({key:data.key,position,normal,index},[position.buffer,normal.buffer,index.buffer]);
  geometry.dispose();
};
