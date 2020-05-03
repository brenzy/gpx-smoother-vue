<template>
  <div class="about">
    <h1>About the GPX Smoother</h1>
    <p>
      The GPX Smoother lets you load a GPX file, and smooth out the elevation, to make it easier to ride in your
      favourite trainer software.
    <p/>
    <ul>
      <li><span class="font-weight-bold">Box Score Smoothing</span> - uses simple box-score smoothing to smooth the elevation.</li>
      <li><span class="font-weight-bold">Savitzky-Golay Smoothing</span> - a more complex smoothing algorithm. </li>
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
      currently only
      work on GPX files with one track containing one track segment.
    </p>

    <h2>Change Log</h2>
    <h3>Version 1.0.0</h3>
    <ul>
      <li>Added the ability to decrease precision for latitude, longitude, and elevation.</li>
    </ul>
    <h3>Version 1.1.0</h3>
    <ul>
      <li>Added the slope difficulty feature to allow the slope between each set of points to be increased or
          decreased by a fixed percentage.</li>
      <li>Added the display of average slope for original and smoothed data.</li>
    </ul>
    <h3>Version 1.2.0</h3>
    <ul>
      <li>Load the application version from the package.json at build time.</li>
      <li>Fixed an issue where the slope legend was throwing an error because the height was not initialized
          correctly.</li>
    </ul>
    <h3>Version 1.3.0</h3>
    <ul>
      <li>Added a quick implementation of lapping.  This will currently only work on files with one track
          containing one track segment.</li>
    </ul>
  </div>

</template>
<style lang="sass" scoped>
  .about
    margin: 48px
  h3
    margin-top: 16px
</style>
