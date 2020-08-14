<template>
  <div>
    <div id="chart">
    </div>
  </div>
</template>

<script>
  import * as d3 from 'd3';
  import {mapState} from 'vuex';
  import {GraphType, LineTypes, UnitType} from './chartModel';
  import {convertDistance, convertElevation, kmToMiles, metresToFeet} from '@/utilities/unitConversion';

  // noinspection JSUnusedGlobalSymbols
  export default {
    name: 'DistanceChart',
    props: {
      graphType: String,
      colorScale: Function,
      graphUnits: UnitType
    },
    data: () => ({
      defaultDistance: 100000,
      defaultElevation: 100,
      defaultSlope: 20,
      dimensions: null,
      width: null,
      height: null,
      margin: null,
      svg: null,
      xScale: null,
      yScale: null,
      xScaleImperial: null,
      yScaleImperial: null,
      xAxis: null,
      yAxis: null,
      slopeLine: null,
      displayOriginal: true,
      yAxisLabel: null,
      xAxisLabel: null,
      tooltip: null,
      focus: null,
    }),
    mounted() {
      window.addEventListener('resize', this.resize);
      this.$nextTick(() => {
        this.initializeChart();
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resize);
    },
    computed: mapState(['rawValues', 'selection', 'totalDistance', 'smoothedValues']),
    watch: {
      rawValues(newValue) {
        if (!this.svg) {
          return;
        }
        if (newValue && newValue.length) {
          this.setLine(newValue, LineTypes.ORIGINAL, false);
        } else {
          this.reset();
        }
      },
      smoothedValues(newValue) {
        if (!this.svg) {
          return;
        }
        if (newValue && newValue.length) {
          this.setLine(newValue, LineTypes.SMOOTHED, true);
        } else if (this.rawValues && this.rawValues.length) {
          this.setLine([], LineTypes.SMOOTHED, true);
          if (this.graphType === GraphType.ELEVATION_PROFILE && this.rawValues) {
            this.setLine(this.rawValues, LineTypes.ORIGINAL, true);
          }
        }
      },
      graphType: function() {
        if (!this.svg) {
          return;
        }
        this.redraw();
      },
      graphUnits: function() {
        if (!this.svg) {
          return;
        }
        this.initializeUnits(this.graphUnits);
        const xAxisScale = (this.graphUnits === UnitType.IMPERIAL) ? this.xScaleImperial : this.xScale;
        this.xAxis.scale(xAxisScale);
        this.focus.select('.x.axis').call(this.xAxis);
        this.xAxisLabel.text(this.xAxisText());
        const yAxisScale = (this.graphUnits === UnitType.IMPERIAL) ? this.yScaleImperial : this.yScale;
        this.yAxis.scale(yAxisScale);
        this.focus.select('.y.axis').call(this.yAxis);
        this.yAxisLabel.text(this.yAxisText());
      },
      selection: function(newValue) {
        if (!this.svg) {
          return;
        }
        this.onSelectionUpdate(newValue);
      }
    },
    methods: {
      initializeUnits(graphUnits) {
        if (graphUnits === UnitType.METRIC) {
          this.unitsElevation = 'm';
          this.unitsDistance = 'km';
        } else {
          this.unitsElevation = 'ft';
          this.unitsDistance = 'mi';
        }
      },
      xAxisText() {
        return `Distance (${this.unitsDistance})`;
      },
      yAxisText() {
        return (this.graphType === GraphType.SLOPE_DISTANCE) ? 'Slope (%)' : `Elevation (${this.unitsElevation})`;
      },
      defaultYExtent(unitType) {
        return (this.graphType === GraphType.SLOPE_DISTANCE) ? [-this.defaultSlope, this.defaultSlope]
            : [0, convertElevation(this.defaultElevation, unitType)];
      },
      setDimensions() {
        this.dimensions = {
          width: parseInt(d3.select('#chart').style('width')),
          height: parseInt(d3.select('#chart').style('height'))
        };

        this.width = this.dimensions.width - this.margin.left - this.margin.right;
        this.height = this.dimensions.height - this.margin.top - this.margin.bottom;
        this.svg.attr('width', this.dimensions.width);
        this.svg.attr('height', this.dimensions.height);
      },
      resize() {
        // If the chart is hidden, don't bother to redraw it
        if (!this.svg || !d3.select('#chart').node() || d3.select('#chart').node().clientWidth === 0) {
          return;
        }

        // Define responsive behavior
        this.setDimensions();

        // Update the range of the scale with new width/height
        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);
        this.xScaleImperial.range([0, this.width]);
        this.yScaleImperial.range([this.height, 0]);

        // Update the axis and text with the new scale
        this.svg.select('.x.axis')
          .attr('transform', 'translate(0,' + this.height + ')');
        this.svg.select('.x.label')
          .attr('x', this.width);

        // Update the tick marks
        this.xAxis.ticks(Math.max(this.width / 75, 2));
        this.yAxis.ticks(Math.max(this.height / 50, 2));

        // Resize the clipping rectangle
        this.svg.select('#clip rect')
          .attr('width', this.width)
          .attr('y', -this.margin.top)
          .attr('height', this.height + this.margin.top + this.margin.bottom); // Leave some room at the top and bottom
      },
      draw() {
        this.focus.select('.x.axis').call(this.xAxis);
        this.focus.select('.y.axis').call(this.yAxis);
        if (this.graphType === GraphType.SLOPE_DISTANCE) {
          this.focus.selectAll('path.slope').attr('d', this.slopeLine);
          this.focus.selectAll('circle').attr('cx', d => {
            return this.xScale(d.totalDistance - d.distance / 2);
          });
          this.focus.selectAll('circle').attr('cy', d => {
            return this.yScale(Math.floor(d.slope * 1000) / 10);
          });
        } else {
          this.focus.selectAll('path.elevation').attr('d', this.elevationLine);
          this.focus.selectAll('circle').attr('cx', d => {
            return this.xScale(d.totalDistance);
          });
          this.focus.selectAll('circle').attr('cy', d => {
            return this.yScale(d.ele);
          });
        }
        this.focus.selectAll('polygon').attr('points', datum => {
          return this.xScale(datum.totalDistance).toString() + ',' + this.yScale(this.yScale.domain()[0])
            + ' ' + this.xScale(datum.totalDistance) + ',' + this.yScale(datum.ele)
            + ' ' + this.xScale(datum.previous.totalDistance) + ',' + this.yScale(datum.previous.ele)
            + ' ' + this.xScale(datum.previous.totalDistance) + ',' + this.yScale(this.yScale.domain()[0]);
        });
      },
      onSelectionUpdate(selection) {
        if (!selection) {
          return;
        }
        this.xScale.domain(selection);
        this.xScaleImperial.domain(selection.map(distance => kmToMiles(distance)));
        this.focus.select('.x.axis').call(this.xAxis);
        this.focus.selectAll('path.elevation').attr('d', this.elevationLine);
        this.focus.selectAll('path.slope').attr('d', this.slopeLine);
        if (this.graphType === GraphType.SLOPE_DISTANCE) {
          this.focus.selectAll('circle').attr('cx', d => {
            return this.xScale(d.totalDistance - d.distance / 2);
          });
          this.focus.selectAll('circle').attr('cy', d => {
            return this.yScale(parseInt((d.slope * 1000).toString()) / 10);
          });
        } else {
          this.focus.selectAll('circle').attr('cx', d => {
            return this.xScale(d.totalDistance);
          });
          this.focus.selectAll('circle').attr('cy', d => {
            return this.yScale(d.ele);
          });
        }
        this.focus.selectAll('polygon').attr('points', datum => {
          return this.xScale(datum.totalDistance).toString() + ',' + this.yScale(this.yScale.domain()[0])
            + ' ' + this.xScale(datum.totalDistance) + ',' + this.yScale(datum.ele)
            + ' ' + this.xScale(datum.previous.totalDistance) + ',' + this.yScale(datum.previous.ele)
            + ' ' + this.xScale(datum.previous.totalDistance) + ',' + this.yScale(this.yScale.domain()[0]);
        });
      },
      showOriginal(show) {
        const _this = this;
        this.displayOriginal = show;
        let opacity = show ? 1 : 0;
        this.focus.selectAll('circle.original').style('opacity', opacity)
          .on('mouseover', function (data, index, group) {
            if (opacity) {
              _this.tooltipDisplay(data, index, group);
            }
          });
        this.focus.selectAll('path.original').style('opacity', opacity);
        this.focus.selectAll('polygon.original').style('opacity', opacity);
      },
      reset() {
        this.yAxisLabel.text(this.yAxisText());
        this.xAxisLabel.text(this.xAxisText());
        this.focus.selectAll('circle').remove();
        this.focus.selectAll('polygon').remove();
        this.focus.selectAll('path.elevation').remove();
        this.focus.selectAll('path.slope').remove();
        this.yScale.domain(this.defaultYExtent(UnitType.METRIC));
        this.yScaleImperial.domain(this.defaultYExtent(UnitType.IMPERIAL));
        this.draw();
      },
      redraw() {
        if (!this.svg) {
          return;
        }
        this.reset();
        if (this.rawValues &&
            (this.graphType !== GraphType.ELEVATION_PROFILE || !this.smoothedValues)) {
          this.setLine(this.rawValues, LineTypes.ORIGINAL, true);
        }
        if (this.smoothedValues) {
          this.setLine(this.smoothedValues, LineTypes.SMOOTHED, true);
        }
      },
      slopeColor(point) {
        return (this.colorScale(point.slope * 100));
      },
      createProfileLine(linePoints, lineType) {
        const _this = this;
        if (lineType !== LineTypes.ORIGINAL) {
          this.focus.selectAll('polygon.original').remove();
        }
        this.focus.selectAll('polyPath')
          .data(linePoints.slice(1))
          .enter().append('polygon')
          .attr('class', 'polygon ' + lineType)
          .attr('clip-path', 'url(#clip)')
          .style('fill', this.slopeColor)
          .style('stroke', this.slopeColor)
          .attr('points', (datum, index) => {
            datum.previous = linePoints[index];
            return this.xScale(datum.totalDistance).toString() + ',' + this.yScale(this.yScale.domain()[0])
              + ' ' + this.xScale(datum.totalDistance) + ',' + this.yScale(datum.ele)
              + ' ' + this.xScale(linePoints[index].totalDistance) + ',' + this.yScale(linePoints[index].ele)
              + ' ' + this.xScale(linePoints[index].totalDistance) + ',' + this.yScale(this.yScale.domain()[0]);
          })
          .on('mouseover', function (data, index, group) { _this.tooltipDisplay(data, index, group); })
          .on('mouseout', () => {
            this.tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          });
      },
      createSlopeLine(linePoints, lineType) {
        const _this = this;
        let points = linePoints;
        this.focus.append('path')
          .attr('class', 'slope ' + lineType)
          .datum(points)
          .attr('d', this.slopeLine)
          .attr('clip-path', 'url(#clip)');
        this.focus.selectAll('dot')
          .data(points.slice(1))  // No tooltip for first point
          .enter().append('circle')
          .attr('class', lineType)
          .attr('clip-path', 'url(#clip)')
          .attr('r', 2)
          .attr('cx', d => {
            return this.xScale(d.totalDistance - d.distance / 2);
          })
          .attr('cy', d => {
            return this.yScale(parseInt((d.slope * 1000).toString()) / 10);
          })
          .on('mouseover', function (data, index, group) { _this.tooltipDisplay(data, index, group); })
          .on('mouseout', () => {
            this.tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          });
      },
      createElevationLine(linePoints, lineType) {
        const _this = this;
        let points = linePoints;
        this.focus.append('path')
          .attr('class', 'elevation ' + lineType)
          .datum(points)
          .attr('d', this.elevationLine)
          .attr('clip-path', 'url(#clip)');
        this.focus.selectAll('dot')
          .data(points)
          .enter().append('circle')
          .attr('class', lineType)
          .attr('clip-path', 'url(#clip)')
          .attr('r', 2)
          .attr('cx', d => {
            return this.xScale(d.totalDistance);
          })
          .attr('cy', d => {
            return this.yScale(d.ele);
          })
          .on('mouseover', function (data, index, group) { _this.tooltipDisplay(data, index, group); })
          .on('mouseout', () => {
            this.tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          });
      },
      tooltipDisplay(data, index, group) {
        // Populate the tooltip
        const slope = (Math.round(data.slope * 1000) / 10).toString();
        const distance = (Math.round(convertDistance(data.totalDistance, this.graphUnits) / 10) / 100).toString();
        const elevation = parseInt(((convertElevation(data.ele, this.graphUnits) * 100) / 100).toString());
        const latitude = (Math.round(data.lat * 1000) / 1000).toString();
        const longitude = (Math.round(data.long * 1000) / 1000).toString();
        this.tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        this.tooltip.html(
          `<div>Slope: ${slope}%</div>` +
          `<div>Distance: ${distance}${this.unitsDistance}</div>` +
          `<div>Elevation: ${elevation}${this.unitsElevation}</div>` +
          `<div>Latitude: ${latitude}</div>` +
          `<div>Longitude: ${longitude}</div>`);

        // Position the tooltip in the svg
        let bbox = this.graphElement.getBoundingClientRect();
        let offsetLeft = bbox.x + window.pageXOffset;
        let offsetTop = bbox.y + window.pageYOffset;
        let eltTooltip = d3.select('.tooltip').node();
        let width = eltTooltip.clientWidth;
        let xPos = offsetLeft - width / 2 + this.margin.left;
        if (xPos + width > offsetLeft + this.dimensions.width) {
          xPos = offsetLeft + this.dimensions.width - width;
        }
        let yPos = offsetTop - eltTooltip.clientHeight - 12 + this.margin.top;
        if (group && group.length > index) {
          if (group[index].tagName === 'polygon') {
            xPos += this.xScale(data.totalDistance - data.distance / 2);
            let y1 = this.yScale(data.ele);
            let y0 = this.yScale(data.previous.ele);
            yPos += Math.min(y0, y1);
          } else {
            const point = d3.select(group[index]);
            xPos += parseInt(point.attr('cx'));
            yPos += parseInt(point.attr('cy'));
          }
        }

        this.tooltip.style('left', xPos.toString() + 'px');
        this.tooltip.style('top', yPos.toString() + 'px');
      },
      getExtents() {
        if (!this.rawValues || this.rawValues.length === 0) {
          return {xExtent: [0, this.defaultDistance], yExtent: this.defaultYExtent(UnitType.METRIC)};
        }

        let allPoints;
        if (this.smoothedValues) {
          allPoints = [
            ...this.rawValues,
            ...this.smoothedValues
          ];
        } else {
          allPoints = [ ...this.rawValues ];
        }
        let xExtent = d3.extent(allPoints, d => {
          return d.totalDistance;
        });
        let yExtent = d3.extent(allPoints, d => {
          if (this.graphType === GraphType.SLOPE_DISTANCE) {
            return (parseInt((d.slope * 1000).toString()) / 10);
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
            yExtent = this.defaultYExtent(UnitType.METRIC);
          }
        }
        return {xExtent, yExtent};
      },
      setLine(points, lineType, maintainSelection) {
        const extents = this.getExtents();
        if (lineType !== LineTypes.ORIGINAL) {
          this.focus.selectAll('circle.' + lineType).remove();
          this.focus.selectAll('path.' + lineType).remove();
          this.focus.selectAll('polygon').remove();
        }

        this.yScale.domain(extents.yExtent);
        this.yScaleImperial.domain((this.graphType === GraphType.SLOPE_DISTANCE) ? extents.yExtent :
            extents.yExtent.map(elevation => metresToFeet(elevation)));

        if (!maintainSelection) {
          this.xScale.domain(extents.xExtent);
          this.xScaleImperial.domain(extents.xExtent.map(distance => kmToMiles(distance)));
        }

        if (this.graphType === GraphType.ELEVATION_PROFILE)
          this.createProfileLine(points, lineType);
        else if (this.graphType === GraphType.SLOPE_DISTANCE)
          this.createSlopeLine(points, lineType);
        else
          this.createElevationLine(points, lineType);

        if (lineType === LineTypes.ORIGINAL && !this.displayOriginal) {
          this.showOriginal(false);
        }
        this.draw();
      },
      initializeLines() {
        if (!this.rawValues) {
          return;
        }
        if (this.graphType === GraphType.ELEVATION_PROFILE) {
          this.createProfileLine(this.smoothedValues ? this.smoothedValues : this.rawValues,
              this.smoothedValues ? LineTypes.SMOOTHED : LineTypes.ORIGINAL);
        }
        else if (this.graphType === GraphType.SLOPE_DISTANCE) {
          this.createSlopeLine(this.rawValues, LineTypes.ORIGINAL);
          if (this.smoothedValues) {
            this.createSlopeLine(this.smoothedValues, LineTypes.SMOOTHED);
          }
        } else {
          this.createElevationLine(this.rawValues, LineTypes.ORIGINAL);
          if (this.smoothedValues) {
            this.createElevationLine(this.smoothedValues, LineTypes.SMOOTHED);
          }
        }
      },
      initializeChart() {
        this.svg = d3.select('#chart').append('svg');

        this.dimensions = {width: 0, height: 0};
        this.width = this.dimensions.width;
        this.height = this.dimensions.height;
        this.margin = {top: 20, right: 50, bottom: 30, left: 50};
        this.initializeUnits(this.graphUnits);

        this.setDimensions();

        this.focus = this.svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        const extents = this.getExtents();

        this.xScale = d3.scaleLinear()
          .range([0, this.width])
          .domain(extents.xExtent);
        this.xScaleImperial = d3.scaleLinear()
            .range([0, this.width])
            .domain(extents.xExtent.map(distance => kmToMiles(distance)));

        this.yScale = d3.scaleLinear()
          .range([this.height, 0])
          .domain(extents.yExtent);
        this.yScaleImperial = d3.scaleLinear()
            .range([this.height, 0])
            .domain(extents.yExtent.map(elevation => metresToFeet(elevation)));

        const xAxisScale = (this.graphUnits === UnitType.IMPERIAL) ? this.xScaleImperial : this.xScale;
        this.xAxis = d3.axisBottom(xAxisScale)
            .tickFormat(d => {
              return parseInt((d / 100).toString()) / 10;
            });

        let xAxisVis = this.focus.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(this.xAxis);
        this.xAxisLabel = xAxisVis.append('text');
        this.xAxisLabel.attr('class', 'x label')
          .style('text-anchor', 'end')
          .attr('x', this.width)
          .attr('y', 24)
          .text(this.xAxisText())
          .attr('fill', '#000');

        const yAxisScale = (this.graphUnits === UnitType.IMPERIAL) ? this.yScaleImperial : this.yScale;
        this.yAxis = d3.axisLeft(yAxisScale);
        let yAxisVis = this.focus.append('g')
          .attr('class', 'y axis')
          .call(this.yAxis);
        this.yAxisLabel = yAxisVis.append('text');
        this.yAxisLabel.attr('class', 'y label')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text(this.yAxisText())
          .attr('fill', '#000');

        this.svg.append('defs')
          .append('clipPath')
          .attr('id', 'clip')
          .append('rect')
          .attr('width', this.width)
          .attr('y', -this.margin.top)
          .attr('height', this.height + this.margin.top + this.margin.bottom); // Leave some room at the top and bottom

        this.focus.append('g')
          .attr('clip-path', 'url(#clip)');

        // Get the position of the graph so we can set the
        // the offset of the tooltip
        this.graphElement = this.svg.node();

        this.tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('opacity', 0);

        this.elevationLine = d3.line()
          .x(d => {
            return this.xScale(d.totalDistance);
          })
          .y(d => {
            return this.yScale(d.ele);
          });
        this.slopeLine = d3.line()
          .x(d => {
            return this.xScale(d.totalDistance);
          })
          .y(d => {
            return this.yScale(parseInt((d.slope * 1000).toString()) / 10);
          })
          .curve(d3.curveStepBefore);

        this.initializeLines();
      }
    }
  };
</script>

<style lang="sass">

  .input-section .input-group
    display: flex
    flex-wrap: wrap
    flex-direction: row

  .avg
    margin-left: 20px

  #chart
    font: 10px sans-serif
    width: 100%
    height: 500px

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

  circle.modified
    fill: green

  circle.original
    fill: blue

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

  div.tooltip
    position: absolute
    text-align: left
    font: 16px sans-serif
    line-height: 18px
    color: white
    background: #08c
    border: 0
    white-space: nowrap
    font-weight: bold
    padding: 12px
    border-radius: 2px
    pointer-events: none

  /* Creates a small triangle extender for the tooltip */

  div.tooltip:after
    box-sizing: border-box
    display: inline
    font-size: 10px
    width: 100%
    line-height: 1
    color: #08c
    position: absolute
    pointer-events: none
    content: "\25BC"
    margin: -1px 0 0 0
    top: 100%
    left: 0
    text-align: center

</style>
