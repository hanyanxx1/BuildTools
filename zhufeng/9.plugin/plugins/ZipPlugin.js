const { RawSource } = require("webpack-sources");
let JSZIP = require("jszip");

class ZipPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync("ZipPlugin", (compilation, callback) => {
      let zip = new JSZIP();
      for (let filename in compilation.assets) {
        let source = compilation.assets[filename].source();
        zip.file(filename, source);
      }
      zip.generateAsync({ type: "nodebuffer" }).then((content) => {
        compilation.assets["assets.zip"] = new RawSource(content);
        callback();
      });
    });
  }
}
module.exports = ZipPlugin;
