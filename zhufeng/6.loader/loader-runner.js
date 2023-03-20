let fs = require("fs");
let path = require("path");
let readFile = fs.readFile.bind(this); //读取硬盘上文件的默认方法

function createLoaderObject(request) {
  let loaderObj = {
    request,
    normal: null, //loader函数本身
    pitch: null, //pitch函数本身
    raw: false, //是否需要转成字符串,默认是转的
    data: {},
    pitchExecuted: false, //pitch函数是否已经执行过了
    normalExecuted: false, //normal函数是否已经执行过了
  };
  let normal = require(loaderObj.request);
  loaderObj.normal = normal;
  loaderObj.raw = normal.raw;
  loaderObj.pitch = normal.pitch;
  return loaderObj;
}

function processResource(processOptions, loaderContext, finalCallback) {
  loaderContext.loaderIndex = loaderContext.loaderIndex - 1;
  let resource = loaderContext.resource;
  loaderContext.readResource(resource, (err, resourceBuffer) => {
    if (err) finalCallback(err);
    processOptions.resourceBuffer = resourceBuffer;
    iterateNormalLoaders(
      processOptions,
      loaderContext,
      [resourceBuffer],
      finalCallback
    );
  });
}

function iterateNormalLoaders(
  processOptions,
  loaderContext,
  args,
  finalCallback
) {
  if (loaderContext.loaderIndex < 0) {
    return finalCallback(null, args);
  }
  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoaderObject.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      args,
      finalCallback
    );
  }
  let normalFunction = currentLoaderObject.normal;
  currentLoaderObject.normalExecuted = true;
  convertArgs(args, currentLoaderObject.raw);
  runSyncOrAsync(normalFunction, loaderContext, args, (err, ...values) => {
    if (err) finalCallback(err);
    iterateNormalLoaders(processOptions, loaderContext, values, finalCallback);
  });
}

function convertArgs(args, raw) {
  if (raw && !Buffer.isBuffer(args[0])) {
    //想要Buffer,但不是Buffer,转成Buffer
    args[0] = Buffer.from(args[0]);
  } else if (!raw && Buffer.isBuffer(args[0])) {
    //想要Buffer,但不是Buffer,转成Buffer
    args[0] = args[0].toString("utf8");
  }
}

function iteratePitchingLoaders(processOptions, loaderContext, finalCallback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(processOptions, loaderContext, finalCallback);
  }

  let currentLoaderObject = loaderContext.loaders[loaderContext.loaderIndex];

  if (currentLoaderObject.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
  }

  let pitchFunction = currentLoaderObject.pitch;
  currentLoaderObject.pitchExecuted = true;

  if (!pitchFunction) {
    return iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
  }

  runSyncOrAsync(
    pitchFunction,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...values) => {
      if (values.length > 0 && !!values[0]) {
        loaderContext.loaderIndex--;
        iterateNormalLoaders(
          processOptions,
          loaderContext,
          values,
          finalCallback
        );
      } else {
        iteratePitchingLoaders(processOptions, loaderContext, finalCallback);
      }
    }
  );
}

function runSyncOrAsync(fn, context, args, callback) {
  let isSync = true;
  let isDone = false;
  const innerCallback = (context.callback = function (err, ...values) {
    isDone = true;
    isSync = false;
    callback(err, ...values);
  });
  context.async = function () {
    isSync = false; //把同步标志设置为false,意思就是改为异步
    return innerCallback;
  };
  let result = fn.apply(context, args);
  if (isSync) {
    isDone = true;
    return callback(null, result);
  }
}

function runLoaders(options, callback) {
  let resource = options.resource;
  let loaders = options.loaders || [];
  let loaderContext = options.context || {};
  let readResource = options.readResource || readFile;
  let loaderObjects = loaders.map(createLoaderObject);
  loaderContext.resource = resource;
  loaderContext.readResource = readResource;
  loaderContext.loaderIndex = 0;
  loaderContext.loaders = loaderObjects;
  loaderContext.callback = null;
  loaderContext.async = null;

  Object.defineProperty(loaderContext, "request", {
    get() {
      return loaderContext.loaders
        .map((l) => l.request)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "remainingRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((l) => l.request)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "currentRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((l) => l.request)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "previousRequest", {
    get() {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((l) => l.request)
        .join("!");
    },
  });
  Object.defineProperty(loaderContext, "data", {
    get() {
      let loaderObj = loaderContext.loaders[loaderContext.loaderIndex];
      return loaderObj.data;
    },
  });
  let processOptions = {
    resourceBuffer: null,
  };
  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    callback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}

exports.runLoaders = runLoaders;
