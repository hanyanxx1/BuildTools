const { build } = require("esbuild");
const httpImport = require("./http-import-plugin");
const html = require("./html-plugin");
// const env = require("./env-plugin");
async function runBuild() {
  build({
    absWorkingDir: process.cwd(),
    entryPoints: ["./src/index.jsx"],
    entryNames: "[dir]/[name]-[hash]",
    outdir: "dist",
    bundle: true,
    format: "esm",
    splitting: true,
    sourcemap: true,
    metafile: true,
    chunkNames: "[name]-[hash]",
    assetNames: "assets/[name]-[hash]",
    plugins: [httpImport(), html()],
    // plugins: [env],
  }).then(() => {
    console.log("🚀 Build Finished!");
  });
}

runBuild();
