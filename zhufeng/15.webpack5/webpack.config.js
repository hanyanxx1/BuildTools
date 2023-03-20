const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");
module.exports = {
  // mode: "development",
  mode: "production",
  devtool: false,
  entry: "./src/index.js",
  cache: {
    type: "filesystem", //  'memory' | 'filesystem'
    cacheDirectory: path.resolve(__dirname, "node_modules/.cache/webpack"), // 默认将缓存存储在 node_modules/.cache/webpack
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
  },
  // watch: true,
  optimization: {
    usedExports: true,
    moduleIds: "named",
    chunkIds: "named",
    // moduleIds: "deterministic",
    // chunkIds: "deterministic",
  },
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      buffer: require.resolve("buffer"),
      stream: require.resolve("stream-browserify"),
    },
    // fallback: {
    //   crypto: false,
    //   buffer: false,
    //   stream: false,
    // },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        type: "asset/resource",
      },
      {
        test: /\.ico$/,
        type: "asset/inline",
      },
      {
        test: /\.txt$/,
        type: "asset/source",
      },
      {
        test: /\.(jpg|png|gif)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {},
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CleanWebpackPlugin(),
  ],
};
