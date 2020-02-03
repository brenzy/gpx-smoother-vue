<template>
  <div class="contact">
    <p>
      To request changes or report issues, you can find this GPX smoother on github at <a target="_blank" href="https://github.com/brenzy/gpx-smoother-vue">https://github.com/brenzy/gpx-smoother-vue</a>
      or drop me a line at <a :href="`mailto:${emailAddress}`">{{ emailAddress }}</a>.
    </p>
  </div>
</template>

<script>
  export default {
    name: 'Contact',
    data: function () {
      return {
        name: 'brendaz',
        provider: 'rogers.com'
      };
    },
    computed: {
      // a computed getter
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
