class Hook {
  constructor(args) {
    if (!Array.isArray(args)) {
      args = [];
    }
    this._args = args;
    this.taps = [];
    this.interceptors = [];
    this.call = CALL_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this.promise = PROMISE_DELEGATE;
  }

  tap(options, fn) {
    this._tap("sync", options, fn);
  }

  tapAsync(options, fn) {
    this._tap("async", options, fn);
  }

  tapPromise(options, fn) {
    this._tap("promise", options, fn);
  }

  _tap(type, options, fn) {
    if (typeof options === "string") options = { name: options };
    let tapInfo = { ...options, type, fn };
    tapInfo = this._runRegisterInterceptors(tapInfo);
    this._insert(tapInfo);
  }

  _runRegisterInterceptors(tapInfo) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        let newTapInfo = interceptor.register(tapInfo);
        if (newTapInfo) {
          tapInfo = newTapInfo;
        }
      }
    }
    return tapInfo;
  }

  intercept(interceptor) {
    this.interceptors.push(interceptor);
  }

  _resetCompilation() {
    this.call = CALL_DELEGATE;
  }

  _insert(tapInfo) {
    this._resetCompilation();
    let before;
    if (typeof tapInfo.before === "string") {
      before = new Set([tapInfo.before]);
    } else if (Array.isArray(tapInfo.before)) {
      before = new Set(tapInfo.before);
    }
    let stage = 0;
    if (typeof tapInfo.stage === "number") {
      stage = tapInfo.stage;
    }
    let i = this.taps.length;
    while (i > 0) {
      i--;
      const x = this.taps[i];
      this.taps[i + 1] = x;
      const xStage = x.stage || 0;
      if (before) {
        if (before.has(x.name)) {
          before.delete(x.name);
          continue;
        }
        if (before.size > 0) {
          continue;
        }
      }
      if (xStage > stage) {
        continue;
      }
      i++;
      break;
    }
    this.taps[i] = tapInfo;
  }

  compile(options) {
    throw new Error("Abstract: should be overridden");
  }

  _createCall(type) {
    return this.compile({
      taps: this.taps, //存放着所有的回调函数的数组
      args: this._args, //['name','age']
      interceptors: this.interceptors,
      type,
    });
  }
}

const CALL_DELEGATE = function (...args) {
  this.call = this._createCall("sync");
  return this.call(...args);
};

const CALL_ASYNC_DELEGATE = function (...args) {
  this.callAsync = this._createCall("async");
  return this.callAsync(...args);
};

const PROMISE_DELEGATE = function (...args) {
  this.promise = this._createCall("promise");
  return this.promise(...args);
};

class HookCodeFactory {
  setup(hookInstance, options) {
    hookInstance._x = options.taps.map((item) => item.fn);
  }

  init(options) {
    this.options = options;
  }

  deinit() {
    this.options = null;
  }

  args(options = {}) {
    let { before, after } = options;
    let allArgs = this.options.args || [];
    if (before) allArgs = [before, ...allArgs];
    if (after) allArgs = [...allArgs, after];
    if (allArgs.length > 0) {
      return allArgs.join(", ");
    }
    return "";
  }

  header() {
    let code = "";
    code += "var _x = this._x;\n";
    if (this.needContext()) {
      code += `var _context = {};\n`;
    } else {
      code += `var _context;\n`;
    }
    if (this.options.interceptors.length > 0) {
      code += `var _taps = this.taps;\n`;
      code += `var _interceptors = this.interceptors;\n`;
    }
    for (let k = 0; k < this.options.interceptors.length; k++) {
      const interceptor = this.options.interceptors[k];
      if (interceptor.call)
        code += `_interceptors[${k}].call(${this.args({
          before: interceptor.context ? "_context" : undefined,
        })});\n`;
    }
    return code;
  }

