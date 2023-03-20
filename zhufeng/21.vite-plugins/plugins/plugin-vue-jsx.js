import { transformSync } from "@babel/core";
import jsx from "@vue/babel-plugin-jsx";
import importMeta from "@babel/plugin-syntax-import-meta";
import { createFilter } from "@rollup/pluginutils";
import typescript from "@babel/plugin-transform-typescript";
import hash from "hash-sum";
import path from "path";

function vueJsxPlugin(options = {}) {
  let needHmr = false,
    root;

  return {
    name: "vite:vue-jsx",
    config() {
      return {
        esbuild: {
          //默认情况下在开发的时候会编译我们的代码，它会也会编译jsx,但是它会编译 成React.createElement
          include: /\.ts$/,
        },
        define: {
          __VUE_OPTIONS_API__: true,
          __VUE_PROD_DEVTOOLS__: false,
        },
      };
    },
    configResolved(config) {
      root = config.root;
      needHmr = config.command === "serve" && !config.isProduction;
    },
    transform(code, id) {
      const {
        include,
        exclude,
        babelPlugins = [],
        ...babelPluginOptions
      } = options;
      const filter = createFilter(include || /\.[jt]sx$/, exclude);
      const [filepath] = id.split("?");
      if (filter(id) || filter(filepath)) {
        const plugins = [
          importMeta,
          [jsx, babelPluginOptions],
          ...babelPlugins,
        ];
        if (id.endsWith(".tsx") || filepath.endsWith(".tsx")) {
          plugins.push([typescript, { isTSX: true, allowExtensions: true }]);
        }
        const result = transformSync(code, {
          babelrc: false,
          configFile: false,
          ast: true,
          plugins,
        });
        if (!needHmr) {
          return {
            code: result.code,
            map: result.map,
          };
        }
        const hotComponents = [];
        let hasDefault = false;
        for (const node of result.ast.program.body) {
          if (node.type === "ExportDefaultDeclaration") {
            if (isDefineComponentCall(node.declaration)) {
              hasDefault = true;
              hotComponents.push({
                local: "__default__",
                exported: "default",
                id: hash(id + "default"),
              });
            }
          }
        }
        if (hotComponents.length) {
          if (hasDefault && needHmr) {
            result.code =
              result.code.replace(
                /export default defineComponent/g,
                `const __default__ = defineComponent`
              ) + `\nexport default __default__`;
          }

          if (needHmr && !/\?vue&type=script/.test(id)) {
            let code = result.code;
            let callbackCode = ``;
            for (const { local, exported, id } of hotComponents) {
              code +=
                `\n${local}.__hmrId = "${id}"` +
                `\n__VUE_HMR_RUNTIME__.createRecord("${id}", ${local})`;
              callbackCode += `\n__VUE_HMR_RUNTIME__.reload("${id}", __${exported})`;
            }
            code += `\nimport.meta.hot.accept(({${hotComponents
              .map((c) => `${c.exported}: __${c.exported}`)
              .join(",")}}) => {${callbackCode}\n})`;
            result.code = code;
          }
        }
        return {
          code: result.code,
          map: result.map,
        };
      }
    },
  };
}

function isDefineComponentCall(node) {
  return (
    node &&
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "defineComponent"
  );
}

export default vueJsxPlugin;
