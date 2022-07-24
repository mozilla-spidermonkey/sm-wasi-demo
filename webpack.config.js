const path = require('path');
const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
      "main": "./index.js",
  },
  output: {
    path: __dirname + '/dist/js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new MonacoWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: "./index.html", to: __dirname + "/dist" },
        { from: "./data.json", to: __dirname + "/dist" },
      ],
    }),
  ],
};

