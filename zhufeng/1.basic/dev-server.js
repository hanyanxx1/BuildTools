const webpack = require("webpack");
const WebpackDevMiddleware = require("webpack-dev-middleware");
const express = require("express");
const webpackOptions = require('./webpack.config');

const app = express();
const compiler = webpack(webpackOptions);
app.use(WebpackDevMiddleware(compiler, {}));
app.listen(9000);
