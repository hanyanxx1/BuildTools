const { RawSource } = require("webpack-sources");
class AssetsPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync("AssetsPlugin", (compilation, callback) => {
      let assetList = ``;
      for (let file in compilation.assets) {
        let source = compilation.assets[file].source();
        assetList += `${file} ${source.length} bytes\r\n`;
      }
      compilation.assets["assets.md"] = new RawSource(assetList);
      callback();
    });
    // compiler.hooks.compilation.tap("AssetsPlugin", (compilation) => {
    //   // compilation.hooks.chunkAsset.tap("AssetsPlugin", (chunk, filename) => {
    //   //   console.log(chunk.name, filename);
    //   // });
    // });
  }
}
module.exports = AssetsPlugin;
