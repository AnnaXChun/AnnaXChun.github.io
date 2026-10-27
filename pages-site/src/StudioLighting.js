import * as THREE from 'three';

// A photographed object reflects the studio, including its dark side. The cards
// are baked once, not painted onto the object or attached to the moving camera.
export function createStudioEnvironment(renderer,mirror=false) {
  const room=new THREE.Scene(),owned=[];
  room.background=new THREE.Color(0x101d29);
  const card=(color,intensity,size,position,target=[0,0,0])=>{
    const geometry=new THREE.PlaneGeometry(...size);
    const material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});
    material.color.multiplyScalar(intensity);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(position[0]*(mirror?-1:1),position[1],position[2]);mesh.lookAt(...target);room.add(mesh);owned.push(geometry,material);
  };
  card(0xf7fbff,5.5,[5,7],[-4,6,5]);
  card(0xf0f6ff,4,[1.3,6],[4,2,-3]);
  card(0xcfe9ff,.8,[7,3],[0,-5,1]);
  // Narrow white strip and adjacent negative fill carve the lacquer silhouette.
  card(0xffffff,3,[.45,5],[-3,1,-4]);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const target=pmrem.fromScene(room,.035,.1,50);
  pmrem.dispose();owned.forEach(r=>r.dispose());
  return {texture:target.texture,dispose:()=>target.dispose()};
}

export function createStudioShadows(scene) {
  // One continuous wall: two transparent receivers looked like duplicate rackets.
  const geometry=new THREE.PlaneGeometry(60,40);
  const material=new THREE.ShadowMaterial({color:0x305e7c,opacity:.09,depthWrite:false});
  const wall=new THREE.Mesh(geometry,material);wall.position.z=-1.8;wall.receiveShadow=true;scene.add(wall);
  return {dispose(){geometry.dispose();material.dispose();}};
}
