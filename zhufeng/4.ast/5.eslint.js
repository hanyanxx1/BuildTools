const { transformSync } = require("@babel/core");

const eslintPlugin = ({ fix }) => {
  return {
    pre(file) {
      file.set("errors", []);
    },
    visitor: {
      CallExpression(path, state) {
        const errors = state.file.get("errors");
        const { node } = path;
        if (node.callee.object && node.callee.object.name === "console") {
          //const tmp = Error.stackTraceLimit;//可以修改堆栈信息的深度，默认为10
          //Error.stackTraceLimit = 0;
          errors.push(
            path.buildCodeFrameError(`代码中不能出现console语句`, Error)
          );
          //Error.stackTraceLimit = tmp;
          if (fix) {
            path.parentPath.remove();
          }
        }
      },
    },
    post(file) {
      console.log(...file.get("errors"));
    },
  };
};

const sourceCode = `
var a = 1;
console.log(a);
var b = 2;
`;
const { code } = transformSync(sourceCode, {
  plugins: [eslintPlugin({ fix: true })],
});
console.log(code);
