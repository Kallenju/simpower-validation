/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const mode = process.env.NODE_ENV;

const config = {
  entry: './src/simpower-validation.esm.js',

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
    ],
  },

  output: {
    filename: 'simpower-validation.production.min.js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './src'),
        },
        {
          from: path.resolve(__dirname, './package.json'),
        },
        {
          from: path.resolve(__dirname, './LICENSE.md'),
        },
        {
          from: path.resolve(__dirname, './README.md'),
        },
      ],
    }),
  ],

  mode,
};

module.exports = config;
