import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import serve from "rollup-plugin-serve";

export default {
  input: "src/main.js",
  // input: "src/main.ts",
  output: {
    file: "dist/bundle.cjs.js", //输出文件的路径和名称
    format: "iife", //五种输出格式：amd/es6/iife/umd/cjs
    name: "bundleName", //当format为iife和umd时必须提供，将作为全局变量挂在window下
    globals: {
      lodash: "_",
      jquery: "$",
    },
  },
  plugins: [
    babel({
      exclude: "node_modules/**",
    }),
    resolve(),
    commonjs(),
    typescript(),
    postcss(),
    serve({
      open: true,
      port: 8082,
      contentBase: "./dist",
    }),
  ],
  external: ["lodash", "jquery"],
};
