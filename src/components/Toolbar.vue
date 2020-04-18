<template>
  <div>
     <v-app-bar dark color="primary">
       <v-toolbar-items>
         <v-btn text to="/">GPX Smoother Version {{appVersion}}</v-btn>
       </v-toolbar-items>
      <v-spacer/>
      <v-toolbar-items>
        <v-btn text to="/about">About</v-btn>
        <v-btn text to="/contact">Contact</v-btn>
      </v-toolbar-items>
    </v-app-bar>
  </div>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'Toolbar',
    computed: mapState(['appVersion']),
  };
</script>

<style scoped>

</style>
