import {distVincenty} from './vincentyFormula';
import {averageSlopeFromTotal} from './displayFormat';

const DEFAULT_NAME = 'Smoothed Ride';
const DEFAULT_DESCRIPTION = 'Created by running the ride through a smoothing algorithm.';
export const LOAD_ERRORS =  {
  MISSING_LAT_LONG: 'Missing latitude and/or longitude values.',
  INVALID_FILE_FORMAT: 'Invalid GPX file format.',
  LOAD_ERROR: 'Error reading the GPX file.'
};

export const SAVE_ERRORS =  {
  SAVE_ERROR: 'Error saving the GPX file.'
};

export function parseJson(jsonRoot) {
  if (!jsonRoot) {
    throw (LOAD_ERRORS.INVALID_FILE_FORMAT);
  }

  let gpxNode = jsonRoot.gpx;
  if (!gpxNode) {
    throw (LOAD_ERRORS.INVALID_FILE_FORMAT);
  }

  const metadata = gpxNode.metadata && gpxNode.metadata.length ? gpxNode.metadata[0] : null;
  const name = metadata && metadata.name && metadata.name.length ? metadata.name[0] : DEFAULT_NAME;
  const description = metadata && metadata.desc && metadata.desc.length ? metadata.desc[0] : DEFAULT_DESCRIPTION;

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
    averageSlope: averageSlopeFromTotal(totalSlope, rawValues.length),
    totalDistance,
  };
}

export function updateJson(jsonRoot, name, desc, newValues, decreasePrecision, laps) {
  if (!jsonRoot) {
    throw (SAVE_ERRORS.SAVE_ERROR);
  }

  let gpxNode = jsonRoot.gpx;
  if (!gpxNode) {
    throw (SAVE_ERRORS.SAVE_ERROR);
  }

  // Add the name and description to the metadata
  let metadata = gpxNode.metadata && gpxNode.metadata.length ? gpxNode.metadata[0] : null;
  if (!metadata) {
    metadata = [{name: [name], desc: [desc]}];
    jsonRoot.gpx = {
      metadata,
      ...gpxNode,
    };
  } else {
    metadata.name = [name];
    metadata.desc = [desc];
  }

  let currentPointIndex = 0;
  if (gpxNode.trk) {
    gpxNode.trk.forEach((trk) => {
      if (trk.trkseg) {
        trk.trkseg.forEach((trkseg) => {
          if (trkseg.trkpt) {
            trkseg.trkpt.forEach((trkpt) => {
              if (currentPointIndex > newValues.length) {
                throw (SAVE_ERRORS.SAVE_ERROR);
              }
              let point = newValues[currentPointIndex++];
              if (!trkpt.$ || !trkpt.$.lat || !trkpt.$.lon) {
                throw (SAVE_ERRORS.SAVE_ERROR);
              }
              let lat = Number(trkpt.$.lat);
              let long = Number(trkpt.$.lon);
              if (lat !== point.lat || long !== point.long ) {
                throw (SAVE_ERRORS.SAVE_ERROR);
              }
              if (decreasePrecision) {
                trkpt.$.lat = Math.floor(point.lat * 100000) / 100000;
                trkpt.$.lon = Math.floor(point.long * 100000) / 100000;
              }
              if (trkpt.ele && trkpt.ele.length) {
                trkpt.ele = [decreasePrecision ? Math.floor(point.ele * 100) / 100 : point.ele];
              }
            });
            if (laps > 1) {
              const originalLength = trkseg.trkpt.length;
              for (let lapIndex = 1; lapIndex < laps; lapIndex++) {
                for (let trkIndex = 0; trkIndex < originalLength; trkIndex++) {
                  let newTrkpt = JSON.parse(JSON.stringify(trkseg.trkpt[trkIndex]));
                  trkseg.trkpt.push(newTrkpt);
                }
              }
            }
          }
        });
      }
    });
  }
}
