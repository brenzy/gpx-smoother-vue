<template>
  <div>
    <div id="mini"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import {mapState} from 'vuex';
import {GraphType} from './chartModel';
import store from '../store/store';

export default {
  name: 'SelectionChart',
  props: {
    graphType: String
  },
  data: () => ({
    dimensions: null,
    width: null,
    height: null,
    margin: null,
    xScale: null,
    miniDimensions: null,
    miniHeight: null,
    miniSvg: null,
    miniXScale: null,
    miniYScale: null,
    brush: null,
    gBrush: null,
    miniElevationLine: null,
    miniSlopeLine: null,
    miniXAxis: null,
    miniYAxis: null,
    displayOriginal: true,
    handle: null,
    xExtents: null
  }),
  mounted() {
    window.addEventListener('resize', this.resize);
    this.initializeChart();
  },
  computed: mapState(['rawValues', 'selection']),
  watch: {
    rawValues(newValue) {
      if (newValue && newValue.length) {
        this.setLine(newValue, 'original', false);
      } else {
        this.reset();
      }
    },
    graphType: function() {
      this.reset();
      if (this.rawValues) {
        this.setLine(this.rawValues, 'original', true);
      }
    },
    selection: function(newValue) {
      this.drawSelectionHandles(newValue);
    }
  },
  methods: {
    yAxisText() {
      return this.graphType === GraphType.SLOPE_DISTANCE
        ? 'Slope (%)'
        : 'Elevation (m)';
    },
    setDimensions() {
      this.dimensions = {
        width: parseInt(d3.select('#mini').style('width')),
        height: parseInt(d3.select('#mini').style('height'))
      };
      this.miniDimensions = {width: this.dimensions.width, height: 200};

      this.width = this.dimensions.width - this.margin.left - this.margin.right;
      this.height =
        this.dimensions.height - this.margin.top - this.margin.bottom;

      this.miniHeight =
        this.miniDimensions.height - this.margin.top - this.margin.bottom;
      this.miniSvg.attr('width', this.dimensions.width);
      this.miniSvg.attr('height', this.miniDimensions.height);
    },
    resize() {
      // If the chart is hidden, don't bother to redraw it
      if (d3.select('#mini').node().clientWidth === 0) {
        return;
      }

      // Define responsive behavior
      this.setDimensions();

      // Update the range of the scale with new width/height
      this.xScale.range([0, this.width]);
      this.miniXScale.range([0, this.width]);
      this.miniYScale.range([this.miniHeight, 0]);

      // Update the mini graph
      this.miniSvg
        .select('.x.axis')
        .attr('transform', 'translate(0,' + this.miniHeight + ')');
      this.miniSvg.select('.x.axis').call(this.miniXAxis);
      this.miniSvg.select('.y.axis').call(this.miniYAxis);
      this.miniSvg.select('.x.label').attr('x', this.width);
      this.miniSvg
        .selectAll('path.elevation')
        .attr('d', this.miniElevationLine);
      this.miniSvg.selectAll('path.slope').attr('d', this.miniSlopeLine);

      // Update the brush (which will redraw the svg graph
      this.brush.extent([
        [0, 0],
        [this.width, this.miniHeight]
      ]);
      this.gBrush.call(this.brush);
      this.gBrush.call(this.brush.move, this.selection.map(this.miniXScale));
    },
    draw() {
      this.miniSvg.select('.x.axis').call(this.miniXAxis);
      this.miniSvg.select('.y.axis').call(this.miniYAxis);
      this.miniSvg
        .selectAll('path.elevation')
        .attr('d', this.miniElevationLine);
      this.miniSvg.selectAll('path.slope').attr('d', this.miniSlopeLine);
    },
    drawSelectionHandles(selection) {
      if (!selection) {
        return;
      }
      let handleRange = selection.map(this.miniXScale);
      this.handle.attr('display', null).attr('transform', (d, i) => {
        let handleOffset = 5;
        let rotate = 90;
        let xOffset = handleRange[i] + handleOffset;
        if (i === 0) {
          xOffset = handleRange[i] - handleOffset;
          rotate = rotate * -1;
        }
        return (
          'translate(' +
          xOffset +
          ',' +
          this.miniHeight / 2 +
          ') rotate(' +
          rotate +
          ')'
        );
      });
    },
    defaultYExtent() {
      return this.graphType === GraphType.SLOPE_DISTANCE
        ? [-20, 20]
        : [0, 1400];
    },
    reset() {
      this.miniYLabel.text(this.yAxisText());
      this.miniSvg.selectAll('path.elevation').remove();
      this.miniSvg.selectAll('path.slope').remove();
      let yExtent = this.defaultYExtent();
      this.miniYScale.domain(yExtent);
      this.draw();
    },
    brushed() {
      if (d3.event && d3.event.selection) {
        const newSelection = d3.event.selection.map(this.miniXScale.invert);
        store.dispatch('select', newSelection);
      }
    },
    onSelectionChanged() {
      this.drawSelectionHandles(this.selection);
    },
    createProfileLine(linePoints, lineType) {
      this.miniLines
        .append('path')
        .attr('class', 'elevation ' + lineType)
        .datum(linePoints)
        .attr('d', this.miniElevationLine);
    },
    createSlopeLine(linePoints, lineType) {
      this.miniLines
        .append('path')
        .attr('class', 'slope ' + lineType)
        .datum(linePoints)
        .attr('d', this.miniSlopeLine);
    },
    createElevationLine(linePoints, lineType) {
      this.miniLines
        .append('path')
        .attr('class', 'elevation ' + lineType)
        .datum(linePoints)
        .attr('d', this.miniElevationLine);
    },
    setLine(points, lineType, maintainSelection) {
      const lines = [];
      lines.push(points);
      let allPoints = [];
      let length = lines.length;
      for (let line = 0; line < length; line++) {
        allPoints = allPoints.concat(lines[line]);
      }
      if (lineType === 'original') {
        this.xExtents = d3.extent(allPoints, d => {
          return d.totalDistance;
        });
        this.miniXScale.domain(this.xExtents);
      } else {
        this.miniSvg.selectAll('path.' + lineType).remove();
      }
      let yExtent = d3.extent(allPoints, d => {
        if (this.graphType === GraphType.SLOPE_DISTANCE) {
          return parseInt((d.slope * 1000).toString()) / 10;
        } else {
          return d.ele;
        }
      });
      if (yExtent[0] === yExtent[1]) {
        if (yExtent[0] > 0) {
          yExtent = [0, yExtent[1]];
        } else if (yExtent[0] < 0) {
          yExtent = [yExtent[0], 0];
        } else {
          yExtent = this.defaultYExtent();
        }
      }
      this.miniYScale.domain(yExtent);

      if (!maintainSelection) {
        this.gBrush.call(this.brush.move, this.xScale.range());
      }

      if (this.graphType === GraphType.ELEVATION_PROFILE)
        this.createProfileLine(points, lineType);
      else if (this.graphType === GraphType.SLOPE_DISTANCE)
        this.createSlopeLine(points, lineType);
      else this.createElevationLine(points, lineType);

      if (lineType === 'original' && !this.displayOriginal) {
        this.showOriginal(false);
      }
      this.draw();
    },
    initializeChart() {
      this.miniSvg = d3.select('#mini').append('svg');

      this.dimensions = {width: 0, height: 0};
      this.width = this.dimensions.width;
      this.height = this.dimensions.height;
      this.margin = {top: 20, right: 50, bottom: 30, left: 50};
      this.miniDimensions = {width: 0, height: 0};
      this.miniHeight = this.miniDimensions.height;

      this.setDimensions();

      this.xScale = d3
        .scaleLinear()
        .range([0, this.width])
        .domain([0, 100000])
        .nice();

      this.gMiniSvg = this.miniSvg
        .append('g')
        .attr(
          'transform',
          'translate(' + this.margin.left + ',' + this.margin.top + ')'
        );

      this.miniXScale = d3
        .scaleLinear()
        .range([0, this.width])
        .domain([0, 100000])
        .nice();

      this.miniYScale = d3
        .scaleLinear()
        .range([this.miniHeight, 0])
        .domain([0, 1400])
        .nice();

      this.miniXAxis = d3
        .axisBottom()
        .scale(this.miniXScale)
        .tickFormat(d => {
          return parseInt((d / 100).toString()) / 10;
        });

      this.miniYAxis = d3.axisLeft().scale(this.miniYScale);

      this.gMiniSvg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.miniHeight + ')')
        .call(this.miniXAxis)
        .append('text')
        .attr('class', 'x label')
        .style('text-anchor', 'end')
        .attr('x', this.width)
        .attr('y', -6)
        .text('Distance (km)')
        .attr('fill', '#000');

      this.miniYAxisVis = this.gMiniSvg
        .append('g')
        .attr('class', 'y axis')
        .call(this.miniYAxis);

      this.miniYLabel = this.miniYAxisVis
        .append('text')
        .attr('class', 'y label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.yAxisText())
        .attr('fill', '#000');

      this.miniElevationLine = d3
        .line()
        .x(d => {
          return this.miniXScale(d.totalDistance);
        })
        .y(d => {
          return this.miniYScale(d.ele);
        });

      this.miniSlopeLine = d3
        .line()
        .x(d => {
          return this.miniXScale(d.totalDistance);
        })
        .y(d => {
          return this.miniYScale(parseInt((d.slope * 1000).toString()) / 10);
        })
        .curve(d3.curveStepBefore);

      store.dispatch('select', this.miniXScale.domain());
      this.brush = d3
        .brushX()
        .extent([
          [0, 0],
          [this.width, this.miniHeight]
        ])
        .on('brush', this.brushed);

      let triangleShape = d3
        .symbol()
        .type(d3.symbolTriangle)
        .size(200);

      // Add a group to keep the lines under the brush
      this.miniLines = this.gMiniSvg.append('g').attr('id', 'lines');

      this.gBrush = this.gMiniSvg
        .append('g')
        .attr('class', 'brush')
        .call(this.brush);

      this.handle = this.gBrush
        .selectAll('.handle--custom')
        .data([{type: 'w'}, {type: 'e'}])
        .enter()
        .append('path')
        .attr('class', 'handle--custom')
        .attr('fill', '#666')
        .attr('fill-opacity', 0.8)
        .attr('stroke', '#000')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'ew-resize')
        .attr('d', triangleShape);

      this.gBrush.call(this.brush.move, this.xScale.range());
    }
  }
};
</script>

