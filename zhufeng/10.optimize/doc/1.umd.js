(function webpackUniversalModuleDefinition(root, factory) {
  //commonjs2
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
    // amd
  else if (typeof define === "function" && define.amd) define([], factory);
  //commonjs
  else if (typeof exports === "object") exports["calculator"] = factory();
  //全局变量 window/global
  else root["calculator"] = factory();
})(self, function () {
  return { add, minus };
});
