// webpack.config.js
var webpack = require('webpack');
var path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // devtool: 'source-map',
  entry: {
    main:'./src/index.tsx'
  },
  output: {
    filename: 'build.js',
    path: path.resolve('lib'),
    library:'tribalopolis',
    libraryTarget:'umd',
    clean:true
  },
  devServer: {
    historyApiFallback: true,
  },
 resolve: {
    extensions: ['.tsx', '.js'],
    modules: ['src', 'node_modules']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
    module: {
    rules: [
      { 
          test: /\.tsx?$/, 
          use:['babel-loader','ts-loader']
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
          test: /\.css?$/,
          use:['style-loader','css-loader']
      }
      ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};