<style lang="sass">

#mini
  font: 10px sans-serif
  width: 100%
  height: 200px
  overflow: hidden

.axis path,
.axis line
  fill: none
  stroke: #000
  shape-rendering: crispEdges
  stroke-width: 1px

.line
  fill: none
  stroke-width: 1px

.eleStatus
  display: none
  margin-left: 20px
  -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"
  color: red

.newStuff
  display: none
  height: 0
  background: #cae3fc
  font-size: 20px

.resize path
  fill: #666
  fill-opacity: .8
  stroke: #000
  stroke-width: 2px

.brush .extent
  fill-opacity: .125
  shape-rendering: crispEdges

rect.pane
  cursor: move
  fill: none
  pointer-events: all

.modified
  stroke: green
  fill: transparent

.original
  stroke: blue
  fill: transparent

#mini .modified,
#mini .original
  stroke-width: 3

circle.modified
  fill: green

circle.original
  fill: blue

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
.legend .modified,
.legend .slope-legend-wrapper
  margin-right: 20px
  display: inline-block

#slopeDistance
  display: none

.inline
  display: inline-block

.checkbox
  cursor: pointer

.checkbox.show-original
  padding-bottom: 0
  padding-top: 0

.show-original label,
.show-original input
  font-size: 20px
  cursor: pointer

.slope-legend-wrapper
  display: inline-block
  line-height: 60px

.slope-legend
  width: 200px
  height: 60px
  display: inline-block
  vertical-align: bottom
  margin-left: 0
  margin-right: 10px
</style>
