import {distVincenty} from './vincentyFormula';

const DEFAULT_NAME = 'Smoothed Ride';
const DEFAULT_DESCRIPTION = 'Created by running the ride through a smoothing algorithm.';
export const LOAD_ERRORS =  {
  MISSING_LAT_LONG: 'Missing latitude and/or longitude values.',
  INVALID_FILE_FORMAT: 'Invalid GPX file format.',
  LOAD_ERROR: 'Error reading the GPX file.'
};

export function parseJson(jsonRoot) {
  if (!jsonRoot) {
    throw (LOAD_ERRORS.INVALID_FILE_FORMAT);
  }

  let gpxNode = jsonRoot.gpx;
  if (!gpxNode) {
    throw (LOAD_ERRORS.INVALID_FILE_FORMAT);
  }

  const name = gpxNode.metadata && gpxNode.metadata.name ? gpxNode.metadata.name : DEFAULT_NAME;
  const description = gpxNode.metadata && gpxNode.metadata.desc ? gpxNode.metadata.desc : DEFAULT_DESCRIPTION;

  let rawValues = [];
  let previous =  null;
  let totalDistance = 0;
  let totalSlope = 0;
  let bElevationAdded = false;
  if (gpxNode.trk) {
    gpxNode.trk.forEach((trk) => {
      if (trk.trkseg) {
        trk.trkseg.forEach((trkseg) => {
          if (trkseg.trkpt) {
            trkseg.trkpt.forEach((trkpt) => {
              let point = {};
              if (!trkpt.$ || !trkpt.$.lat || !trkpt.$.lon) {
                throw (LOAD_ERRORS.MISSING_LAT_LONG);
              }
              point.lat = Number(trkpt.$.lat);
              point.long = Number(trkpt.$.lon);
              if (trkpt.ele && trkpt.ele.length) {
                point.ele = Number(trkpt.ele[0]);
              } else {
                // Add the elevation. TACX won't accept a track at zero elevation so
                // set it to the value of the previous point, or an arbitrary value of
                // 100 meters if there is no previous elevation.
                if (previous && previous.ele) {
                  point.ele = previous.ele;
                } else {
                  point.ele = 100;
                }
                bElevationAdded = true;
              }
              point.distance = 0;
              point.totalDistance = 0;
              point.slope = 0;
              if (previous) {
                point.distance = distVincenty(previous.lat, previous.long, point.lat, point.long);
                if (point.distance) {
                  point.slope = (point.ele - previous.ele) / point.distance;
                }
                totalDistance += point.distance;
                point.totalDistance = totalDistance;
              }
              totalSlope += point.slope;
              rawValues.push(point);
              previous = point;
            });
          }
        });
      }
    });
  }
  return {
    name,
    description,
    rawValues,
    bElevationAdded,
    totalSlope,
    totalDistance,
  };
}
