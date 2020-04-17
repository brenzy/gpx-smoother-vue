import {averageSlopeFromTotal} from './displayFormat';

export function shiftSlope(data, percentageShift, selected) {
  const dataLength = data.length;
  if (dataLength === 0)
    return;
  const shiftedValues = [];
  let previous = null;
  let totalSlope = 0;
  let slopeDelta = percentageShift / 100.0;
  const startDistance = selected[0];
  const endDistance = selected[1];
  let distance = 0;
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...data[i]
    };
    if (previous) {
      distance = distance + point.distance;
      if (distance >= startDistance && distance <= endDistance) {
        point.slope = point.slope + slopeDelta;
        point.ele = (point.slope * point.distance) + previous.ele;
      }
    }
    totalSlope = totalSlope + point.slope;
    shiftedValues.push(point);
    previous = point;
  }
  return {
    smoothedValues: shiftedValues,
    averageSlope: averageSlopeFromTotal(totalSlope, dataLength)
  };
}
