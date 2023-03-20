const path = require("path");
const static = require("koa-static");
//这个插件相当于给应用添加了一个静态文件中间件，以前的命令选择目录为根目录
function serveStaticPlugin({ app, projectRoot }) {
  app.use(static(projectRoot));
}
module.exports = serveStaticPlugin;
