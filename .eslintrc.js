module.exports = {
  "root": true,
  "env": {
    "node": true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  "rules": {
    // TODO: temporarily disable this while developing the application
    "no-console": "off"
  },
  "parserOptions": {
    "parser": "babel-eslint"
  }
};
