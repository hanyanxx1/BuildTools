const webpack = require("webpack");
const webpackOptions = require("./webpack.config");

const compiler = webpack(webpackOptions);
compiler.run((err, status) => {
  console.log("err:", err);
  console.log(
    status.toJson({
      entries: true,
      chunks: true,
      modules: true,
      assets: true,
    })
  );
});

console.log(webpackOptions);
