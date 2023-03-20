const scanImports = require("./scan");
const fs = require("fs-extra");
const path = require("path");
const { build } = require("esbuild");
const { normalizePath } = require("../utils");

async function createOptimizeDepsRun(config) {
  //'{"vue":"/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/vue/dist/vue.runtime.esm-bundler.js"}'
  const deps = await scanImports(config);
  const { cacheDir } = config;
  //'/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps'
  const depsCacheDir = path.resolve(cacheDir, "deps");
  //'/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps/_metadata.json'
  const metadataPath = path.join(depsCacheDir, "_metadata.json");
  const metadata = {
    optimized: {},
  };
  for (const id in deps) {
    const entry = deps[id];
    // {
    //   "optimized": {
    //     "vue": {
    //       "file": "/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps/vue.js",
    //       "src": "/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/vue/dist/vue.runtime.esm-bundler.js"
    //     }
    //   }
    // }
    metadata.optimized[id] = {
      file: normalizePath(path.resolve(depsCacheDir, id + ".js")),
      src: entry,
    };
    await build({
      //'/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source'
      absWorkingDir: process.cwd(),
      //'/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/vue/dist/vue.runtime.esm-bundler.js'
      entryPoints: [deps[id]],
      //'/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps/vue.js'
      outfile: path.resolve(depsCacheDir, id + ".js"),
      bundle: true,
      write: true,
      format: "esm",
    });
  }
  await fs.ensureDir(depsCacheDir);
  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      metadata,
      (key, value) => {
        if (key === "file" || key === "src") {
          //optimized里存的是绝对路径，此处写入硬盘的是相对于缓存目录的相对路径
          // depsCacheDir: /Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps
          // value: /Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps/vue.js
          // depsCacheDir: /Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/.vite7/deps
          // value: /Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/22.vite-source/node_modules/vue/dist/vue.runtime.esm-bundler.js
          console.log("depsCacheDir:", depsCacheDir);
          console.log("value:", value);
          //'vue.js'
          //'../../vue/dist/vue.runtime.esm-bundler.js'
          return normalizePath(path.relative(depsCacheDir, value));
        }
        return value;
      },
      2
    )
  );
  return { metadata };
}
exports.createOptimizeDepsRun = createOptimizeDepsRun;
