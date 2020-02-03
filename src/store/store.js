import Vue from 'vue';
import Vuex from 'vuex';
import {LOAD_ERRORS, parseJson} from '../utilities/gpxFile';

Vue.use(Vuex);

const getDefaultState = () => {
  return {
    isLoading: false,
    loadError: null,
    fileJson: null,
    name: null,
    description: null,
    rawValues: null,
    bElevationAdded: false,
    totalSlope: null,
    totalDistance: null,
    selection: null // Selection is an array containing [startDistance, endDistance]
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
    }
  },
  mutations: {
    clear (state) {
      Object.assign(state, getDefaultState());
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
      state.name = fileInfo.name;
      state.description = fileInfo.description;
      state.rawValues = fileInfo.rawValues;
      state.bElevationAdded = fileInfo.bElevationAdded;
      state.totalSlope = fileInfo.totalSlope;
      state.totalDistance = fileInfo.totalDistance;
    },
    setSelection(state, selection) {
      state.selection = selection;
    }
  }
});
