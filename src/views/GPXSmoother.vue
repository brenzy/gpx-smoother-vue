<template>
  <div class="input-section">
    <v-file-input
      placeholder="Select a GPX file"
      label="Original GPX file"
      :loading="isFileLoading"
      accept=".gpx"
      @change="onFileChange"
    />
  </div>
</template>

<script>
export default {
  name: 'GPXSmoother',
  data: () => ({
    isFileLoading: false
  }),
  methods: {
    onFileChange(event) {
      console.log(event);
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
