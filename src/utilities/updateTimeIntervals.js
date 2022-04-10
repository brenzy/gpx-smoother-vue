export function updateTimeIntervals(toUpdate, timeShift, averageSlope) {
  const dataLength = toUpdate.length;
  if (dataLength === 0)
    return;
  const smoothedValues = [];
  let totalTime = null;
  let interval = 1000.0;
  if (timeShift !== 100) {
    interval = interval / (timeShift / 100.0);
  }
  for (let i = 0; i < dataLength; i++) {
    let point = {
      ...toUpdate[i]
    };
    if (i === 0) {
      if (point.time) {
        totalTime = new Date(point.time);
      } else {
        totalTime = new Date();
      }
    } else {
      totalTime = new Date(totalTime.getTime() + interval);
    }
    point.time = totalTime.toISOString();
    smoothedValues.push(point);
  }
  return {
    smoothedValues,
    averageSlope: averageSlope
  };
}
