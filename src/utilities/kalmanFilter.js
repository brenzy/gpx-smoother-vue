import {averageSlopeFromTotal} from './displayFormat';

export function kalmanFilter(toSmooth, options, selected) {
  let KalmanFilter = require('kalmanjs');
  let kf = new KalmanFilter({R: options.R, Q: options.Q});
  const dataLength = toSmooth.length;
  if (dataLength === 0)
    return;
  const smoothedValues = [];
  let previous = null;
  let totalSlope = 0;
  const startDistance = selected[0];
  const endDistance = selected[1];
  let distance = 0;
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toSmooth[i]
    };
    if (previous) {
      distance = distance + point.distance;
      if (distance >= startDistance && distance <= endDistance) {
        if (options.useDeltaSlope) {
          let deltaSlope = point.slope - previous.slope;
          point.slope = kf.filter(deltaSlope);
        } else {
          point.slope = kf.filter(point.slope);
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
