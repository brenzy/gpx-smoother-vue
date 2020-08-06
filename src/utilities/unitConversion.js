import {UnitType} from '@/components/chartModel';

export function kmToMiles(kilometres) {
  return kilometres * 0.62137119223;
}

export function metresToFeet(metres) {
  return metres * 3.2808399;
}

export function convertDistance(kilometres, unitType) {
  return unitType === UnitType.IMPERIAL ? kmToMiles(kilometres) : kilometres;
}

export function convertElevation(metres, unitType) {
  return unitType === UnitType.IMPERIAL ? metresToFeet(metres) : metres;
}
