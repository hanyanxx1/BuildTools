// const DonePlugin = require("./plugins/DonePlugin");
// const AssetsPlugin = require("./plugins/AssetsPlugin");
// const ZipPlugin = require("./plugins/ZipPlugin");
// const HtmlWebpackPlugin = require("html-webpack-plugin");
const AutoExternalPlugin = require("./plugins/AutoExternalPlugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  devtool: false,
  /* externals: {
    jquery: "$",
    lodash: "_",
  }, */
  plugins: [
    /* new HtmlWebpackPlugin({
      template: "./src/index.html",
    }), */
    new AutoExternalPlugin({
      jquery: {
        expose: "$",
        url: "https://cdn.bootcss.com/jquery/3.1.0/jquery.js",
      },
      lodash: {
        expose: "_",
        url: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js",
      },
    }),
  ],
};
