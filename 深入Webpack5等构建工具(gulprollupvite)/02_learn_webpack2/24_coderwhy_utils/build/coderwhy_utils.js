!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define([], t)
    : "object" == typeof exports
    ? (exports.coderwhyUtils = t())
    : (e.coderwhyUtils = t());
})(this, function () {
  return (() => {
    "use strict";
    var e = {
        d: (t, o) => {
          for (var r in o)
            e.o(o, r) &&
              !e.o(t, r) &&
              Object.defineProperty(t, r, { enumerable: !0, get: o[r] });
        },
        o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
        r: (e) => {
          "undefined" != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
            Object.defineProperty(e, "__esModule", { value: !0 });
        },
      },
      t = {};
    e.r(t), e.d(t, { format: () => r, math: () => o });
    var o = {};
    e.r(o), e.d(o, { mul: () => u, sum: () => n });
    var r = {};
    function n(e, t) {
      return e + t;
    }
    function u(e, t) {
      return e + t;
    }
    function d() {
      return "2021-11-11";
    }
    return e.r(r), e.d(r, { dateFormat: () => d }), console.log("abc"), t;
  })();
});
