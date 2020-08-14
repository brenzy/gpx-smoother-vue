<template>
  <v-app>
    <Toolbar/>
    <v-main>
      <keep-alive :exclude="['about', 'contact']">
        <router-view/>
      </keep-alive>
    </v-main>
  </v-app>
</template>

<script>
import Toolbar from './components/Toolbar';
export default {
  name: 'App',
  components: {Toolbar},
  data: () => ({
    //
  }),
};
</script>

<style>
  @import "../node_modules/leaflet/dist/leaflet.css";
  p {
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0;
    margin-inline-end: 0;
  }
  html {
    overflow-y: auto;
  }
</style>