  create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
      case "sync":
        fn = new Function(
          this.args(),
          this.header() +
            this.content({
              onDone: () => "",
            })
        );
        break;
      case "async":
        fn = new Function(
          this.args({ after: "_callback" }),
          this.header() +
            this.content({
              onDone: () => "_callback();\n",
            })
        );
        break;
      case "promise":
        /* fn = new Function(this.args(),this.header()
                  +`return Promise.all(_x.map(item=>item(${this.args()})));`); */
        let content = this.content({
          onDone: () => " _resolve();\n",
        });
        content = `return new Promise(function (_resolve, _reject) {
                      ${content}
                  })`;
        fn = new Function(this.args(), this.header() + content);
        break;
    }
    this.deinit();
    return fn;
  }

  callTapsParallel({ onDone }) {
    let code = `var _counter = ${this.options.taps.length};\n`;
    if (onDone) {
      code += `
                var _done = function () {
                    ${onDone()}
                };
            `;
    }
    for (let i = 0; i < this.options.taps.length; i++) {
      const done = () => `if (--_counter === 0) _done();`;
      code += this.callTap(i, { onDone: done });
    }
    return code;
  }

  callTapsSeries({ onDone }) {
    if (this.options.taps.length === 0) {
      return onDone();
    }
    let code = "";
    let current = onDone;
    for (let j = this.options.taps.length - 1; j >= 0; j--) {
      const content = this.callTap(j, { onDone: current });
      current = () => content;
    }
    code += current();
    return code;
  }

  needContext() {
    for (const tapInfo of this.options.taps) {
      if (tapInfo.context) return true;
    }
  }

  callTap(tapIndex, { onDone }) {
    let code = "";
    if (this.options.interceptors.length > 0) {
      code += `var _tap${tapIndex} = _taps[${tapIndex}];`;
      for (let i = 0; i < this.options.interceptors.length; i++) {
        let interceptor = this.options.interceptors[i];
        if (interceptor.tap) {
          code += `_interceptors[${i}].tap(${
            this.needContext() && "_context,"
          }_tap${tapIndex});`;
        }
      }
    }
    code += `var _fn${tapIndex} = _x[${tapIndex}];`;
    let tap = this.options.taps[tapIndex];
    switch (tap.type) {
      case "sync":
        code += `_fn${tapIndex}(${this.args()});`;
        if (onDone) {
          code += onDone();
        }
        break;
      case "async":
        let cbCode = `
                function (_err${tapIndex}) {
                    if (_err${tapIndex}) {
                        _callback(_err${tapIndex});
                    } else {
                        ${onDone()}
                    }
                }
                `;
        code += `_fn${tapIndex}(${this.args({ after: cbCode })});`;
        break;
      case "promise":
        code = `
                      var _fn${tapIndex} = _x[${tapIndex}];
                      var _promise${tapIndex} = _fn${tapIndex}(${this.args()});
                      _promise${tapIndex}.then(
                          function () {
                              ${onDone()}
                          }
                      );
                  `;
        break;
    }
    return code;
  }
}

//====================================================
//#region
class SyncHookCodeFactory extends HookCodeFactory {
  content({ onDone }) {
    return this.callTapsSeries({ onDone });
  }
}

let syncFactory = new SyncHookCodeFactory();
class SyncHook extends Hook {
  compile(options) {
    syncFactory.setup(this, options);
    return syncFactory.create(options);
  }
}
//#endregion

//====================================================
//#region
class AsyncParallelHookCodeFactory extends HookCodeFactory {
  content({ onDone }) {
    return this.callTapsParallel({ onDone });
  }
}
let asyncFactory = new AsyncParallelHookCodeFactory();
class AsyncParallelHook extends Hook {
  compile(options) {
    asyncFactory.setup(this, options);
    return asyncFactory.create(options);
  }
}
//#endregion

//====================================================
//#region
// const hook = new SyncHook(["name", "age"]);
// hook.tap("1", (name, age) => {
//   console.log(1, name, age);
// });
// hook.tap({ name: "2" }, (name, age) => {
//   console.log(2, name, age);
// });
// hook.tap("3", (name, age) => {
//   console.log(3, name, age);
// });
// //执行回调函数
// hook.call("zhufeng", 10);
// hook.tap("4", (name, age) => {
//   console.log(4, name, age);
// });
// hook.call("jiagou", 20);
//#endregion

