<template>
  <v-container class="route-map-view">
    <h1>Route Map</h1>
    <div class="file-input">
      <v-file-input
          placeholder="Select a GPX file"
          label="Original GPX file"
          :loading="isLoading"
          accept=".gpx"
          v-model="gpxFile"
          @change="onFileChange"
          :error-messages="loadError"
      />
    </div>
    <div id="map"></div>
  </v-container>
</template>

<script>
import * as L from 'leaflet';
import store from '@/store/store';
import {mapState} from 'vuex';
import {convertDistance, convertElevation} from '@/utilities/unitConversion';
import {UnitType} from '@/components/chartModel';

const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const ocmlink = '<a href="http://thunderforest.com/">Thunderforest</a>';

// An API key for the cycling map is available from http://thunderforest.com/
const myApiKey = '';

export default {
  name: 'RouteMap',
  data: () => ({
    leafletMap: null,
    gpxFile: null,
    routeLayer: null,
    markerLayer: null,
    mapLayer: null,
    cycleMapLayer: null,
    editIcon: null,
    markers: [],
    polyLine: null,
    graphUnits: UnitType.METRIC,
    unitsDistance: 'km',
    unitsElevation: 'm'
  }),
  mounted() {
    // Hide the scrollbar for the route map only
    let elHtml = document.getElementsByTagName('html')[0];
    elHtml.style.overflowY = 'hidden';

    this.gpxFile = this.selectedGpxFile;
    this.leafletMap = L.map('map');
    this.editIcon = L.divIcon({className: 'leaflet-div-icon leaflet-editing-icon'});
    this.$nextTick(() => {
      this.mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution});
      this.mapLayer.addTo(this.leafletMap);
      this.leafletMap.fitWorld();
      this.cycleMapLayer = L.tileLayer(
      `https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png${myApiKey}`, {
        attribution: `&copy; ${ocmlink}`,
        maxZoom: 18,
      }).addTo(this.leafletMap);
      this.routeLayer = L.layerGroup([]);
      this.markerLayer = L.layerGroup([]);
      L.control.layers(
          {
            'Street Map': this.mapLayer,
          },
          {
            'Cycle Map': this.cycleMapLayer,
            'Route': this.routeLayer,
            'Route Markers': this.markerLayer},
      ).addTo(this.leafletMap);
      this.drawRouteLayer();
    });
  },
  activated() {
    // Hide the scrollbar for the route map only
    let elHtml = document.getElementsByTagName('html')[0];
    elHtml.style.overflowY = 'hidden';
    this.leafletMap.invalidateSize();
    this.$nextTick(() => {
      if (this.polyLine) {
        this.leafletMap.fitBounds(this.polyLine.getBounds());
      } else {
        this.leafletMap.fitWorld();
      }
    });
  },
  deactivated() {
    // Hide the scrollbar for the route map only
    let elHtml = document.getElementsByTagName('html')[0];
    elHtml.style.overflowY = 'auto';
  },
  computed: {
    ...mapState([
        'selectedGpxFile', 'isLoading', 'loadError', 'rawValues', 'smoothedValues'
    ]),
  },
  watch: {
    rawValues() {
      this.drawRouteLayer();
    },
    smoothedValues() {
      this.drawRouteLayer();
    },
    selectedGpxFile() {
      this.gpxFile = this.selectedGpxFile;
    }
  },
  methods: {
    onFileChange() {
      store.dispatch('load', this.gpxFile);
    },
    getPopupText(data) {
      // Populate the tooltip
      const slope = (Math.round(data.slope * 1000) / 10).toString();
      const distance = (Math.round(convertDistance(data.totalDistance, this.graphUnits) / 10) / 100).toString();
      const elevation = parseInt(((convertElevation(data.ele, this.graphUnits) * 100) / 100).toString());
      const latitude = (Math.round(data.lat * 1000) / 1000).toString();
      const longitude = (Math.round(data.long * 1000) / 1000).toString();
      return `<div>Slope: ${slope}%</div>` +
             `<div>Distance: ${distance}${this.unitsDistance}</div>` +
             `<div>Elevation: ${elevation}${this.unitsElevation}</div>` +
             `<div>Latitude: ${latitude}</div>`  +
             `<div>Longitude: ${longitude}</div>`;
    },
    drawRouteLayer() {
      if (!this.leafletMap) {
        return;
      }

      // remove all of the existing markers
      this.markers.forEach(marker => {
        this.markerLayer.removeLayer(marker.marker);
      });
      this.markers = [];
      if (this.polyLine) {
        this.routeLayer.removeLayer(this.polyLine);
        this.polyLine = null;
      }

      let latLongs = [];
      let values = (this.smoothedValues && this.smoothedValues.length) ? this.smoothedValues : this.rawValues;
      if (values && values.length) {
        values.forEach((data) => {
          const latLong = [data.lat, data.long];
          latLongs.push(latLong);
          this.getPopupText(data);
          const marker = L.marker(latLong, {icon: this.editIcon, opacity: .5});
          marker.bindPopup(this.getPopupText(data));
          marker.addTo(this.markerLayer);
          this.markers.push({marker, data});
        });
        this.polyLine = L.polyline(latLongs, {weight: 3, color: '#1976d2', readOnly: true});
        this.polyLine.addTo(this.routeLayer);
        this.routeLayer.addTo(this.leafletMap);
        this.leafletMap.fitBounds(L.latLngBounds(latLongs));
      }
    }
  }
};
</script>

<style lang="sass">
.route-map-view
  display: flex
  justify-content: flex-start
  height: calc(100vh - 64px)
  flex-direction: column

#map
  flex-grow: 1
  background: darkgrey
  margin: 0 20px 20px 20px
</style>
