let AsyncQueue = require("webpack/lib/util/AsyncQueue");

const QUEUED_STATE = 0; //已经 入队，待执行
const PROCESSING_STATE = 1; //处理中
const DONE_STATE = 2; //处理完成

class ArrayQueue {
  constructor(items) {
    this._list = items ? Array.from(items) : [];
  }
  // 入队
  enqueue(item) {
    this._list.push(item);
  }
  // 出队
  dequeue() {
    return this._list.shift();
  }
}

class AsyncQueueEntry {
  constructor(item, callback) {
    // 保存传入Task需要处理的值
    this.item = item;
    // 初始化状态
    this.state = QUEUED_STATE;
    // 保存传入Task完成的Callback
    this.callback = callback;
    // 用于重复Task的处理 我们会在稍微用到它
    this.callbacks = undefined;
    // 保存当前任务处理后的结果
    this.result = undefined;
    // 保存当前任务处理后的错误
    this.error = undefined;
  }
}

class MyAsyncQueue {
  constructor(options) {
    this.options = options;
    // 名称
    this._name = options.name;
    // 处理器函数
    this._processor = options.processor;
    // 并发执行最大数
    this._parallelism = options.parallelism || 100;
    // 唯一标示函数
    this._getKey = options.getKey;

    // 保存当前队列中等执行的任务
    this._queued = new ArrayQueue();
    // 保存当前队列中所有已经执行过的任务
    this._entries = new Map();
    // 当前并发任务
    this._activeTasks = 0;
    // 是否开启下次事件队列EventLoop中等待执行的函数
    this._willEnsureProcessing = false;
    // 队列是否已经结束
    this._stopped = false;
  }

  add = (item, callback) => {
    if (this._stopped) {
      return callback(new Error("Queue was stopped"));
    }

    // 获取当前添加的唯一key
    const key = this._getKey(item);
    // 如果存在重复的key
    const entry = this._entries.get(key);
    if (entry !== undefined) {
      // 如果之前重复的Task已经执行完毕
      if (entry.state === DONE_STATE) {
        // 直接调用callback传入之前已经处理完成的结果
        process.nextTick(() => callback(entry.error, entry.result));
      } else if (entry.callbacks === undefined) {
        entry.callbacks = [callback];
      } else {
        entry.callbacks.push(callback);
      }
      return;
    }
    // 创建一个新的entry对象
    const newEntry = new AsyncQueueEntry(item, callback);
    // 将entry添加进入this._entries
    this._entries.set(key, newEntry);
    // Task入队
    this._queued.enqueue(newEntry);
    // _willEnsureProcessing为false表示下次EventLoop中并不会调用调用器执行任务
    // 当_willEnsureProcessing为false时我们需要在下一次EventLoop中执行调度器中的任务
    // 并且将_willEnsureProcessing设置为true，防止本次EventLoop多次add造成下次EventLoop中多次重复执行任务
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      // 下一次EventLoop中调用_ensureProcessing执行调度器中的任务
      setImmediate(this._ensureProcessing.bind(this));
    }
  };

  // 迭代队列执行
  _ensureProcessing = () => {
    // 当还可以执行时
    while (this._activeTasks < this._parallelism) {
      // 获取最顶部排队任务
      const entry = this._queued.dequeue();
      // 如果已经没有任务了直接退出while循环
      if (entry === undefined) break;
      this._activeTasks++;
      // 修改任务状态处理中
      entry.state = PROCESSING_STATE;
      this._startProcessing(entry);
    }
    // 重置本次EventLoop中的_willEnsureProcessing为false
    this._willEnsureProcessing = false;
  };

  _startProcessing = (entry) => {
    this._processor(entry.item, (e, r) => {
      if (e) {
        this._handleResult(
          entry,
          new Error(`AsyncQueue(${this.name} processor error.)`)
        );
      }
      this._handleResult(entry, e, r);
    });
  };

  _handleResult = (entry, error, result) => {
    const callback = entry.callback;
    const callbacks = entry.callbacks;
    entry.state = DONE_STATE; //把条目的状态设置为已经完成
    entry.callback = undefined; //把callback
    entry.callbacks = undefined;
    entry.result = result; //把结果赋给entry
    entry.error = error; //把错误对象赋给entry
    callback(error, result);
    if (callbacks !== undefined) {
      for (const callback of callbacks) {
        callback(error, result);
      }
    }
    this._activeTasks--;
    // 当调度器任务完成时
    // 如果下一次EventLoop中并没有安排调度器执行
    // 那么重置this._willEnsureProcessing状态 开启调度器执行
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true;
      setImmediate(this._ensureProcessing);
    }
  };
}

function processor(item, callback) {
  setTimeout(() => {
    callback(null, item);
  }, 500);
}

function getKey(item) {
  return item.key;
}

let queue = new MyAsyncQueue({
  name: "createModule",
  parallelism: 3,
  processor,
  getKey,
});

// let queue = new AsyncQueue({
//   name: "createModule",
//   parallelism: 3,
//   processor,
//   getKey,
// });

const start = Date.now();
let item1 = { key: "module1" };
queue.add(item1, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add(item1, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add(item1, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add({ key: "module2" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add({ key: "module3" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add({ key: "module4" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
queue.add({ key: "module5" }, (err, result) => {
  console.log(err, result);
  console.log(Date.now() - start);
});
