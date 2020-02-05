<template>
  <section id="charts">
    <v-btn-toggle class="chart-type-group"
                  v-model="graphType"
                  mandatory>
      <v-btn :value="graphTypes.ELEVATION_DISTANCE">Elevation Chart</v-btn>
      <v-btn :value="graphTypes.SLOPE_DISTANCE">Slope Chart</v-btn>
      <v-btn :value="graphTypes.ELEVATION_PROFILE">Elevation Profile</v-btn>
    </v-btn-toggle>
    <DistanceChart
      :graph-type="graphType"
      :color-scale="colorScale"
    ></DistanceChart>
    <Legend
      :graph-type="graphType"
      :color-scale="colorScale"
    ></Legend>
    <SelectionChart
      :graph-type="graphType"
    ></SelectionChart>
  </section>
</template>

<script>
  import {GraphType} from './chartModel';
  import SelectionChart from './SelectionChart';
  import DistanceChart from './DistanceChart';
  import * as d3 from 'd3';
  import Legend from './Legend';

  export default {
    name: 'Charts',
    components: {SelectionChart, DistanceChart, Legend},
    data: () => ({
      graphType: GraphType.ELEVATION_DISTANCE,
      graphTypes: GraphType,
      colorScale: null
    }),
    mounted() {
      this.colorScale = d3.scaleThreshold()
        .domain([-20, -15, -10, -5, 0, 5, 10, 15, 20])
        .range(['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']);
    },
    methods: {}
  };
</script>

<style lang="sass" scoped>
  .chart-type-group
    margin: 20px
</style>
