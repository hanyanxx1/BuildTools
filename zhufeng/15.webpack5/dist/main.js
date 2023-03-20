(() => {
  "use strict";
  var e,
    t,
    r,
    n,
    o,
    s,
    a,
    i,
    d,
    l,
    u,
    c,
    m,
    p,
    f = {
      "./node_modules/css-loader/dist/cjs.js!./src/index.css": (e, t, r) => {
        r.d(t, { Z: () => i });
        var n = r("./node_modules/css-loader/dist/runtime/noSourceMaps.js"),
          o = r.n(n),
          s = r("./node_modules/css-loader/dist/runtime/api.js"),
          a = r.n(s)()(o());
        a.push([e.id, "body {\n  background-color: #fff;\n}\n", ""]);
        const i = a;
      },
      "./node_modules/css-loader/dist/runtime/api.js": (e) => {
        e.exports = function (e) {
          var t = [];
          return (
            (t.toString = function () {
              return this.map(function (t) {
                var r = "",
                  n = void 0 !== t[5];
                return (
                  t[4] && (r += "@supports (".concat(t[4], ") {")),
                  t[2] && (r += "@media ".concat(t[2], " {")),
                  n &&
                    (r += "@layer".concat(
                      t[5].length > 0 ? " ".concat(t[5]) : "",
                      " {"
                    )),
                  (r += e(t)),
                  n && (r += "}"),
                  t[2] && (r += "}"),
                  t[4] && (r += "}"),
                  r
                );
              }).join("");
            }),
            (t.i = function (e, r, n, o, s) {
              "string" == typeof e && (e = [[null, e, void 0]]);
              var a = {};
              if (n)
                for (var i = 0; i < this.length; i++) {
                  var d = this[i][0];
                  null != d && (a[d] = !0);
                }
              for (var l = 0; l < e.length; l++) {
                var u = [].concat(e[l]);
                (n && a[u[0]]) ||
                  (void 0 !== s &&
                    (void 0 === u[5] ||
                      (u[1] = "@layer"
                        .concat(u[5].length > 0 ? " ".concat(u[5]) : "", " {")
                        .concat(u[1], "}")),
                    (u[5] = s)),
                  r &&
                    (u[2]
                      ? ((u[1] = "@media "
                          .concat(u[2], " {")
                          .concat(u[1], "}")),
                        (u[2] = r))
                      : (u[2] = r)),
                  o &&
                    (u[4]
                      ? ((u[1] = "@supports ("
                          .concat(u[4], ") {")
                          .concat(u[1], "}")),
                        (u[4] = o))
                      : (u[4] = "".concat(o))),
                  t.push(u));
              }
            }),
            t
          );
        };
      },
      "./node_modules/css-loader/dist/runtime/noSourceMaps.js": (e) => {
        e.exports = function (e) {
          return e[1];
        };
      },
      "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js": (
        e
      ) => {
        var t = [];
        function r(e) {
          for (var r = -1, n = 0; n < t.length; n++)
            if (t[n].identifier === e) {
              r = n;
              break;
            }
          return r;
        }
        function n(e, n) {
          for (var s = {}, a = [], i = 0; i < e.length; i++) {
            var d = e[i],
              l = n.base ? d[0] + n.base : d[0],
              u = s[l] || 0,
              c = "".concat(l, " ").concat(u);
            s[l] = u + 1;
            var m = r(c),
              p = {
                css: d[1],
                media: d[2],
                sourceMap: d[3],
                supports: d[4],
                layer: d[5],
              };
            if (-1 !== m) t[m].references++, t[m].updater(p);
            else {
              var f = o(p, n);
              (n.byIndex = i),
                t.splice(i, 0, { identifier: c, updater: f, references: 1 });
            }
            a.push(c);
          }
          return a;
        }
        function o(e, t) {
          var r = t.domAPI(t);
          return (
            r.update(e),
            function (t) {
              if (t) {
                if (
                  t.css === e.css &&
                  t.media === e.media &&
                  t.sourceMap === e.sourceMap &&
                  t.supports === e.supports &&
                  t.layer === e.layer
                )
                  return;
                r.update((e = t));
              } else r.remove();
            }
          );
        }
        e.exports = function (e, o) {
          var s = n((e = e || []), (o = o || {}));
          return function (e) {
            e = e || [];
            for (var a = 0; a < s.length; a++) {
              var i = r(s[a]);
              t[i].references--;
            }
            for (var d = n(e, o), l = 0; l < s.length; l++) {
              var u = r(s[l]);
              0 === t[u].references && (t[u].updater(), t.splice(u, 1));
            }
            s = d;
          };
        };
      },
      "./node_modules/style-loader/dist/runtime/insertBySelector.js": (e) => {
        var t = {};
        e.exports = function (e, r) {
          var n = (function (e) {
            if (void 0 === t[e]) {
              var r = document.querySelector(e);
              if (
                window.HTMLIFrameElement &&
                r instanceof window.HTMLIFrameElement
              )
                try {
                  r = r.contentDocument.head;
                } catch (e) {
                  r = null;
                }
              t[e] = r;
            }
            return t[e];
          })(e);
          if (!n)
            throw new Error(
              "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
            );
          n.appendChild(r);
        };
      },
      "./node_modules/style-loader/dist/runtime/insertStyleElement.js": (e) => {
        e.exports = function (e) {
          var t = document.createElement("style");
          return e.setAttributes(t, e.attributes), e.insert(t, e.options), t;
        };
      },
      "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
        (e, t, r) => {
          e.exports = function (e) {
            var t = r.nc;
            t && e.setAttribute("nonce", t);
          };
        },
      "./node_modules/style-loader/dist/runtime/styleDomAPI.js": (e) => {
        e.exports = function (e) {
          var t = e.insertStyleElement(e);
          return {
            update: function (r) {
              !(function (e, t, r) {
                var n = "";
                r.supports && (n += "@supports (".concat(r.supports, ") {")),
                  r.media && (n += "@media ".concat(r.media, " {"));
                var o = void 0 !== r.layer;
                o &&
                  (n += "@layer".concat(
                    r.layer.length > 0 ? " ".concat(r.layer) : "",
                    " {"
                  )),
                  (n += r.css),
                  o && (n += "}"),
                  r.media && (n += "}"),
                  r.supports && (n += "}");
                var s = r.sourceMap;
                s &&
                  "undefined" != typeof btoa &&
                  (n +=
                    "\n/*# sourceMappingURL=data:application/json;base64,".concat(
                      btoa(unescape(encodeURIComponent(JSON.stringify(s)))),
                      " */"
                    )),
                  t.styleTagTransform(n, e, t.options);
              })(t, e, r);
            },
            remove: function () {
              !(function (e) {
                if (null === e.parentNode) return !1;
                e.parentNode.removeChild(e);
              })(t);
            },
          };
        };
      },
      "./node_modules/style-loader/dist/runtime/styleTagTransform.js": (e) => {
        e.exports = function (e, t) {
          if (t.styleSheet) t.styleSheet.cssText = e;
          else {
            for (; t.firstChild; ) t.removeChild(t.firstChild);
            t.appendChild(document.createTextNode(e));
          }
        };
      },
    },
    y = {};
  function v(e) {
    var t = y[e];
    if (void 0 !== t) return t.exports;
    var r = (y[e] = { id: e, exports: {} });
    return f[e](r, r.exports, v), r.exports;
  }
  (v.n = (e) => {
    var t = e && e.__esModule ? () => e.default : () => e;
    return v.d(t, { a: t }), t;
  }),
    (v.d = (e, t) => {
      for (var r in t)
        v.o(t, r) &&
          !v.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (v.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (v.nc = void 0),
    (e = v(
      "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js"
    )),
    (t = v.n(e)),
    (r = v("./node_modules/style-loader/dist/runtime/styleDomAPI.js")),
    (n = v.n(r)),
    (o = v("./node_modules/style-loader/dist/runtime/insertBySelector.js")),
    (s = v.n(o)),
    (a = v(
      "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js"
    )),
    (i = v.n(a)),
    (d = v("./node_modules/style-loader/dist/runtime/insertStyleElement.js")),
    (l = v.n(d)),
    (u = v("./node_modules/style-loader/dist/runtime/styleTagTransform.js")),
    (c = v.n(u)),
    (m = v("./node_modules/css-loader/dist/cjs.js!./src/index.css")),
    ((p = {}).styleTagTransform = c()),
    (p.setAttributes = i()),
    (p.insert = s().bind(null, "head")),
    (p.domAPI = n()),
    (p.insertStyleElement = l()),
    t()(m.Z, p),
    m.Z && m.Z.locals && m.Z.locals;
})();
