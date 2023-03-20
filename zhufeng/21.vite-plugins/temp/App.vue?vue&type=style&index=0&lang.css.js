import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext(
  "/src/App.vue?vue&type=style&index=0&lang.css"
);
import {
  updateStyle as __vite__updateStyle,
  removeStyle as __vite__removeStyle,
} from "/@vite/client";
const __vite__id =
  "/Users/hanyanxx1/Documents/study/JavaScript/10_构建工具/zhufeng/21.vite-plugins/src/App.vue?vue&type=style&index=0&lang.css";
const __vite__css = "\nh1 {\n  color: red;\n}\n";
__vite__updateStyle(__vite__id, __vite__css);
import.meta.hot.accept();
export default __vite__css;
import.meta.hot.prune(() => __vite__removeStyle(__vite__id));
