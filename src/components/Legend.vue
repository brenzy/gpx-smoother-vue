<template>
  <div class="legend">
    <div class="original">
      <div class="line-legend">
        <div>Original</div>
        <div class="swatch"></div>
      </div>
      <div>
        <div class="average-label">Average Slope:</div>
        <div class="raw-slope">{{formattedRawAverage}}</div>
      </div>
    </div>
    <div class="modified">
      <div class="line-legend">
        <div>New</div>
        <div class="swatch"></div>
      </div>
      <div>
        <div class="average-label">Average Slope:</div>
        <div class="smoothed-slope">{{formattedSmoothedAverage}}</div>
      </div>

    </div>
    <div class="slope-legend-wrapper" v-show="graphType === graphTypes.ELEVATION_PROFILE">
      <div class="slope-label">Slope</div>
      <div class="slope-colormap"></div>
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import {GraphType} from './chartModel';
  import {mapState} from 'vuex';

  export default {
    name: 'Legend',
    props: {
      graphType: String,
      colorScale: Function
    },
    data: () => ({
      graphTypes: GraphType,
      formattedRawAverage: '',
      formattedSmoothedAverage: ''
    }),
    computed: {
      ...mapState(['rawAverageSlope', 'smoothedAverageSlope']),
    },
    watch: {
      rawAverageSlope() {
        this.formattedRawAverage = this.rawAverageSlope ? `${this.rawAverageSlope}%` : '';
      },
      smoothedAverageSlope() {
        this.formattedSmoothedAverage = this.smoothedAverageSlope ? `${this.smoothedAverageSlope}%` : '';
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.legend();
      });
    },
    methods: {
      legend() {
        let legendContainer = d3.select('.slope-colormap');
        let width = parseInt(legendContainer.style('width'));
        let height = parseInt(legendContainer.style('height'));
        let xLegend = d3.scaleLinear()
          .domain([-25, 25])
          .range([0, width]);
        let xAxisLegend = d3.axisBottom()
          .scale(xLegend)
          .tickSize(13)
          .tickValues(this.colorScale.domain());
        let svgLegend = d3.select('.slope-colormap').append('svg')
          .attr('width', width)
          .attr('height', height);
        let g = svgLegend.append('g')
          .attr('class', 'key');
        g.selectAll('rect')
          .data(this.colorScale.range().map(color => {
            let d = this.colorScale.invertExtent(color);
            if (d[0] === null || d[0] === undefined) d[0] = xLegend.domain()[0];
            if (d[1] === null || d[1] === undefined) d[1] = xLegend.domain()[1];
            return d;
          }))
          .enter().append('rect')
          .attr('height', 8)
          .attr('x', d => {
            return xLegend(d[0]);
          })
          .attr('width', d => {
            return xLegend(d[1]) - xLegend(d[0]);
          })
          .style('fill', d => {
            return this.colorScale(d[0]);
          });
        g.call(xAxisLegend);
        let bBox = svgLegend.select('.key').node().getBBox();
        g.attr('transform', 'translate(0,' + (bBox.height / 2) + ')');
      },
    }
  };
</script>

<style lang="sass" scoped>

  .legend
    display: flex
    font-size: 20px
    margin: 10px 40px

    .swatch
      width: 40px
      height: 4px
      margin-right: 16px
      margin-left: 16px

    .line-legend
      display: flex
      align-items: center

    .average-slope
      margin: 0 40px 10px
      font-size: 20px

    .average-label
      display: inline-block

    .raw-slope,
    .smoothed-slope
      display: inline-block
      min-width: 60px
      margin-left: 16px

    .smoothed-slope
      color: green

    .raw-slope
      color: blue

    .modified .swatch
      background-color: green

    .original .swatch
      background-color: blue

    .legend .original,
    .legend .modified
      margin-right: 20px
      display: inline-block

    .slope-legend-wrapper
      display: flex

    .slope-label
      margin-right: 16px

    .slope-colormap
      width: 200px
      align-self: center
      margin-right: 20px

    .key path
      display: none

    .key line
      stroke: #000
      shape-rendering: crispEdges

    .key .tick
      font-size: 12px

</style>
