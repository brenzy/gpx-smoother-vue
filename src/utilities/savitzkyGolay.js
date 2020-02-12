import {averageSlopeFromTotal} from './displayFormat';

export function savitzkyGolay(toSmooth, options, selected) {
  const dataLength = toSmooth.length;
  if (dataLength === 0) {
    return [];
  }

  const startDistance = selected[0];
  const endDistance = selected[1];
  let distance = 0;
  const xValues = [];
  const yValues = [];

  // Collect the x and y values to be smoothed
  for (let i = 0; i < dataLength; i++) {
    const point = toSmooth[i];
    if (distance >= startDistance && distance <= endDistance) {
      xValues.push(distance);
      yValues.push(point.ele);
    }
    distance =  distance + point.distance;
    if (distance > endDistance) {
      break;
    }
  }

  let newValues = [];
  if (xValues.length > 0 && yValues.length > 0) {
    // Run the points through the algorithm
    const SG = require('ml-savitzky-golay-generalized');
    newValues = SG(yValues, xValues, options);
  }

  let smoothedValues = [];
  let previous = null;
  let totalSlope = 0;
  distance = 0;
  let newValueIndex = 0;
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toSmooth[i]
    };
    if (distance >= startDistance && distance <= endDistance) {
      point.ele = newValues[newValueIndex++];
      point.slope = 0;
      if (previous && point.distance) {
        point.slope = (point.ele - previous.ele) / point.distance;
      }
    }
    distance = distance + point.distance;
    smoothedValues.push(point);
    previous = point;
    totalSlope = totalSlope + point.slope;
  }

  return {
    smoothedValues,
    averageSlope: averageSlopeFromTotal(totalSlope, dataLength)
  };

}
