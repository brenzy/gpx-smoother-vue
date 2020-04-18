process.env.VUE_APP_VERSION = require('./package.json').version;
module.exports = {
  'transpileDependencies': [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production'
    ? '/Biking/smoother-beta/'
    : '/',
  devServer: {
  },
};
