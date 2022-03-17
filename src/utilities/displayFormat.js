export function averageSlopeFromTotal(totalSlope, numberOfPoints) {
  if (numberOfPoints > 2) {
    return parseInt((totalSlope) / (numberOfPoints - 1) * 100000) / 1000;
  }
  return null;
}
