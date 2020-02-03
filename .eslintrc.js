module.exports = {
  'root': true,
  'env': {
    'node': true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  'rules': {
    // TODO: temporarily disable this while developing the application
    'no-console': 'off',
    'semi': [2, 'always'],
    'quotes': [2, 'single', 'avoid-escape'],
    'keyword-spacing': [2, {'before': true, 'after': true}],
    'object-curly-spacing': [2, 'never']
  },
  'parserOptions': {
    'parser': 'babel-eslint'
  }
};
