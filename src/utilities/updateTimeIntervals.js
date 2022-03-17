export function updateTimeIntervals(toUpdate, averageSlope) {
  console.log('averageSlope', averageSlope);
  const dataLength = toUpdate.length;
  if (dataLength === 0)
    return;
  const smoothedValues = [];
  let totalTime = null;
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
      totalTime = new Date(totalTime.getTime() + 1000);
    }
    point.time = totalTime.toISOString();
    smoothedValues.push(point);
  }
  return {
    smoothedValues,
    averageSlope: averageSlope
  };
}
