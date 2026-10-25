import {Euler,Quaternion,Vector3} from 'three';

export const LIFE_START=1050;
export const LIFE_END=1530;
export const IMPACT=.46;
export const SHUTTLE_SCALE=.46;
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{const x=clamp(t);return x*x*(3-2*x);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function sample(keys,t) {
  const i=Math.max(0,keys.findLastIndex(k=>t>=k[0])),a=keys[i],b=keys[Math.min(i+1,keys.length-1)];
  return mix(a[1],b[1],a===b?0:ease((t-a[0])/(b[0]-a[0])));
}
const rotations=[[0,[.08,-.35,.45]],[.24,[.15,-.9,-.65]],[IMPACT,[.08,.15,-.9]],[.72,[-.45,1.2,-1.8]],[1,[.3,.75,-1.3]]];
const positions=[[0,[-.9,.15,-.2]],[.24,[-1.25,.8,-.7]],[IMPACT,[-.5,.25,0]],[.72,[.2,-.25,.35]],[1,[-.55,-.2,0]]];
const normal=new Vector3(0,0,1).applyEuler(new Euler(...rotations[2][1]));
const contact=positions[2][1];
const incoming=new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),normal.clone().negate());
const centre=new Vector3(...contact).addScaledVector(normal,.66*SHUTTLE_SCALE);

// A pure scroll score: no clock, click handler, random spin or reset teleport.
// Scrolling backwards traverses exactly the same camera and contact poses.
export function badmintonShot(frame) {
  const t=clamp((frame-LIFE_START)/(LIFE_END-LIFE_START));
  const racketPosition=sample(positions,t),racketRotation=sample(rotations,t);
  let shuttlePosition,shuttleQuaternion;
  if(t<=IMPACT) {
    shuttlePosition=sample([[0,[.9,1.12,.65]],[.24,[.15,1.05,.5]],[IMPACT,centre.toArray()]],t);
    const arrival=new Quaternion().setFromEuler(new Euler(.3,-1.4+t*4,-.7));
    shuttleQuaternion=arrival.slerp(incoming,ease(t/IMPACT));
  } else {
    const f=(t-IMPACT)/(1-IMPACT);
    // Leave along the string-bed normal; then sweep close to the lens and past its edge.
    const p0=centre,p1=centre.clone().addScaledVector(normal,2.4),p2=new Vector3(1.2,.8,5.5),p3=new Vector3(5.3,1.1,6.0);
    const v=1-f;
    shuttlePosition=p0.clone().multiplyScalar(v*v*v).addScaledVector(p1,3*v*v*f).addScaledVector(p2,3*v*f*f).addScaledVector(p3,f*f*f).toArray();
    const tangent=p1.clone().sub(p0).multiplyScalar(3*v*v).addScaledVector(p2.clone().sub(p1),6*v*f).addScaledVector(p3.clone().sub(p2),3*f*f).normalize();
    const outgoing=new Quaternion().setFromUnitVectors(new Vector3(0,-1,0),tangent);
    shuttleQuaternion=incoming.clone().slerp(outgoing,ease(f/.17)).multiply(new Quaternion().setFromAxisAngle(new Vector3(0,1,0),f*Math.PI*3));
  }
  return {
    progress:t,racketPosition,racketRotation,shuttlePosition,shuttleQuaternion:shuttleQuaternion.toArray(),shuttleScale:SHUTTLE_SCALE,
    cameraPosition:sample([[0,[.9,1.2,7.2]],[IMPACT,[.2,.6,6.2]],[.76,[.2,.45,6.1]],[1,[1,1,7.6]]],t),
    cameraTarget:sample([[0,[-.2,-.1,0]],[IMPACT,[-.3,0,0]],[.76,[.3,.3,.3]],[1,[.2,-.1,0]]],t),
    fov:38-4*ease(t/.46)+7*ease((t-.76)/.24),
  };
}
