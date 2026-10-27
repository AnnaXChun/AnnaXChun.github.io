const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t=clamp(value); return t*t*(3-2*t); };
const mix = (a,b,t) => a+(b-a)*t;

// World-space dolly / crane positions. The gate is at z=3.65, with a real opening.
// Keep the entrance shot on its centreline at eye level, then rise inside the court.
const shots = [
  {frame:0, position:[12,10.8,20], target:[0,1.15,0], fit:1},
  {frame:90, position:[7.6,7.2,14.6], target:[0,1.1,0], fit:1},
  {frame:240, position:[-6.5,8.5,16.5], target:[0,1.1,-.4], fit:1},
  {frame:380, position:[-5,5.5,12], target:[0,1.2,-1], fit:1},
  {frame:475, position:[0,1.08,6], target:[0,1.12,-2.9], fit:0},
  {frame:565, position:[0,1.08,2.65], target:[-.25,1.15,-.8], fit:0},
  {frame:640, position:[.60,1.95,2.75], target:[.35,1.03,-.65], fit:0},
  {frame:705, position:[2.55,2.85,1.85], target:[.65,1.05,-.6], fit:.15},
  {frame:815, position:[8.5,10.5,13.5], target:[0,1.15,0], fit:1},
  {frame:1000, position:[13,9,6.5], target:[0,1.3,0], fit:1},
  {frame:1140, position:[11,6.3,2.8], target:[0,1.6,-.7], fit:1},
  {frame:1319, position:[7.6,7.2,14.6], target:[0,1.1,0], fit:1},
];

export function minnanCamera(frame) {
  const f=Math.max(0,Math.min(1319,frame));
  const index=Math.max(0,shots.findLastIndex(shot=>shot.frame<=f));
  const a=shots[index],b=shots[Math.min(index+1,shots.length-1)];
  const t=a===b?0:smooth((f-a.frame)/(b.frame-a.frame));
  const fit=mix(a.fit,b.fit,t);
  return {
    position:a.position.map((v,i)=>mix(v,b.position[i],t)),
    target:a.target.map((v,i)=>mix(v,b.target[i],t)),
    fit,
    fov:mix(68,42,fit),
    // Disable mouse sway through the narrow doorway; the camera must stay physical.
    pointer:fit,
  };
}
