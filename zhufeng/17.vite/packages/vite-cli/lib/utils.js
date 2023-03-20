const { Readable } = require("stream");
const path = require("path");
async function readBody(stream) {
  if (stream instanceof Readable) {
    return new Promise((resolve) => {
      let buffers = [];
      stream
        .on("data", (chunk) => buffers.push(chunk))
        .on("end", () => resolve(Buffer.concat(buffers).toString("utf-8")));
    });
  } else {
    return stream.toString("utf-8");
  }
}
exports.readBody = readBody;

function resolveVue(projectRoot) {
  const compilerPkgPath = path.resolve(
    projectRoot,
    "../../node_modules",
    "@vue/compiler-sfc/package.json"
  );
  const compilerPkg = require(compilerPkgPath);
  const compilerPath = path.join(
    path.dirname(compilerPkgPath),
    compilerPkg.main
  );
  const resolvePath = (moduleName) =>
    require.resolve(`@vue/${moduleName}/dist/${moduleName}.esm-bundler.js`);
  return {
    compiler: compilerPath,
    "@vue/shared": resolvePath("shared"),
    "@vue/reactivity": resolvePath("reactivity"),
    "@vue/runtime-core": resolvePath("runtime-core"),
    "@vue/runtime-dom": resolvePath("runtime-dom"),
    vue: resolvePath("runtime-dom"),
  };
}
exports.resolveVue = resolveVue;
