const webpack = require("./webpack");
const options = require("./webpack.config");
const compiler = webpack(options);
compiler.run((err, stats) => {
  //编译完成之后执行回调
  console.log(err); //错误信息
  //stats是编译结果的描述对象
  console.log(
    JSON.stringify(
      stats.toJson({
        //webpack4都是数组 webpack5里都是set
        assets: true, //产出的资源 [main.js]
        chunks: true, //代码块 [main]
        modules: true, //模块 ['./src/index.js','./src/title.js']
        entries: true, //入口entrypoints []./src/index.js]
      }),
      null,
      2
    )
  );
});
