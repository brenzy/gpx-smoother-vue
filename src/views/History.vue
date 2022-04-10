<template>
  <div class="history-view">
    <h1>Smoothing Operations History</h1>
    <div class="history-stack">
        <ul v-if="redoStack && redoStack.length">
          <li class="operation" v-for="operation of redoStack" v-bind:key="operation.id">
            <v-checkbox color="black" input-value="operation.enabled" v-on:click="onClick(operation)">
              <template v-slot:label>
                {{ getOperationDescription(operation) }}
              </template>
            </v-checkbox>
          </li>
        </ul>
      <div v-else class="empty-stack">
        The operations stack is empty.
      </div>
    </div>
    <div class="chart-footer">
      <v-card class="chart-section"
              elevation="24"
              outlined>
          <v-btn-toggle class="chart-type-group"
                        v-model="graphType"
                        mandatory>
            <v-btn :value="graphTypes.ELEVATION_DISTANCE">Elevation Chart</v-btn>
            <v-btn :value="graphTypes.SLOPE_DISTANCE">Slope Chart</v-btn>
            <v-btn :value="graphTypes.ELEVATION_PROFILE">Elevation Profile</v-btn>
          </v-btn-toggle>
          <div class="history-chart">
            <DistanceChart
                v-if="isActive"
                :graph-type="graphType"
                :color-scale="colorScale"
                :graph-units="graphUnits"
            ></DistanceChart>
          </div>
          <Legend
              :graph-type="graphType"
              :color-scale="colorScale"
          ></Legend>
      </v-card>
    </div>
  </div>
</template>
<script>
import {mapState} from 'vuex';
import store from '@/store/store';
import {GraphType, UnitType} from '@/components/chartModel';
import DistanceChart from '@/components/DistanceChart';
import Legend from '@/components/Legend';
import * as d3 from 'd3';

export default {
  name: 'History',
  components: {DistanceChart, Legend},
  computed: {
    ...mapState(['redoStack']),
  },
  data: () => ({
    isActive: false,
    graphType: GraphType.ELEVATION_DISTANCE,
    graphTypes: GraphType,
    colorScale: null,
    graphUnits: UnitType.METRIC
  }),
  activated() {
    this.isActive = true;
  },
  deactivated() {
    this.isActive = false;
  },
  mounted() {
    this.colorScale = d3.scaleThreshold()
        .domain([-20, -15, -10, -5, 0, 5, 10, 15, 20])
        .range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']);
  },
  methods: {
    onClick(operation) {
      store.dispatch('toggleOperation', operation);
      store.dispatch('redoOperations');
    },
    getOperationDescription(operation) {
      switch (operation.name) {
        case 'smoothSlope': {
          return `Slope Box Smoothing: Smoothed over ${operation.numberOfPoints} Points`;
        }
        case 'smooth': {
          return `Elevation Box Smoothing: Smoothed over ${operation.numberOfPoints} Points`;
        }
        case 'savitzkyGolay': {
          return `Savitzky Golay Smoothing: Window Size: ${operation.windowSize}, Derivative: ${operation.derivative}, ` +
              `Polynomial:  ${operation.polynomial}`;
        }
        case 'kalmanFilter': {
          return `Kalman Filter: R: ${operation.R}, Q: ${operation.Q}, Use Delta Slope:  ` +
              (operation.useDeltaSlope ? 'true' : 'false');
         }
        case 'slopeRange': {
          return `Slope Range: Minimum Slope: ${operation.range.minSlope},  Maximum Slope: ${operation.range.maxSlope}`;
        }
        case 'flatten': {
          return `Flatten Values:  Maximum Change in Slope Between Points:  ${operation.slopeDelta}`;
        }
        case 'slopePercentage': {
          return `Slope Difficulty: Percentage slope change: ${operation.slopeShift}`;
        }
        case 'elevate': {
          return `Elevate Values: Shift in metres: ${operation.metres}`;
        }
        case 'updateTimeIntervals': {
          const timeShift = parseInt(1000.0 / (operation.timeShift / 100.0), 10);
          return `Time interval of each point is 1 second shifted by ${operation.timeShift} percent (${timeShift} ms)`;
        }
      }
    }
  }
};
</script>
<style lang="sass" scoped>
  .history-view h1
    margin-top: 20px
    margin-left: 20px

  .history-stack
    margin: 20px

  .operation
    list-style-type: none

  .chart-type-group
    margin-top: 20px
    margin-left: 20px

  .history-chart
    height: 200px

  .chart-footer
    position: sticky
    bottom: 20px
    background: white
    margin-top: 20px

    .chart-section
      margin: 20px

  .empty-stack
    margin: 20px
    font-size: 20px
</style>
