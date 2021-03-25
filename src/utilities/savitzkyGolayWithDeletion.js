import {averageSlopeFromTotal} from './displayFormat';

// Use Savitzky-Golay but delete points that off by a given threshold
export function savitzkyGolayWithDeletion(toSmooth, options, selected) {
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
  console.log('here');
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toSmooth[i]
    };
    let bIncludePoint = true;
    if (distance >= startDistance && distance <= endDistance) {
      const newValue = newValues[newValueIndex++];
      let newSlope = 0;
      if (previous && point.distance) {
        newSlope = (newValue - previous.ele) / point.distance;
      }
      // Include the first point and all points under the threshold
      // Distance is not recalculated, so becomes inaccurate
      // We could try recalculating distances and rerunning the SG algorithm when a point is deleted
      // Another option is just to average set the point the same as the previous point (because there are rarely two
      // outliers in a row in my data sets)
      if (!previous ||
          ((Math.abs(point.ele - newValue) < Math.abs(options.elevationThreshold)) &&
          (Math.abs(newSlope - point.slope) * 100 < Math.abs(options.slopeThreshold)))) {
        point.ele = newValue;
        point.slope = newSlope;
      } else {
        bIncludePoint = false;
      }
    }
    if (bIncludePoint) {
      distance = distance + point.distance;
      smoothedValues.push(point);
      previous = point;
      totalSlope = totalSlope + point.slope;
    }
  }

  return {
    smoothedValues,
    averageSlope: averageSlopeFromTotal(totalSlope, dataLength)
  };

}
