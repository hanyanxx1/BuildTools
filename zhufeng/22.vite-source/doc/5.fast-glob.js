const fg = require("fast-glob");
(async () => {
  const entries = await fg(["**/*.js"]);
  console.log(entries);
})();
