<template>
  <v-app>
    <Toolbar/>
    <v-content>
      <router-view/>
    </v-content>
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

<style lang="sass">
  p
    margin-block-start: 1em
    margin-block-end: 1em
    margin-inline-start: 0
    margin-inline-end: 0

</style>
