import * as THREE from 'three';

// A cinnabar inlay begins at the threshold, follows stone joints, then threads
// between the research folio, the agent laptop and the case archive. Its drawing
// progress is tied to the same scroll time as the physical camera, not a timer.
export function createAgentJourney() {
  const group=new THREE.Group();group.name='cinnabar research-to-agent journey';
  const points=[
    [0,.065,5.4],[0,.065,4.2],[0,.065,3.25],[-.48,.065,2.4],[-.48,.065,1.55],
    [-.9,.07,.65],[-.92,.4,-.02],[-.92,.90,.04],[.75,.90,.04],
    [1.03,1.32,-.75],[.45,1.85,-1.06],[-.62,1.80,-1.10],[-1.5,1.75,-1.04],
    [-2.25,1.50,-.80],[-2.3,.96,-.02],[.6,.90,.12],[1.32,.78,-.02],[2.24,1.17,-.24],
  ];
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
  const geometry=new THREE.TubeGeometry(curve,240,.009,6,false);
  const material=new THREE.MeshStandardMaterial({color:0x983d27,roughness:.9,metalness:0});
  const line=new THREE.Mesh(geometry,material);group.add(line);
  const beadGeometry=new THREE.SphereGeometry(.047,18,12),bead=new THREE.Mesh(beadGeometry,material);group.add(bead);
  const anchors=new THREE.Group();group.add(anchors);
  const ringGeometry=new THREE.TorusGeometry(.085,.009,5,24);
  for(const t of [.12,.29,.48,.70,.98]) {
    const ring=new THREE.Mesh(ringGeometry,material);ring.position.copy(curve.getPointAt(t));ring.rotation.x=-Math.PI/2;anchors.add(ring);
  }
  const total=geometry.index.count;
  function update(frame,still=false) {
    const progress=still?1:Math.max(0,Math.min(1,(frame-410)/315));
    geometry.setDrawRange(0,Math.floor(total*progress/36)*36);
    bead.visible=progress>0&&progress<1;bead.position.copy(curve.getPointAt(progress));
    anchors.children.forEach((node,i)=>{node.visible=progress>=[.12,.29,.48,.70,.98][i];});
  }
  update(0);
  return {group,update,dispose(){geometry.dispose();beadGeometry.dispose();ringGeometry.dispose();material.dispose();}};
}
