<template>
  <v-container fluid class="about">
    <h1>About the GPX Smoother</h1>
    <p>
      The GPX Smoother lets you load a GPX file, and smooth out the elevation, to make it easier to ride in your
      favourite trainer software.
    <p/>

    <h2>Smoothing</h2>
    <p>
      Click on the apply button for one or more of the following algorithms to smooth the data to your liking:
    </p>
    <ul>
      <li><span class="font-weight-bold">Slope Box Score Smoothing</span> - uses simple box-score smoothing to smooth the slope.</li>
      <li><span class="font-weight-bold">Elevation Box Score Smoothing</span> - uses simple box-score smoothing to smooth the elevation.</li>
      <li><span class="font-weight-bold">Savitzky-Golay Smoothing</span> - a more complex smoothing algorithm. </li>
      <li><span class="font-weight-bold">Kalman Filter</span> - apply a Kalman filter to the slope or delta slope.</li>
      <li><span class="font-weight-bold">Set Range</span> - lets you set the maximum and minimum slope.</li>
      <li><span class="font-weight-bold">Flatten</span> - lets you set the maximum change in slope between any two points.</li>
      <li><span class="font-weight-bold">Slope Difficulty</span> - Increase or decrease the slope between each set of points by a percentage.</li>
      <li><span class="font-weight-bold">Elevate</span> - increases or decreases the elevation of each point by a fixed amount.</li>
    </ul>
    <p>
      Slide the <span class="font-weight-bold">triangular handles</span> on the smaller graph to select only a portion of the ride to smooth.
    </p>
    <p>
      The <span class="font-weight-bold">Decrease Precision</span> checkbox rounds the elevation to 2 decimal places, and
      the latitude and longitude to 5 decimal places.  Decreasing the precision will produce a smaller file size.
    </p>
    <p>
      Use <span class="font-weight-bold">Total Number of Laps</span> to repeat the route.  This functionality will
      currently only work on GPX files with one track containing one track segment.
    </p>

    <h2>Route Map</h2>
    <p>
      Hover over the layers icon in the top-right corner of the map, and select "Route Markers" so see the points on
      the route. Clicking on a route marker will display information about the point.
    </p>

    <h2>Updates Planned For Future Releases</h2>
    <ul>
      <li>Input validation.</li>
      <li>Browser compatibility</li>
      <li>Accept more file types (fit, tcx, kml)</li>
      <li>Try some different UI alternatives for less scrolling</li>
      <li>Editing the route and elevation from the route map</li>
      <li>Mini elevation chart on the route map</li>
      <li>Draggable points on the elevation charts</li>
      <li>Undo/Redo stack</li>
      <li>Charts code clean-up to get rid of repeated code</li>
      <li>Vue 3 migration</li>
      <li>Typescript</li>
      <li>Snip the route</li>
      <li>Reverse the route</li>
      <li>Zoom and pan on the graphs</li>
      <li>Zoom to the route on the map</li>
    </ul>

    <h2 class="change-log">Change Log</h2>
    <h3>Version 1.7.1 - 2021-01-17</h3>
    <ul>
      <li>Updates to the change log.</li>
    </ul>
    <h3>Version 1.7.0 - 2021-01-17</h3>
    <ul>
      <li>Added open cycle map to the map layers.</li>
    </ul>
    <h3>Version 1.6.0 - 2020-08-14</h3>
    <ul>
      <li>Add mapping of the route.</li>
    </ul>
    <h3>Version 1.5.0 - 2020-08-06</h3>
    <ul>
      <li>Add the ability to display the chart in metric or imperial.</li>
    </ul>
    <h3>Version 1.4.0 - 2020-06-06</h3>
    <ul>
      <li>Add box score smoothing for slope.</li>
      <li>Add a Kalman filter for slope.</li>
      <li>Change the default for maximum change in slope between points.</li>
    </ul>
    <h3>Version 1.3.0</h3>
    <ul>
      <li>Added a quick implementation of lapping.  This will currently only work on files with one track
          containing one track segment.</li>
    </ul>
    <h3>Version 1.2.0</h3>
    <ul>
      <li>Load the application version from the package.json at build time.</li>
      <li>Fixed an issue where the slope legend was throwing an error because the height was not initialized
          correctly.</li>
    </ul>
    <h3>Version 1.1.0</h3>
    <ul>
      <li>Added the slope difficulty feature to allow the slope between each set of points to be increased or
          decreased by a fixed percentage.</li>
      <li>Added the display of average slope for original and smoothed data.</li>
    </ul>
    <h3>Version 1.0.0</h3>
    <ul>
      <li>Added the ability to decrease precision for latitude, longitude, and elevation.</li>
    </ul>
  </v-container>

</template>
<script>
export default {
  name: 'about',
};
</script>
<style lang="sass" scoped>
  .about
    margin: 48px
  h3
    margin-top: 16px
  .change-log
    margin-top: 16px
</style>
