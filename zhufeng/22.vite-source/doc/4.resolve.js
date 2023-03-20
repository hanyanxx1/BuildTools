const resolve = require("resolve");
const res = resolve.sync("check-is-array", { basedir: __dirname });
console.log(res);
