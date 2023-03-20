(() => {
  //最新的hash值
  var currentHash;
  //上一次的hash值
  var lastHash;
  function hotCheck() {
    console.log("开始进行热更新的检查!");
    hotDownloadManifest()
      .then((update) => {
        update.c.forEach((chunkId) => {
          hotDownloadUpdateChunk(chunkId);
        });
        lastHash = currentHash;
      })
      .catch(() => {
        window.location.reload();
      });
  }
  function hotDownloadManifest() {
    return fetch(`main.${lastHash}.hot-update.json`).then((res) => res.json());
  }
  function hotDownloadUpdateChunk(chunkId) {
    let script = document.createElement("script");
    script.src = `${chunkId}.${lastHash}.hot-update.js`;
    document.head.appendChild(script);
  }
  self["webpackHotUpdate"] = function (chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules);
  };
  let hotUpdate = {};
  function hotAddUpdateChunk(chunkId, moreModules) {
    for (var moduleId in moreModules) {
      //合并到模块定义对象里
      hotUpdate[moduleId] = modules[moduleId] = moreModules[moduleId];
    }
    hotApply();
  }
  function hotApply() {
    for (let moduleId in hotUpdate) {
      let oldModule = cache[moduleId];
      delete cache[moduleId]; //得把老的缓存删除，不然再加载还会读到老模块
      if (oldModule.parents && oldModule.parents.size > 0) {
        let parents = oldModule.parents;
        parents.forEach((father) => {
          father.hot.check(moduleId);
        });
      }
    }
  }
  var modules = {
    "./src/index.js": (module, exports, require) => {
      let render = () => {
        let title = require("./src/title.js");
        document.getElementById("root").innerText = title;
      };
      render();
      if (module.hot) {
        module.hot.accept(["./src/title.js"], render);
      }
    },
    "./src/title.js": (module, exports, require) => {
      module.exports = "title";
    },
    "./webpack/hot/emitter.js": (module, exports, require) => {
      class EventEmitter {
        constructor() {
          this.events = {};
        }
        on(eventName, fn) {
          this.events[eventName] = fn;
        }
        emit(eventName, ...args) {
          this.events[eventName](...args);
        }
      }
      module.exports = new EventEmitter();
    },
  };
  var cache = {};
  function hotCreateModule() {
    let hot = {
      _acceptedDependencies: {},
      accept(deps, callback) {
        for (let i = 0; i < deps.length; i++) {
          hot._acceptedDependencies[deps[i]] = callback;
        }
      },
      check(moduleId) {
        let callback = hot._acceptedDependencies[moduleId];
        callback && callback();
      },
    };
    return hot;
  }
  function hotCreateRequire(parentModuleId) {
    var parentModule = cache[parentModuleId];
    if (!parentModule) return require;
    var hotRequire = function (childModuleId) {
      parentModule.children.add(childModuleId);
      let childExports = require(childModuleId);
      let childModule = cache[childModuleId];
      childModule.parents.add(parentModule);
      return childExports;
    };
    return hotRequire;
  }
  function require(moduleId) {
    var cachedModule = cache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (cache[moduleId] = {
      exports: {},
      hot: hotCreateModule(), //每个模块都会多一个hot属性，用来注册热更新回调
      parents: new Set(), //父模块数组
      children: new Set(), //子模块数组
    });
    modules[moduleId](module, module.exports, hotCreateRequire(moduleId));
    return module.exports;
  }
  (() => {
    var hotEmitter = require("./webpack/hot/emitter.js");
    var socket = io();
    var currentHash;
    socket.on("hash", (hash) => {
      console.log("客户端据此到hash消息");
      currentHash = hash;
    });
    socket.on("ok", () => {
      console.log("客户端据此到ok消息");
      reloadApp();
    });
    function reloadApp() {
      hotEmitter.emit("webpackHotUpdate", currentHash);
    }
  })();
  (() => {
    var hotEmitter = require("./webpack/hot/emitter.js");
    hotEmitter.on("webpackHotUpdate", (currentHash) => {
      if (!lastHash) {
        lastHash = currentHash;
        console.log("这是第一次收到hash值，是首次渲染，到此结束");
        return;
      }
      console.log(
        "lastHash=",
        lastHash,
        "currentHash=",
        currentHash,
        "开始真正热更新"
      );
      hotCheck();
    });
  })();
  hotCreateRequire("./src/index.js")("./src/index.js");
})();
