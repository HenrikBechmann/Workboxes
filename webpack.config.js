// webpack.config.js
var webpack = require('webpack');
var path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    main:'./app/src/index.tsx'
  },
  output: {
    filename: 'build.js',
    path: path.resolve('dist'),
    library:'tribalopolis',
    libraryTarget:'umd',
    clean:true,
  },
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },  
  },
  resolve: {
    extensions: ['.tsx', '.js'],
    modules: ['./app/src', 'node_modules']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/src/index.html',
      filename: 'index.html',
      favicon: './app/assets/favicon.ico'
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
        type: "asset/resource",
        generator : {
          filename : 'images/[name][ext][query]',
        }      
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