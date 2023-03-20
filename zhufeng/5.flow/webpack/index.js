let Compiler = require("./Compiler");
function webpack(options) {
  let shellConfig = process.argv.slice(2).reduce((shellConfig, item) => {
    let [key, value] = item.split("=");
    shellConfig[key.slice(2)] = value;
    return shellConfig;
  }, {});

  let finalOptions = { ...options, ...shellConfig };
  let compiler = new Compiler(finalOptions);

  if (finalOptions.plugins && Array.isArray(finalOptions.plugins)) {
    for (let plugin of finalOptions.plugins) {
      plugin.apply(compiler);
    }
  }

  return compiler;
}

module.exports = webpack;
