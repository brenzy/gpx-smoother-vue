import {averageSlopeFromTotal} from './displayFormat';

export function setSlopeRange(toFlatten, range, selection) {
  const dataLength = toFlatten.length;
  if (dataLength === 0) {
    return [];
  }
  var smoothedValues = [];
  var maxSlope = Number(range.maxSlope) / 100;
  var minSlope = Number(range.minSlope) / 100;
  let startDistance = selection[0];
  let endDistance = selection[1];
  let distance = 0;
  let previous = null;
  let totalSlope = 0;
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toFlatten[i]
    };
    if (previous) {
      let slope = toFlatten[i].slope;
      distance = distance + point.distance;
      if (distance >= startDistance && distance <= endDistance) {
        if (slope > maxSlope) {
          slope = maxSlope;
        } else if (slope < minSlope) {
          slope = minSlope;
        }
      }
      point.ele = (slope * point.distance) + previous.ele;
      point.slope = slope;
      totalSlope = totalSlope + point.slope;
    }
    smoothedValues.push(point);
    previous = point;
  }
  return {
    smoothedValues,
    averageSlope: averageSlopeFromTotal(totalSlope, dataLength)
  };
}
