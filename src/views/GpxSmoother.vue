<template>
  <v-container fluid>
    <div class="instruct">1. Load a gpx file:</div>
    <div class="file-input">
      <v-file-input
        placeholder="Select a GPX file"
        label="Original GPX file"
        :loading="isLoading"
        accept=".gpx"
        v-model="gpxFile"
        @change="onFileChange"
        :error-messages="loadError"
      />
    </div>
    <div class="instruct">2. Click on an apply button to select the type of smoothing:</div>
    <div class="smoother-input">
      <div class="input-row">
        <v-btn
          @click="onSlopeSmoothing"
          :disabled="!canSmooth">
          Apply Slope Box-Smoothing
        </v-btn>
        <v-text-field
          label="Number of points to smoother over(odd)"
          v-model.number="numSlopeSmoothingPoints"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onSmoothValues"
          :disabled="!canSmooth">
          Apply Elevation Box-Smoothing
        </v-btn>
        <v-text-field
          label="Number of points to smoother over(odd)"
          v-model.number="numSmoothingPoints"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onSavitzyGolay"
          :disabled="!canSmooth">
          Apply Savitzky-Golay Smoothing
        </v-btn>
        <v-text-field
          label="Window Size (odd)"
          v-model.number="windowSize"
        />
        <v-text-field
          label="Derivative"
          v-model.number="derivative"
        />
        <v-text-field
          label="Polynomial (1 to 5)"
          v-model.number="polynomial"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onKalmanFilter"
          :disabled="!canSmooth">
          Apply Kalman Filter
        </v-btn>
        <v-text-field
          label="Process Noise (R)"
          v-model.number="kalmanR"
        />
        <v-text-field
          label="Measurement Noise (Q)"
          v-model.number="kalmanQ"
        />
        <v-checkbox
          label="Use Delta Slope"
          v-model="useDeltaSlope"
        ></v-checkbox>
      </div>
      <div class="input-row">
        <v-btn
          @click="onSetSlopeRange"
          :disabled="!canSmooth">
          Apply Slope Range
        </v-btn>
        <v-text-field
          label="Minimum Slope"
          v-model.number="minSlope"
        />
        <v-text-field
          label="Maximum Slope"
          v-model.number="maxSlope"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onFlattenValues"
          :disabled="!canSmooth">
          Apply Flatten Values
        </v-btn>
        <v-text-field
          label="Maximum Change In Slope Between Points:"
          v-model.number="slopeDelta"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onUpdateSlopePercentages"
          :disabled="!canSmooth">
          Apply Slope Difficulty
        </v-btn>
        <v-text-field
          label="Percentage increase or decrease in slope"
          v-model.number="slopeShift"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onElevateValues"
          :disabled="!canSmooth">
          Apply Elevate Values
        </v-btn>
        <v-text-field
          label="Shift in metres up or down"
          v-model.number="metresShift"
        />
      </div>
      <div class="input-row">
        <v-btn
            @click="onUpdateTimeIntervals"
            :disabled="!canSmooth">
          One second time intervals
        </v-btn>
        <v-text-field
            label="Percentage time shift"
            v-model.number="timeShift"
        />
      </div>
      <v-btn
        @click="onResetData"
        :disabled="!canSmooth">
        Reset the Data
      </v-btn>
    </div>

    <div class="instruct">3. Check out the resulting slope. Hover over a point to see details:</div>
    <Charts></Charts>

    <div class="instruct">4. Download to a new GPX file:</div>
    <div class="save-options">
      <v-text-field
        label="File Name"
        v-model="gpxFileName" />
      <v-text-field
        label="GPX Name"
        v-model="gpxName" />
      <v-text-field
        label="Description"
        v-model="gpxDescription" />
      <v-checkbox
        label="Decrease Precision"
        v-model="decreasePrecision"
      />
      <div class="input-row">
        <v-text-field
          label="Total Number of Laps"
          v-model="numLaps"
        />
      </div>
      <v-btn
        @click="onDownload"
        :disabled="!canSmooth">
        Download
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import store from '../store/store';
import {mapState} from 'vuex';
import Charts from '../components/Charts';
import {updateJson} from '@/utilities/gpxFile';
import * as xml2js from 'xml2js';
import {generateUUID} from '@/utilities/generateUUID';

