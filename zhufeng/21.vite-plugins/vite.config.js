import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";
// import vue from "./plugins/plugin-vue";
// import vueJsx from "@vitejs/plugin-vue-jsx";
import vueJsx from "./plugins/plugin-vue-jsx";
export default defineConfig({
  plugins: [
    // vue({})
    vueJsx({}),
  ],
});
