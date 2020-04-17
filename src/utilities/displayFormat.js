export function averageSlopeFromTotal(totalSlope, numberOfPoints) {
  // Deal with floating point error by adding to total slope
  if (numberOfPoints > 2) {
    return parseInt((totalSlope + .0000000005) / (numberOfPoints - 1) * 10000) / 100;
  }
  return null;
}
