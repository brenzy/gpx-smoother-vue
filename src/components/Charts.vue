<template>
  <section id="charts">
    <v-radio-group  class="units-group"
                    v-model="graphUnits"
                    row>
      <v-radio label="Metric" value="metric"></v-radio>
      <v-radio label="Imperial" value="imperial"></v-radio>
    </v-radio-group>
    <v-btn-toggle class="chart-type-group"
                  v-model="graphType"
                  mandatory>
      <v-btn :value="graphTypes.ELEVATION_DISTANCE">Elevation Chart</v-btn>
      <v-btn :value="graphTypes.SLOPE_DISTANCE">Slope Chart</v-btn>
      <v-btn :value="graphTypes.ELEVATION_PROFILE">Elevation Profile</v-btn>
    </v-btn-toggle>
    <div class="distance-chart">
      <DistanceChart
          v-if="isActive"
          :graph-type="graphType"
          :color-scale="colorScale"
          :graph-units="graphUnits"
          :selection="selection"
      ></DistanceChart>
    </div>
    <Legend
      :graph-type="graphType"
      :color-scale="colorScale"
    ></Legend>
    <SelectionChart
      v-if="isActive"
      :graph-type="graphType"
      :graph-units="graphUnits"
    ></SelectionChart>
  </section>
</template>

<script>
  import {GraphType} from './chartModel';
  import SelectionChart from './SelectionChart';
  import DistanceChart from './DistanceChart';
  import * as d3 from 'd3';
  import Legend from './Legend';
  import {UnitType} from '@/components/chartModel';
  import {mapState} from 'vuex';

  export default {
    name: 'Charts',
    components: {SelectionChart, DistanceChart, Legend},
    data: () => ({
      isActive: false,
      graphType: GraphType.ELEVATION_DISTANCE,
      graphTypes: GraphType,
      colorScale: null,
      graphUnits: UnitType.METRIC
    }),
    computed: {
      ...mapState(['selection']),
    },
    mounted() {
      if (localStorage.graphUnits) {
        this.graphUnits = localStorage.graphUnits === UnitType.IMPERIAL ? UnitType.IMPERIAL : UnitType.METRIC ;
      }
      this.colorScale = d3.scaleThreshold()
        .domain([-20, -15, -10, -5, 0, 5, 10, 15, 20])
        .range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']);
    },
    activated() {
      this.isActive = true;
    },
    deactivated() {
      this.isActive = false;
    },
    watch: {
      graphUnits(newGraphUnits) {
        localStorage.graphUnits = newGraphUnits;
      }
    },
    methods: {}
  };
</script>

<style lang="sass" scoped>
  .units-group
    margin: 20px 20px 0 20px
  .chart-type-group
    margin: 0 0 20px 20px
  .distance-chart
    height: 500px
</style>
