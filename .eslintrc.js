/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'airbnb-base', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-param-reassign': 0,
    'import/extensions': [
      1,
      {
        js: 'always',
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'off',
    'no-restricted-exports': 'off',
    'prettier/prettier': 'error',
  },
};
