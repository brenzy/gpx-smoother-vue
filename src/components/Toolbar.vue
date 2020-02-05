<template>
  <div>
     <v-app-bar dark color="primary">
       <v-toolbar-items>
         <v-btn text to="/">GPX Smoother</v-btn>
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
  export default {
    name: 'Toolbar'
  };
</script>

<style scoped>

</style>
