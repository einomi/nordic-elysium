'use strict';
require('dotenv').config();
const path = require('path');

const webpack = require('webpack');

const IS_PRODUCTION = require('./env').IS_PRODUCTION;

const entryPoints = {
  bundle: path.resolve(__dirname, 'src/js/index.js'),
};

module.exports = {
  entry: Object.keys(entryPoints).reduce((acc, currentKey) => {
    acc[currentKey] = [entryPoints[currentKey]];
    return acc;
  }, {}),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/js'),
    publicPath: '/js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        type: 'asset/source',
      },
    ],
  },
  devtool: IS_PRODUCTION ? undefined : 'eval',
  mode: IS_PRODUCTION ? 'production' : 'development',
  optimization: {
    minimize: IS_PRODUCTION,
  },
  plugins: [new webpack.EnvironmentPlugin(['IS_LOADER_HIDDEN'])],
};
