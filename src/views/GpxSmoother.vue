<template>
  <main>
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
    <div class="smoother-input">
      <div class="input-row">
        <v-btn
          @click="onSmoothValues"
          :disabled="!canSmooth">
          Smooth Values
        </v-btn>
        <v-text-field
          label="Number of points to smoother over(odd)"
          v-model="numSmoothingPoints"
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
        :disabled="!canReset">
        Reset the Data
      </v-btn>
    </div>

    <Charts></Charts>
  </main>
</template>

<script>
import store from '../store/store';
import {mapState} from 'vuex';
import Charts from '../components/Charts';

export default {
  name: 'GpxSmoother',
  components: {Charts},
  data: () => ({
    gpxFile: null,
    numSmoothingPoints: 5,
    metresShift: 1000,
    slopeDelta: 1,
    minSlope: 0,
    maxSlope: 8
  }),
  computed: {
    ...mapState({
      isLoading: state => state.isLoading,
      loadError: state => state.loadError,
      canSmooth: state => (state.rawValues !== null && state.rawValues.length > 0),
      canReset: state => (state.rawValues !== null && state.smoothedValues !== null)
    })
  },
  methods: {
    onFileChange() {
      store.dispatch('load', this.gpxFile);
    },
    onSmoothValues() {
      store.dispatch('smooth', this.numSmoothingPoints);
    },
    onSetSlopeRange() {
      store.dispatch('slopeRange', {minSlope: this.minSlope, maxSlope: this.maxSlope});
    },
    onFlattenValues() {
      store.dispatch('flatten', this.slopeDelta);
    },
    onElevateValues() {
      store.dispatch('elevate', this.metresShift);
    },
    onResetData() {
      store.dispatch('resetSmoothing');
    }
  }
};
</script>
<style lang="sass">
  .file-input
    margin: 20px
    .v-input__slot
      max-width: 600px

  .smoother-input
    margin: 20px 20px 20px 50px
    .v-input
      max-width: 400px
    .v-text-field > .v-input__control > .v-input__slot:before,
    .v-text-field > .v-input__control > .v-input__slot:after
      max-width: 100px
    .v-text-field input
      max-width: 100px
    .input-row
      display: flex
      align-items: start
      max-width: 600px
      .v-input
        margin-left: 20px

</style>
