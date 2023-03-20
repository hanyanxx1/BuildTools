let { readBody } = require("./utils");
let MagicString = require("magic-string");
let { parse } = require("es-module-lexer");
let path = require("path");
async function rewriteImports(content) {
  var magicString = new MagicString(content);
  let imports = await parse(content);
  // imports: [
  //   [ { n: 'vue', s: 27, e: 30, ss: 0, se: 31, d: -1, a: -1 } ],
  //   [],
  //   false
  // ]
  if (imports && imports.length > 0) {
    for (let i = 0; i < imports[0].length; i++) {
      const { n, s, e } = imports[0][i];
      //vue 27 30
      //如果开头既不是/也不是.的话才会需要替换
      if (/^[^\/\.]/.test(n)) {
        const rewriteModuleId = `/@modules/${n}`;
        //rewriteModuleId /node_modules/.vite/vue
        magicString.overwrite(s, e, rewriteModuleId);
      }
    }
  }
  return magicString.toString();
}

function moduleRewritePlugin({ app, projectRoot }) {
  app.use(async (ctx, next) => {
    await next(); //一上来就next了 next之前神马都没有
    //如果有响应体，并且此响应体的内容类型是js  mime-type=application/javascript
    if (ctx.body && ctx.response.is("js")) {
      const content = await readBody(ctx.body);
      const result = await rewriteImports(content);
      ctx.body = result;
    }
  });
}

module.exports = moduleRewritePlugin;
