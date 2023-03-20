import path from "path";
import Module from "module";
function resolve() {
  return {
    name: "resolve",
    //因为我们要改造根据模块的名称查找模所路径的逻辑
    async resolveId(importee, importer) {
      //如果是相对路径，则走默认逻辑
      // importee: ./src/index.js
      // importee: check-is-array
      if (importee[0] === "." || path.isAbsolute(importee)) {
        return null;
      }
      let location = Module.createRequire(path.dirname(importer)).resolve(
        importee
      );
      return location;
    },
  };
}
export default resolve;
