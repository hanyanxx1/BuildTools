// import resolve from "@rollup/plugin-node-resolve";
// import build from "./plugins/rollup-plugin-build.js";
// import generation from "./plugins/rollup-plugin-generation.js";
// import commonjs from "./plugins/rollup-plugin-commonjs";
import resolve from "./plugins/rollup-plugin-node-resolve.js";
import alias from "./plugins/rollup-plugin-alias.js";

export default {
  input: "./src/index.js",
  output: {
    dir: "dist",
  },
  plugins: [
    // build(),
    // generation(),
    // commonjs(),
    resolve(),
    alias({
      entries: [{ find: "./xx.js", replacement: "check-is-array" }],
    }),
  ],
  watch: {
    clearScreen: false,
  },
};
