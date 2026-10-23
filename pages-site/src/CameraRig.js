import {CatmullRomCurve3, Vector3} from 'three';

const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
const blend=(a,b,t)=>a+(b-a)*t;
const curve=points=>{
  const path=new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal');
  path.arcLengthDivisions=1000;
  return path;
};

// One physical dolly/crane shot: the whole desk, then a photograph on its notebook.
// The field of view stays fixed, so objects at different depths move differently.
const openingPosition=curve([[10.7,10.8,17],[5.4,8.5,12.5],[-1.9,4.5,6.5],[-2.2,3.8,4.7]]);
const openingTarget=curve([[0,1.1,0],[-.7,.75,1.6],[-2.15,.24,3.1],[-2.292,.249,2.987]]);

const shots=[
  {frame:180,position:[-2.2,3.8,4.7],target:[-2.292,.249,2.987],shift:.17},
  {frame:284,position:[4.3,3.9,7.3],target:[-1.0,1.85,-.4],shift:0},
  {frame:375,position:[10.8,8.8,18.8],target:[0,1.55,0],shift:-.17},
  {frame:505,position:[1.2,8.5,10.5],target:[-1.1,1.7,-.6],shift:-.11},
  {frame:615,position:[-13.8,12.9,17.0],target:[-.2,1.75,0],shift:.17},
  {frame:748,position:[-9.5,6.7,6.2],target:[-1,2.0,-.5],shift:0},
  {frame:855,position:[-21.0,10.8,-3.1],target:[0,1.7,0],shift:-.17},
  {frame:1010,position:[-15,13.5,4.6],target:[0,1.5,0],shift:-.1},
  {frame:1095,position:[-8.5,10.2,21.3],target:[0,1.6,0],shift:.17},
  {frame:1319,position:[11,8.6,16.8],target:[0,1.65,0],shift:.17},
];

export function sampleCamera(frame,{aspect=16/9,mobile=false,compact=false}={}){
  let position,target,shift;
  if(frame<=180){
    const t=smooth((frame-12)/148);
    position=openingPosition.getPointAt(t);
    target=openingTarget.getPointAt(t);
    shift=.17*smooth((frame-100)/60);
  }else{
    let i=0;
    while(i<shots.length-2&&frame>shots[i+1].frame)i++;
    const a=shots[i],b=shots[i+1],t=smooth((frame-a.frame)/(b.frame-a.frame));
    position=new Vector3(...a.position).lerp(new Vector3(...b.position),t);
    target=new Vector3(...a.target).lerp(new Vector3(...b.target),t);
    shift=blend(a.shift,b.shift,t);
  }
  // A portrait viewport follows the same dolly, then frames the photograph above the copy.
  const closeFocus=smooth((frame-60)/100)*(1-smooth((frame-215)/120));
  const fit=mobile?blend(1.75,1.4,closeFocus):Math.max(1,1.16/aspect);
  position.sub(target).multiplyScalar(fit).add(target);
  const verticalShift=mobile?blend(compact?.16:.12,.20,closeFocus)*smooth((frame-95)/65):0;
  return {position,target,shift:mobile?0:shift,verticalShift,fov:37};
}
