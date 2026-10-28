// All pointer poses are finite, bounded and centered. DOM handlers cache their
// rectangle on entry; the pointer frame performs no layout reads or React work.
export function pointerPose(x,y){
  const axis=value=>Number.isFinite(value)?Math.max(-1,Math.min(1,(value-.5)*2)):0;
  const horizontal=axis(x),vertical=axis(y);
  return {yaw:horizontal*13,pitch:-vertical*8,roll:horizontal*2.5,shift:horizontal*13,eyeX:horizontal*7,eyeY:vertical*5};
}
