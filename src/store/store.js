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
import {updateTimeIntervals} from '@/utilities/updateTimeIntervals';

Vue.use(Vuex);

const getDefaultState = () => {
  return {
    redoStack: [],
    appVersion: process.env.VUE_APP_VERSION || 0,
    selectedGpxFile: null,
    isLoading: false,
    isSmoothingInProgress: false,
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
    saveTime: false,
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
    addOperation(context, operation) {
      context.commit('addOperation', operation);
      context.dispatch('doOperation', operation);
    },
    async doOperation(context, operation) {
      if (!operation.enabled) {
        return;
      }
      const toSmooth = context.state.smoothedValues ? context.state.smoothedValues : context.state.rawValues;
      let smoothedValues;
      switch (operation.name) {
        case 'smooth': {
          smoothedValues = boxSmoothing(toSmooth, operation.numberOfPoints, operation.selection);
          break;
        }
        case 'smoothSlope': {
          smoothedValues = slopeSmoothing(toSmooth, operation.numberOfPoints, operation.selection);
          break;
        }
        case 'savitzkyGolay': {
          smoothedValues = savitzkyGolay(toSmooth, operation, operation.selection);
          break;
        }
        case 'kalmanFilter': {
          smoothedValues = kalmanFilter(toSmooth, operation, operation.selection);
          break;
        }
        case 'slopeRange': {
          smoothedValues = setSlopeRange(toSmooth, operation.range, operation.selection);
          break;
        }
        case 'flatten': {
          smoothedValues = flattenPoints(toSmooth, operation.slopeDelta, operation.selection);
          break;
        }
        case 'slopePercentage': {
          smoothedValues = shiftSlope(toSmooth, operation.slopeShift, operation.selection);
          break;
        }
        case 'elevate': {
          smoothedValues = elevatePoints(toSmooth, operation.metres, operation.selection);
          break;
        }
        case 'updateTimeIntervals': {
          context.commit('saveTime', true);
          smoothedValues = updateTimeIntervals(toSmooth,
            context.state.smoothedAverageSlope ? context.state.smoothedAverageSlope : context.state.rawAverageSlope);
          break;
        }
      }
      context.commit('setSmoothedValues', smoothedValues);
    },
    async doOperations(context) {
      context.commit('resetSmoothingData');
      for (let index = 0; index < context.state.redoStack.length; index++) {
        await context.dispatch('doOperation', context.state.redoStack[index]);
      }
      context.commit('endSmoothing');
    },
    async redoOperations(context) {
      context.commit('startSmoothing');
      // A web-worker would be an improvement over a set-timeout here
      setTimeout(() => {
        context.dispatch('doOperations');
      });
    },
    toggleOperation(context, operation) {
      context.commit('toggleOperation', operation);
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
      state.bTimeAdded = fileInfo.bTimeAdded;
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
    saveTime(state, bSave) {
      state.saveTime = bSave;
    },
    resetSmoothing(state) {
      state.selection = null;
      state.smoothedAverageSlope = null;
      state.smoothedValues = null;
      state.redoStack = [];
    },
    resetSmoothingData(state) {
      state.smoothedAverageSlope = null;
      state.smoothedValues = null;
    },
    addOperation(state, operation) {
      state.redoStack.push(operation);
    },
    toggleOperation(state, operation) {
      // find the operation in the redoStack
      const operationIndex = state.redoStack.findIndex(element => element.id === operation.id);
      const toggled = {
        ...operation,
        enabled: !operation.enabled
      };
      Vue.set(state.redoStack, operationIndex, toggled);
    },
    startSmoothing(state) {
      state.isSmoothingInProgress = true;
    },
    endSmoothing(state) {
      state.isSmoothingInProgress = false;
    }
  }
});
