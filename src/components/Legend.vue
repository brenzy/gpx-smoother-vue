<template>
  <div class="legend">
    <div class="slope-legend-wrapper">
      <div v-show="graphType === graphTypes.ELEVATION_PROFILE">
        <div class="slope-label">Slope: </div>
        <div class="slope-colormap"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import {GraphType} from './chartModel';

  export default {
    name: 'Legend',
    props: {
      graphType: String,
      colorScale: Function
    },
    data: () => ({
      graphTypes: GraphType
    }),
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

<style lang="sass">

  .legend
    margin: 0 40px 20px
    font-size: 20px
    height: 60px

  .legend .swatch
    width: 40px
    height: 4px
    display: inline-block
    margin-bottom: 6px
    margin-right: 10px

  .modified .swatch
    background-color: green

  .original .swatch
    background-color: blue

  .legend .original,
  .legend .modified
    margin-right: 20px
    display: inline-block

  .slope-legend
    display: inline-block

  .slope-legend-wrapper
    display: inline-block
    height: 60px
    line-height: 60px

  .slope-label
    display: inline-block
    margin-right: 10px
    line-height: 40px
    height: 40px

  .slope-colormap
      width: 200px
      height: 40px
      display: inline-block
      vertical-align: middle
      margin-left: 0
      margin-right: 20px

  .slope-colormap svg
      padding-top: 10px

  .key path
    display: none

  .key line
    stroke: #000
    shape-rendering: crispEdges

  .key .tick
    font-size: 12px

</style>
