const { transformSync } = require("@babel/core");

const uglifyPlugin = () => {
  return {
    visitor: {
      Scopable(path) {
        Object.entries(path.scope.bindings).forEach(([key, binding]) => {
          const newName = path.scope.generateUid();
          binding.path.scope.rename(key, newName);
        });
      },
    },
  };
};

const sourceCode = `
function getAge(){
  var age = 12;
  console.log(age);
  var name = '';
  console.log(name);
}
`;
const { code } = transformSync(sourceCode, {
  plugins: [uglifyPlugin()],
});
console.log(code);
