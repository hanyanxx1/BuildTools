const path = require("path");
const webpack = require("webpack");
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
const smw = new SpeedMeasureWebpackPlugin();
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const glob = require("glob");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "src"),
};

const bootstrap = path.resolve(
  __dirname,
  "node_modules/bootstrap/dist/css/bootstrap.css"
);
// module.exports = smw.wrap();
module.exports = {
  mode: "development",
  // mode: "production",
  devtool: false,
  entry: "./src/index.js",
  // entry: {
  //   page1: "./src/page1.js",
  //   page2: "./src/page2.js",
  // },
  cache: {
    type: "filesystem",
    cacheDirectory: path.resolve(__dirname, "node_modules/.cache/webpack"),
  },
  output: {
    path: path.resolve("dist"),
    filename: "[name].[chunkhash:8].js",
    // library: "calculator",
    // libraryTarget: "var",
    // libraryTarget: "commonjs",
    // console.log(exports.calculator(1, 2));

    // libraryExport: "sum",
    // libraryTarget: "commonjs2",
    // console.log(module.exports.calculator(1, 2));

    // libraryTarget: "this",//window , global

    // libraryTarget: "umd",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            arguments: false,
            dead_code: true,
          },
          mangle: true,
          toplevel: true,
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
    splitChunks: {
      chunks: "all", //默认作用于异步chunk，值为all/initial/async
      minSize: 0, //默认值是30kb,代码块的最小尺寸
      minChunks: 1, //被多少模块共享,在分割之前模块的被引用次数
      maxAsyncRequests: 3, //限制异步模块内部的并行最大请求数的，说白了你可以理解为是每个import()它里面的最大并行请求数量
      maxInitialRequests: 5, //限制入口的拆分数量
      // name: true, //打包后的名称，默认是chunk的名字通过分隔符（默认是～）分隔开，如vendor~
      automaticNameDelimiter: "~", //默认webpack将会使用入口名和代码块的名称生成命名,比如 'vendors~main.js'
      cacheGroups: {
        //设置缓存组用来抽取满足不同规则的chunk,下面以生成common为例
        vendors: {
          chunks: "all",
          test: /node_modules/, //条件
          priority: -10, ///优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中,为了能够让自定义缓存组有更高的优先级(默认0),默认缓存组的priority属性为负值.
        },
        default: {
          chunks: "all",
          minSize: 0, //最小提取字节数
          minChunks: 2, //最少被几个chunk引用
          priority: -20,
          reuseExistingChunk: false,
        },
      },
    },
    // runtimeChunk: {
    //   name: (entrypoint) => `runtime~${entrypoint.name}`,
    // },
  },
  /*  resolve: {
    extensions: [".js", ".jsx", ".json", ".css"],
    alias: {
      // bootstrap,
    },
    modules: ["node_modules"],
    // 配置 target === "web" 或者 target === "webworker" 时 mainFields 默认值是：
    mainFields: ["browser", "module", "main"],
    mainFiles: ["index"], // 你可以添加其他默认使用的文件名
  },
  resolveLoader: {
    modules: ["node_modules"],
    extensions: [".js", ".json"],
    mainFields: ["loader", "main"],
  }, */
  module: {
    // noParse: /jquery|lodash/, // 正则表达式
    rules: [
      {
        test: /\.js/,
        include: path.resolve(__dirname, "src"),
        use: [
          {
            loader: "thread-loader",
            options: {
              workers: 3,
            },
          },
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              presets: [
                ["@babel/preset-env", { modules: false }],
                "@babel/preset-react",
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    // new webpack.IgnorePlugin({
    //   contextRegExp: /moment/,
    //   resourceRegExp: /^\.\/locale/,
    // }),
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:8].css",
    }),
    new PurgeCSSPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    }),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ["**/*"] }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CssMinimizerPlugin(),
  ],
};