export default {
  name: 'GpxSmoother',
  components: {Charts},
  data: () => ({
    gpxFile: null,
    numSmoothingPoints: 5,
    numSlopeSmoothingPoints: 5,
    windowSize: 5,
    derivative: 0,
    polynomial: 3,
    metresShift: 100,
    slopeDelta: .3,
    slopeShift: 3,
    minSlope: 0,
    maxSlope: 8,
    kalmanR: .01,
    kalmanQ: 3,
    timeShift: 100,
    useDeltaSlope: false,
    gpxFileName: 'smoother.gpx',
    gpxName: '',
    gpxDescription: '',
    decreasePrecision: false,
    numLaps: 1
  }),
  computed: {
    ...mapState(['selectedGpxFile', 'outputName', 'description', 'fileJson', 'selection', 'smoothedValues', 'saveTime']),
    ...mapState({
      isLoading: state => state.isLoading,
      loadError: state => state.loadError,
      canSmooth: state => (state.rawValues !== null && state.rawValues.length > 0),
    }),
  },
  watch: {
    outputName(newValue) {
      this.gpxName = newValue;
    },
    description(newValue) {
      this.gpxDescription = newValue;
    }
  },
  mounted() {
    this.gpxFile = this.selectedGpxFile;
  },
  activated() {
    this.gpxFile = this.selectedGpxFile;
  },
  methods: {
    onFileChange() {
      store.dispatch('load', this.gpxFile);
    },
    addOperation(name, parameters) {
      store.dispatch('addOperation', {
        name,
        ...parameters,
        selection: this.selection,
        enabled: true,
        id: generateUUID()
      });
    },
    onSlopeSmoothing() {
      this.addOperation('smoothSlope', {numberOfPoints: this.numSlopeSmoothingPoints});
    },
    onSmoothValues() {
      this.addOperation('smooth', {numberOfPoints: this.numSmoothingPoints});
    },
    onSavitzyGolay() {
      this.addOperation('savitzkyGolay', {windowSize: +this.windowSize, derivative: +this.derivative,
        polynomial: +this.polynomial});
    },
    onKalmanFilter() {
      this.addOperation('kalmanFilter', {R: this.kalmanR, Q: this.kalmanQ, useDeltaSlope: this.useDeltaSlope});
    },
    onSetSlopeRange() {
      this.addOperation('slopeRange', {range: {minSlope: this.minSlope, maxSlope: this.maxSlope}});
    },
    onFlattenValues() {
      this.addOperation('flatten', {slopeDelta: this.slopeDelta});
     },
    onUpdateSlopePercentages() {
      this.addOperation('slopePercentage', {slopeShift: this.slopeShift});
    },
    onElevateValues() {
      this.addOperation('elevate', {metres: this.metresShift});
    },
    onUpdateTimeIntervals() {
      this.addOperation('updateTimeIntervals', {timeShift: this.timeShift});
    },
    onResetData() {
      store.dispatch('resetSmoothing');
    },
    download(filename, text) {
      // TODO: Investigate https://github.com/jimmywarting/StreamSaver.js
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    onDownload() {
      if (!this.smoothedValues) {
        return;
      }
      const smoothedJson = JSON.parse(JSON.stringify(this.fileJson));
      updateJson(smoothedJson, this.gpxName, this.gpxDescription, this.smoothedValues, this.decreasePrecision,
        this.numLaps, this.saveTime);
      let builder = new xml2js.Builder();
      const smoothedGpx = builder.buildObject(smoothedJson);
      this.download(this.gpxFileName, smoothedGpx);
    }
  }
};
</script>
<style lang="sass">
  .instruct
    font-size: 20px
    margin: 10px

  .file-input
    margin: 20px
    .v-input__slot
      max-width: 600px

  .smoother-input
    margin: 20px 20px 20px 50px
    .v-input
      max-width: 250px
    .v-text-field > .v-input__control > .v-input__slot:before,
    .v-text-field > .v-input__control > .v-input__slot:after
      max-width: 100px
    .v-text-field input
      max-width: 100px
    .input-row
      display: flex
      align-items: flex-start
      min-height: 70px
      .v-input
        margin-left: 20px
      .v-button
        margin-top: 10px

  .average-slope
    margin-left: 23px

  .save-options
    margin: 20px
    .v-input__slot
      max-width: 600px

</style>
