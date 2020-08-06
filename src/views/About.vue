<template>
  <div class="about">
    <h1>About the GPX Smoother</h1>
    <p>
      The GPX Smoother lets you load a GPX file, and smooth out the elevation, to make it easier to ride in your
      favourite trainer software.
    <p/>
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

    <h2>Planned for Future Releases</h2>
    <ul>
      <li>input validation.</li>
      <li>browser compatibility</li>
      <li>map the route</li>
      <li>accept more than one file type (fit, tcx, kml)</li>
      <li>try some different UI alternatives for less scrolling</li>
      <li>Add latitude and longitude to the tooltips to help those who want to edit the file themselves</li>
    </ul>

    <h2 class="change-log">Change Log</h2>
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
  </div>

</template>
<style lang="sass" scoped>
  .about
    margin: 48px
  h3
    margin-top: 16px
  .change-log
    margin-top: 16px
</style>
