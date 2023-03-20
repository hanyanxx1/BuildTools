/* eslint-disable max-len */
const { resolve } = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const dotenv = require("dotenv");

dotenv.config();
console.log("process.env", process.env.NODE_ENV);

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'hidden-source-map',
  entry: {
    main: './src/index.js',
    vendor: ["jquery", "lodash"],
  },
  output: {
    path: resolve(__dirname, "dist"),
    filename: "[name].[chunkhash:5].js",
    chunkFilename: '[name].[chunkhash:5].js',
    publicPath: "/",
  },
  devServer: {
    static: {
      directory: resolve(__dirname, "static"),
    },
    devMiddleware: {
      writeToDisk: true,
    },
    compress: true, /// 是否启动压缩 gzip
    port: 8080, // 指定HTTP服务器的端口号
    open: true, // 自动打开浏览器
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "eslint-loader",
          options: { fix: true },
        },
        enforce: "pre",
        include: resolve(__dirname, "src"),
        // exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env"],
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", {
          loader: "px2rem-loader",
          options: {
            remUnit: 75,
          },
        }],
      },
      { test: /\.less$/, use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "less-loader"] },
      { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"] },
      {
        test: /\.(jpe?g|png|svg|gif)/i,
        type: "asset",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ["**/*"],
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:5].css",
    }),
  ],
};
