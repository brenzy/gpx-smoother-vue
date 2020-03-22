<template>
  <div class="about">
    <h1>About the GPX Smoother</h1>
    <p>
      The GPX Smoother lets you load a GPX file, and smooth out the elevation, to make it easier to ride in your
      favourite trainer software.
    <p/>
    <ul>
      <li>Box Score Smoothing - uses simple box-score smoothing to smooth the elevation.</li>
      <li>Savitzky-Golay Smoothing - a more complex smoothing algorithm. </li>
      <li>Set Range - lets you set the maximum and minimum slope.</li>
      <li>Flatten - lets you set the maximum change in slope between any two points.</li>
      <li>Elevate - increases or decreases elevation by a fixed amount.</li>
    </ul>
    <p>
      Slide the triangular handles on the smaller graph to select only a portion of the ride to smooth.
    </p>
    <p>
      The Decrease Precision checkbox rounds the elevation to 2 decimal places, and the latitude and longitude
      to 5 decimal places.  Decreasing the precision will produce a smaller file size.
    </p>

    <h2>Change Log</h2>
    <h3>Version 1.0.0</h3>
    <ul>
      <li>Added the ability to decrease precision for latitude, longitude, and elevation.</li>
    </ul>
  </div>

</template>
<style lang="sass" scoped>
  .about
    margin: 48px
</style>
