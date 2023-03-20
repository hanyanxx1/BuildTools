const fs = require("fs").promises;
const path = require("path");
const {
  parse,
  compileScript,
  compileTemplate,
  rewriteDefault,
  compileStyleAsync,
} = require("@vue/compiler-sfc");
var descriptorCache = new Map();
function vuePlugin({ app, projectRoot }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith(".vue")) {
      return await next();
    }
    const filePath = path.join(projectRoot, ctx.path);
    const descriptor = await getDescriptor(filePath, projectRoot);
    if (ctx.query.type === "style") {
      const block = descriptor.styles[Number(ctx.query.index)];
      let result = await transformStyle(
        block.content,
        descriptor,
        ctx.query.index
      );
      ctx.type = "js";
      ctx.body = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(result.code)};
        document.head.appendChild(style);
      `;
    } else {
      let targetCode = ``;
      if (descriptor.styles?.length) {
        let stylesCode = "";
        descriptor.styles.forEach((style, index) => {
          const query = `?vue&type=style&index=${index}&lang.css`;
          const id = ctx.path;
          const styleRequest = (id + query).replace(/\\/g, "/");
          stylesCode += `\nimport ${JSON.stringify(styleRequest)}`;
        });
        targetCode += stylesCode;
      }
      if (descriptor.script) {
        let scriptCode = compileScript(descriptor, {
          id: filePath,
          reactivityTransform: false,
        });
        scriptCode = rewriteDefault(scriptCode.content, "_sfc_main");
        targetCode += scriptCode;
      }
      if (descriptor.template) {
        let templateContent = descriptor.template.content;
        let { code } = compileTemplate({
          id: filePath,
          source: templateContent,
        });
        code = code.replace(/export function render/, "function _sfc_render");
        targetCode += code;
      }
      targetCode += `\n_sfc_main.render=_sfc_render`;
      targetCode += `\nexport default _sfc_main`;
      ctx.type = "js";
      ctx.body = targetCode;
    }
  });
}

async function transformStyle(code, descriptor, index) {
  const block = descriptor.styles[index];
  const result = await compileStyleAsync({
    filename: descriptor.filename,
    source: code,
    id: `data-v-${descriptor.id}`,
    scoped: block.scoped,
  });
  return result;
}

async function getDescriptor(filePath) {
  if (descriptorCache.has(filePath)) {
    return descriptorCache.get();
  }
  const content = await fs.readFile(filePath, "utf-8");
  const { descriptor } = parse(content, { filename: filePath });
  descriptorCache.set(filePath, descriptor);
  return descriptor;
}
module.exports = vuePlugin;
