<template>
  <v-container class="contact">
    <p>
      To request features or report issues, you can find this GPX smoother on github at
      <a target="_blank" href="https://github.com/brenzy/gpx-smoother-vue">https://github.com/brenzy/gpx-smoother-vue</a>
      or drop me a line at <a :href="`mailto:${emailAddress}`">{{ emailAddress }}</a>.
    </p>
  </v-container>
</template>

<script>
  export default {
    name: 'contact',
    data: function () {
      return {
        name: 'brendaz',
        provider: 'rogers.com'
      };
    },
    computed: {
      emailAddress: function () {
        return `${this.name}@${this.provider}`;
      }
    }
    };
</script>

<style lang="sass" scoped>
  .contact
    margin: 48px
</style>
