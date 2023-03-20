const connect = require("connect");
const static = require("serve-static");
const http = require("http");

const middlewares = connect();
middlewares.use(static(__dirname));
http.createServer(middlewares).listen(3001);
