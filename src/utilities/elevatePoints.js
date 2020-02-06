import {averageSlopeFromTotal} from './displayFormat';

export function elevatePoints(toElevate, metres, selected) {
  const dataLength = toElevate.length;
  if (dataLength === 0)
    return;
  let distance = 0;
  const smoothedValues = [];
  const startDistance = selected[0];
  const endDistance = selected[1];
  let totalSlope = 0;
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toElevate[i]
    };
    if (distance >= startDistance && distance <= endDistance) {
      point.ele = point.ele + metres;
    }
    distance =  distance + point.distance;
    totalSlope = totalSlope + point.slope;
    smoothedValues.push(point);
  }
  return {
    smoothedValues,
    averageSlope: averageSlopeFromTotal(totalSlope, dataLength)
  };
}
