const fs = require("fs").promises;
const modulesRegexp = /^\/@modules\//;
const { resolveVue } = require("./utils");

function moduleResolvePlugin({ app, projectRoot }) {
  const vueResolved = resolveVue(projectRoot);

  app.use(async (ctx, next) => {
    if (!modulesRegexp.test(ctx.path)) {
      return await next();
    }
    const id = ctx.path.replace(modulesRegexp, "");
    ctx.type = "js";
    const content = await fs.readFile(vueResolved[id], "utf-8");
    ctx.body = content;
  });
}
module.exports = moduleResolvePlugin;