//====================================================
//#region
// const hook = new AsyncParallelHook(["name", "age"]);
// console.time("cost");
/* hook.tapAsync("1", (name, age, callback) => {
  setTimeout(() => {
    console.log(1, name, age);
    callback();
  }, 1000);
});
hook.tapAsync("2", (name, age, callback) => {
  setTimeout(() => {
    console.log(2, name, age);
    callback();
  }, 2000);
});
hook.tapAsync("3", (name, age, callback) => {
  setTimeout(() => {
    console.log(3, name, age);
    callback();
  }, 3000);
});
hook.callAsync("zhufeng", 10, (err) => {
  console.log(err);
  console.timeEnd("cost");
}); */

/* hook.tapPromise("1", (name, age) => {
  return new Promise(function (resolve) {
    setTimeout(() => {
      console.log(1, name, age);
      resolve();
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise(function (resolve) {
    setTimeout(() => {
      console.log(2, name, age);
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise(function (resolve) {
    setTimeout(() => {
      console.log(3, name, age);
      resolve();
    }, 3000);
  });
});
hook.promise("zhufeng", 10).then((result) => {
  console.log(result);
  console.timeEnd("cost");
}); */

//#endregion

//====================================================
//#region
/* const syncHook = new SyncHook(["name", "age"]);
syncHook.intercept({
  context: true, //我需要一个上下文对象
  register: (tapInfo) => {
    //当你新注册一个回调函数的时候触发
    console.log(`${tapInfo.name}-1注册`);
    tapInfo.register1 = "register1";
    return tapInfo;
  },
  tap: (context, tapInfo) => {
    //每个回调函数都会触发一次
    console.log(`开始触发1`, context);
    if (context) {
      context.name1 = "name1";
    }
  },
  call: (context, name, age) => {
    //每个call触发，所有的回调只会总共触发一次
    console.log(`开始调用1`, context, name, age);
  },
});
syncHook.intercept({
  context: true, //我需要一个上下文对象
  register: (tapInfo) => {
    //当你新注册一个回调函数的时候触发
    console.log(`${tapInfo.name}-2注册`);
    tapInfo.register2 = "register2";
    return tapInfo;
  },
  tap: (context, tapInfo) => {
    //每个回调函数都会触发一次
    console.log(`开始触发2`, context);
    if (context) {
      context.name2 = "name2";
    }
  },
  call: (context, name, age) => {
    //每个call触发，所有的回调只会总共触发一次
    console.log(`开始调用2`, context, name, age);
  },
});
//let tapInfo = {name,context,fn,register1,register2};

syncHook.tap({ name: "tap1函数A", context: true }, (name, age) => {
  console.log(`回调1`, name, age);
});
//console.log(syncHook.taps[0]);
syncHook.tap({ name: "tap2函数B", context: true }, (name, age) => {
  console.log("回调2", name, age);
});
syncHook.call("zhufeng", 10); */
//#endregion

//====================================================
/* let hook = new SyncHook(["name"]);
debugger;
hook.tap({ name: "tap1", stage: 1 }, (name) => {
  console.log("tap1", name);
});
hook.tap({ name: "tap3", stage: 3 }, (name) => {
  console.log("tap3", name);
});
hook.tap({ name: "tap4", stage: 4 }, (name) => {
  console.log("tap4", name);
});
hook.tap({ name: "tap2", stage: 2 }, (name) => {
  console.log("tap2", name);
});
hook.call("zhufeng"); */

let hook = new SyncHook(["name"]);
hook.tap({ name: "tap1", stage: 1 }, (name) => {
  console.log("tap1", name);
});
hook.tap({ name: "tap3", stage: 3 }, (name) => {
  console.log("tap3", name);
});
hook.tap({ name: "tap4", stage: 4 }, (name) => {
  console.log("tap4", name);
});
hook.tap({ name: "tap2", stage: 2, before: ["tap1"] }, (name) => {
  console.log("tap2", name);
});
hook.call("zhufeng");
