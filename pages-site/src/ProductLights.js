import * as THREE from 'three';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';

export function createProductLights(scene) {
  RectAreaLightUniformsLib.init();
  // Keep the right-hand copy in open light; the matched key and shadow source
  // cast towards the left-hand negative space throughout the swing.
  const key=new THREE.RectAreaLight(0xffeed6,5.5,4,5);key.position.set(3.6,5,4);key.lookAt(0,0,0);
  const rim=new THREE.RectAreaLight(0xe8f0ff,5,1.1,4.5);rim.position.set(-3,2,-2.8);rim.lookAt(0,0,0);
  const fill=new THREE.HemisphereLight(0xf8efdc,0x536956,.55);
  // RectAreaLight cannot cast shadows. This matching directional source supplies
  // the actual silhouettes and self-shadowing at a much lower energy.
  const sun=new THREE.DirectionalLight(0xffefd6,2.3);sun.position.set(3.5,6,5);sun.castShadow=true;
  Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:22});
  sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.00018;sun.shadow.normalBias=.006;sun.shadow.radius=3;sun.shadow.blurSamples=8;
  scene.add(key,rim,fill,sun);
  return {dispose(){sun.shadow.map?.dispose();sun.shadow.mapPass?.dispose();}};
}

