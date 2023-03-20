let fs = require("fs");
let path = require("path");
let Module = require("./module");
let MagicString = require("magic-string");

class Bundle {
  constructor(options) {
    //入口文件数据
    // /Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/19.rollup/src/main.js
    this.entryPath = path.resolve(options.entry.replace(/\.js$/, "") + ".js");
    this.modules = {};
  }

  build(filename) {
    //filename:bundle.js
    const entryModule = this.fetchModule(this.entryPath); //获取模块代码
    this.statements = entryModule.expandAllStatements(true); //展开所有的语句
    const { code } = this.generate(); //生成打包后的代码
    fs.writeFileSync(filename, code);
  }

  fetchModule(importee, importer) {
    ///Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/19.rollup/src/main.js
    let route;
    if (!importee) {
      route = importee;
    } else {
      if (path.isAbsolute(importee)) {
        route = importee;
      } else {
        route = path.resolve(
          path.dirname(importer),
          importee.replace(/\.js$/, "") + ".js"
        );
      }
    }
    if (route) {
      let code = fs.readFileSync(route, "utf-8");
      let module = new Module({
        code,
        path: importee,
        bundle: this,
      });
      return module;
    }
  }

  generate() {
    let magicString = new MagicString.Bundle();
    this.statements.forEach((statement) => {
      const source = statement._source.clone();
      if (statement.type === "ExportNamedDeclaration") {
        source.remove(statement.start, statement.declaration.start);
      }
      magicString.addSource({
        content: source,
        separator: "\n",
      });
    });
    return { code: magicString.toString() };
  }
}

module.exports = Bundle;
