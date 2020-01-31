<template>
  <div class="input-section">
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
</template>

<script>
import store from '../store/store';
import { mapState } from 'vuex'

export default {
  name: 'GpxSmoother',
  data: () => ({
    gpxFile: null
  }),
  computed: {
    ...mapState({
      isLoading: state => state.isLoading,
      loadError: state => state.loadError
    })
  },
  methods: {
    onFileChange() {
      store.dispatch('load', this.gpxFile);
    }
  }
};
</script>
<style lang="sass">
  .input-section
    margin: 20px
    .v-input__slot
      max-width: 600px
</style>
