const {
  parse,
  compileScript,
  compileTemplate,
  rewriteDefault,
} = require("@vue/compiler-sfc");
const dedent = require("dedent"); //indent dedent
const App = `
<template>
  <h1>App</h1>
</template>
<script >
export default {
  name: 'App'
}
</script>
<style>
h1 {
  color: red;
}
</style>
<style>
h1 {
  background-color: green;
}
</style>
`;
let { descriptor } = parse(App, { filename: "App.vue" });
let targetCode = "";
if (descriptor.styles.length > 0) {
  let styleCodes = "";
  descriptor.styles.forEach((style, index) => {
    const query = `?t=${Date.now()}&vue&type=style&index=${index}&lang.css`;
    const id = "/src/App.vue";
    const styleRequest = id + query;
    styleCodes += `\nimport ${JSON.stringify(styleRequest)}`;
  });
  targetCode += styleCodes;
}
if (descriptor.script) {
  let scriptCode = compileScript(descriptor, {
    reactivityTransform: false,
  });
  scriptCode = rewriteDefault(scriptCode.content, "_sfc_main");
  targetCode += scriptCode;
}
if (descriptor.template) {
  const templateContent = descriptor.template.content;
  let { code } = compileTemplate({
    source: templateContent,
  });
  code = code.replace(/export function render/, "function _sfc_render");
  targetCode += code;
}

targetCode += `
\n_sfc_main.render = _sfc_render;
\nexport default _sfc_main;
`;
console.log(targetCode);
