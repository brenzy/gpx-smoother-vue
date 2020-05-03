<template>
  <main>
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
    <div class="instruct">2. Smooth the data:</div>
    <div class="smoother-input">
      <div class="input-row">
        <v-btn
          @click="onSmoothValues"
          :disabled="!canSmooth">
          Apply Box-Smoothing
        </v-btn>
        <v-text-field
          label="Number of points to smoother over(odd)"
          v-model="numSmoothingPoints"
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
          v-model="windowSize"
        />
        <v-text-field
          label="Derivative"
          v-model="derivative"
        />
        <v-text-field
          label="Polynomial (1 to 5)"
          v-model="polynomial"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onSetSlopeRange"
          :disabled="!canSmooth">
          Set Slope Range
        </v-btn>
        <v-text-field
          label="Minimum Slope"
          v-model="minSlope"
        />
        <v-text-field
          label="Maximum Slope"
          v-model="maxSlope"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onFlattenValues"
          :disabled="!canSmooth">
          Flatten Values
        </v-btn>
        <v-text-field
          label="Maximum Change In Slope Between Points:"
          v-model="slopeDelta"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onUpdateSlopePercentages"
          :disabled="!canSmooth">
          Slope Difficulty
        </v-btn>
        <v-text-field
          label="Percentage increase or decrease in slope"
          v-model="slopeShift"
        />
      </div>
      <div class="input-row">
        <v-btn
          @click="onElevateValues"
          :disabled="!canSmooth">
          Elevate Values
        </v-btn>
        <v-text-field
          label="Shift in metres up or down"
          v-model="metresShift"
        />
      </div>
      <v-btn
        @click="onResetData"
        :disabled="!haveSmoothedValues">
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
        :disabled="!haveSmoothedValues">
        Download
      </v-btn>
    </div>
  </main>
</template>

<script>
import store from '../store/store';
import {mapState} from 'vuex';
import Charts from '../components/Charts';
import {updateJson} from '../utilities/gpxFile';
import * as xml2js from 'xml2js';

export default {
  name: 'GpxSmoother',
  components: {Charts},
  data: () => ({
    gpxFile: null,
    numSmoothingPoints: 5,
    windowSize: 5,
    derivative: 0,
    polynomial: 3,
    metresShift: 100,
    slopeDelta: 1,
    slopeShift: 3,
    minSlope: 0,
    maxSlope: 8,
    gpxFileName: 'smoother.gpx',
    gpxName: '',
    gpxDescription: '',
    decreasePrecision: false,
    numLaps: 1
  }),
  computed: {
    ...mapState(['name', 'description', 'fileJson', 'smoothedValues']),
    ...mapState({
      isLoading: state => state.isLoading,
      loadError: state => state.loadError,
      canSmooth: state => (state.rawValues !== null && state.rawValues.length > 0),
      haveSmoothedValues: state => (state.rawValues !== null && state.smoothedValues !== null)
    }),
  },
  watch: {
    name(newValue) {
      this.gpxName = newValue;
    },
    description(newValue) {
      this.gpxDescription = newValue;
    }
  },
  methods: {
    onFileChange() {
      store.dispatch('load', this.gpxFile);
    },
    onSmoothValues() {
      store.dispatch('smooth', this.numSmoothingPoints);
    },
    onSavitzyGolay() {
      store.dispatch('savitzkyGolay',
        {windowSize: +this.windowSize, derivative: +this.derivative, polynomial: +this.polynomial});
    },
    onSetSlopeRange() {
      store.dispatch('slopeRange', {minSlope: this.minSlope, maxSlope: this.maxSlope});
    },
    onFlattenValues() {
      store.dispatch('flatten', this.slopeDelta);
    },
    onUpdateSlopePercentages() {
      store.dispatch('slopePercentage', this.slopeShift);
    },
    onElevateValues() {
      store.dispatch('elevate', this.metresShift);
    },
    onResetData() {
      store.dispatch('resetSmoothing');
    },
    download(filename, text) {
      // TODO: Investigate https://github.com/jimmywarting/StreamSaver.js
      var element = document.createElement('a');
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
        this.numLaps);
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
      align-items: start
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
