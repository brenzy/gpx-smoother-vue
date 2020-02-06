export function averageSlopeFromTotal(totalSlope, numberOfPoints) {
  // Deal with floating point error by adding to total slope
  return ((totalSlope + .0000000005) / (numberOfPoints - 1) * 10000) / 100;
}
