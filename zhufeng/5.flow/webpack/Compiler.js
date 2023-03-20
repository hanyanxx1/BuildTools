let { SyncHook } = require("tapable");
const path = require("path");
const fs = require("fs");
const types = require("babel-types");
const parser = require("@babel/parser"); //源代码转成AST抽象语法树
const traverse = require("@babel/traverse").default; //遍历语法树
const generator = require("@babel/generator").default; //把语法树重新生成代码
//path.posix.sep / path.sep不同操作系统的路径分隔符 \/
function toUnixPath(filePath) {
  return filePath.replace(/\\/g, "/");
}
//根目录，当前工作目录
let baseDir = toUnixPath(process.cwd());

class Compiler {
  constructor(options) {
    this.options = options;
    this.hooks = {
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook(),
    };
    this.entries = [];
    this.modules = [];
    this.chunks = [];
    this.assets = {};
    this.files = [];
  }

  run(callback) {
    this.hooks.run.call();
    let entry = {};
    if (typeof this.options.entry === "string") {
      entry.main = this.options.entry;
    } else {
      entry = this.options.entry;
    }
    for (let entryName in entry) {
      let entryFilePath = toUnixPath(
        path.join(this.options.context, entry[entryName])
      );
      let entryModule = this.buildModule(entryName, entryFilePath);
      let chunk = {
        name: entryName,
        entryModule,
        modules: this.modules.filter((module) => module.name === entryName),
      };
      this.chunks.push(chunk);
      this.entries.push(chunk);
    }

    this.chunks.forEach((chunk) => {
      let filename = this.options.output.filename.replace("[name]", chunk.name);
      this.assets[filename] = getSource(chunk);
    });
    this.hooks.emit.call();

    this.files = Object.keys(this.assets);

    for (let file in this.assets) {
      let targetPath = path.join(this.options.output.path, file);
      fs.writeFileSync(targetPath, this.assets[file]);
    }

    this.hooks.done.call();
    callback(null, {
      toJson: () => {
        return {
          entries: this.entries,
          chunks: this.chunks,
          modules: this.modules,
          files: this.files,
          assets: this.assets,
        };
      },
    });
  }

  buildModule = (name, modulePath) => {
    let originalSourceCode = fs.readFileSync(modulePath, "utf8");
    let targetSourceCode = originalSourceCode;

    let rules = this.options.module.rules;
    let loaders = [];
    for (let i = 0; i < rules.length; i++) {
      if (rules[i].test.test(modulePath)) {
        loaders = [...loaders, ...rules[i].use];
      }
    }
    for (let i = loaders.length - 1; i >= 0; i--) {
      let loader = loaders[i];
      targetSourceCode = require(loader)(targetSourceCode);
    }

    let moduleId = "./" + path.posix.relative(baseDir, modulePath);
    let module = { id: moduleId, dependencies: [], name };
    let astTree = parser.parse(targetSourceCode, { sourceType: "module" });

    traverse(astTree, {
      CallExpression: ({ node }) => {
        if (node.callee.name === "require") {
          //./title
          let moduleName = node.arguments[0].value;
          ///Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/webpack/zhufeng/5.flow/src
          let dirname = path.posix.dirname(modulePath);
          ///Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/webpack/zhufeng/5.flow/src/title
          let depModulePath = path.posix.join(dirname, moduleName);

          let extensions = this.options.resolve.extensions;
          depModulePath = tryExtensions(
            depModulePath,
            extensions,
            moduleName,
            dirname
          );
          let depModuleId = "./" + path.posix.relative(baseDir, depModulePath); //./src/title.js
          node.arguments = [types.stringLiteral(depModuleId)];
          module.dependencies.push(depModulePath);
        }
      },
    });

    let { code } = generator(astTree);
    module._source = code;
    module.dependencies.forEach((dependency) => {
      let dependencyModule = this.buildModule(name, dependency);
      this.modules.push(dependencyModule);
    });
    return module;
  };
}

function getSource(chunk) {
  return `
   (() => {
    var modules = {
      ${chunk.modules
        .map(
          (module) => `
          "${module.id}": (module,exports,require) => {
            ${module._source}
          }`
        )
        .join(",")}
    };
    var cache = {};
    function require(moduleId) {
      if (cache[moduleId]) {
        return cache[moduleId].exports;
      }
      var module = (cache[moduleId] = {
        exports: {},
      });
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    (() => {
     ${chunk.entryModule._source}
    })();
  })();
   `;
}

function tryExtensions(
  modulePath,
  extensions,
  originalModulePath,
  moduleContext
) {
  for (let i = 0; i < extensions.length; i++) {
    if (fs.existsSync(modulePath + extensions[i])) {
      return modulePath + extensions[i];
    }
  }
  throw new Error(
    `Module not found: Error: Can't resolve '${originalModulePath}' in '${moduleContext}'`
  );
}

module.exports = Compiler;
