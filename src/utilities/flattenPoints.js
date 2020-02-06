import {averageSlopeFromTotal} from './displayFormat';

export function flattenPoints(toFlatten, maxSlope, selected) {
  const dataLength = toFlatten.length;
  if (dataLength === 0)
    return;
  const smoothedValues = [];
  const maxDelta = Math.abs(Number(maxSlope)) / 100;
  let previous = null;
  let totalSlope = 0;
  const startDistance = selected[0];
  const endDistance = selected[1];
  let distance = 0;
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toFlatten[i]
    };
    if (previous) {
      distance = distance + point.distance;
      if (distance >= startDistance && distance <= endDistance) {
        let deltaSlope = point.slope - previous.slope;
        if (Math.abs(deltaSlope) > maxDelta) {
          if (deltaSlope > 0) {
            point.slope = previous.slope + maxDelta;
          } else if (deltaSlope < 0) {
            point.slope = previous.slope - maxDelta;
          }
        }
        point.ele = (point.slope * point.distance) + previous.ele;
      }
    }
    totalSlope = totalSlope + point.slope;
    smoothedValues.push(point);
    previous = point;
  }
  return {
    smoothedValues,
    averageSlope: averageSlopeFromTotal(totalSlope, dataLength)
  };
}
