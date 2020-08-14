import Vue from 'vue';
import Vuex from 'vuex';
import {LOAD_ERRORS, parseJson} from '@/utilities/gpxFile';
import {boxSmoothing} from '@/utilities/boxSmoothing';
import {elevatePoints} from '@/utilities/elevatePoints';
import {setSlopeRange} from '@/utilities/setSlopeRange';
import {flattenPoints} from '@/utilities/flattenPoints';
import {savitzkyGolay} from '@/utilities/savitzkyGolay';
import {shiftSlope} from '@/utilities/shiftSlope';
import {kalmanFilter} from '@/utilities/kalmanFilter';
import {slopeSmoothing} from '@/utilities/slopeSmoothing';

Vue.use(Vuex);

const getDefaultState = () => {
  return {
    appVersion: process.env.VUE_APP_VERSION || 0,
    selectedGpxFile: null,
    isLoading: false,
    loadError: null,
    fileJson: null,
    outputName: null,
    description: null,
    rawValues: null,
    smoothedValues: null,
    bElevationAdded: false,
    totalDistance: null,
    rawAverageSlope: null,
    smoothedAverageSlope: null,
    selection: null, // Selection is an array containing [startDistance, endDistance]
  };
};

export default new Vuex.Store({
  state: getDefaultState(),
  actions: {
    clear(context) {
      context.commit('clear');
    },
    load(context, gpxFile) {
      context.commit('clear', true);
      if (!gpxFile || gpxFile.length === 0) {
        return;
      }
      context.commit('setIsLoading', true);
      const reader = new FileReader();
      reader.onload = () => {
        let xml = reader.result;
        let parser = require('xml2js').Parser({parseNumbers: true});
        parser.parseString(xml, function (err, json) {
          if (err || !json) {
            console.error(err);
            context.commit('setLoadError', LOAD_ERRORS.INVALID_FILE_FORMAT);
            return;
          }
          try {
            let fileInfo = parseJson(json);
            context.commit('setGpxFile', gpxFile);
            context.commit('setFileJson', json);
            context.commit('setFileInfo', fileInfo);
            context.commit('setIsLoading', false);
          }
          catch (error) {
            if (typeof(error) === 'string') {
              context.commit('setLoadError', error);
            } else {
              console.error(error);
              context.commit('setLoadError', LOAD_ERRORS.INVALID_FILE_FORMAT);
            }
          }
        });
      };
      reader.onerror = function(event) {
        console.error('File could not be read! Code ' + event.target.error.code);
        context.commit('setLoadError', LOAD_ERRORS.LOAD_ERROR);
      };
      reader.readAsText(gpxFile);
    },
    select(context, selection) {
      context.commit('setSelection', selection);
    },
    smooth(context, numberOfPoints) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = boxSmoothing(toSmooth, numberOfPoints, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    smoothSlope(context, numberOfPoints) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = slopeSmoothing(toSmooth, numberOfPoints, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    savitzkyGolay(context, options) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = savitzkyGolay(toSmooth, options, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    kalmanFilter(context, options) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = kalmanFilter(toSmooth, options, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    slopeRange(context, range) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = setSlopeRange(toSmooth, range, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    flatten(context, slopeDelta) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = flattenPoints(toSmooth, slopeDelta, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    slopePercentage(context, slopeShift) {
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = shiftSlope(toSmooth, slopeShift, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    elevate(context, metres) {
      const toElevate = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      const smoothedValues = elevatePoints(toElevate, metres, context.state.selection);
      context.commit('setSmoothedValues', smoothedValues);
    },
    resetSmoothing(context) {
      context.commit('resetSmoothing');
    }
  },
  mutations: {
    clear (state) {
      Object.assign(state, getDefaultState());
    },
    setGpxFile (state, gpxFile) {
      state.selectedGpxFile = gpxFile;
    },
    setIsLoading (state, isLoading) {
      state.isLoading = isLoading;
    },
    setLoadError(state, loadError) {
      state.loadError = loadError;
      state.isLoading = false;
    },
    setFileJson(state, fileJson) {
      state.fileJson = fileJson;
    },
    setFileInfo(state, fileInfo) {
      state.outputName = fileInfo.name;
      state.description = fileInfo.description;
      state.rawValues = fileInfo.rawValues;
      state.bElevationAdded = fileInfo.bElevationAdded;
      state.rawAverageSlope = fileInfo.averageSlope;
      state.totalDistance = fileInfo.totalDistance;
    },
    setSelection(state, selection) {
      state.selection = selection;
    },
    setSmoothedValues(state, smoothedValues) {
      state.smoothedAverageSlope = smoothedValues.averageSlope;
      state.smoothedValues = smoothedValues.smoothedValues;
    },
    resetSmoothing(state) {
      state.selection = null;
      state.smoothedAverageSlope = null;
      state.smoothedValues = null;
    }
  }
});
