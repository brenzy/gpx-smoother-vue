<template>
  <v-app>
    <Toolbar/>
    <v-main>
      <keep-alive :exclude="['about', 'contact']">
        <router-view/>
      </keep-alive>
    </v-main>
    <v-overlay :value="isProcessing" opacity=".35">
      <div class="wait-text">PROCESSING...</div>
    </v-overlay>
  </v-app>
</template>

<script>
import Toolbar from './components/Toolbar';
import {mapState} from 'vuex';
export default {
  name: 'App',
  components: {Toolbar},
  data: () => ({
    //
  }),
  computed: {
    ...mapState(['isSmoothingInProgress']),
    ...mapState({
      isProcessing: state => state.isLoading || state.isSmoothingInProgress,
    }),
  }
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
  .wait-text {
    font-size: 60px;
    color: white;
  }
</style>
