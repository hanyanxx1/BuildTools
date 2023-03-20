const Koa = require("koa");
const serveStaticPlugin = require("./serveStaticPlugin");
const moduleRewritePlugin = require("./moduleRewritePlugin");
const moduleResolvePlugin = require("./moduleResolvePlugin");
const injectProcessPlugin = require("./injectProcessPlugin");
const vuePlugin = require("./vuePlugin");
function createServer() {
  const app = new Koa();
  const projectRoot = process.cwd();
  // 构建上下文对象
  const context = {
    app,
    projectRoot,
  };
  app.use((ctx, next) => {
    // 扩展ctx属性
    Object.assign(ctx, context);
    return next();
  });
  const resolvedPlugins = [
    injectProcessPlugin,
    moduleRewritePlugin,
    moduleResolvePlugin,
    vuePlugin,
    serveStaticPlugin,
  ];
  // 依次注册所有插件
  resolvedPlugins.forEach((plugin) => plugin(context));
  return app;
}
createServer().listen(4000, () => {
  console.log("vite服务器已经在4000端口启动");
});
