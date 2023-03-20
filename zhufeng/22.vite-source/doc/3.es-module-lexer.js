const { init, parse } = require("es-module-lexer");
(async () => {
  await init;
  const [imports, exports] = parse(`import _ from 'lodash';\nexport var p = 5`);
  console.log(imports);
  console.log(exports);
})();
