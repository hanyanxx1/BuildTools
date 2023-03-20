class DonePlugin {
  apply(compiler) {
    compiler.hooks.done.tapAsync("DonePlugin", (status, callback) => {
      console.log("DonePlugin");
      callback();
    });
  }
}
module.exports = DonePlugin;
