<template>
  <div>
    <!-- <h1>1 {{ msg }} 2</h1> -->
    <!-- <a :class="$style.link">超链接</a> -->
    <a :class="style.link">超链接</a>
    <h2>less</h2>
    <h3>sass</h3>
    <div class="postcss" />
    <button @click="handleClick">
      {{ state.count }}
    </button>
  </div>
</template>

<!-- <style module>
.link {
  color: red;
}
</style> -->

<!-- <script setup>
import style from "./HelloWorld.module.css";
</script> -->

<!-- <style lang="less" scoped>
@color: red;
h2 {
  color: @color;
}
</style>
<style lang="scss" scoped>
$color: green;
h3 {
  color: $color;
}
</style> -->
<script setup lang="ts">
import { reactive } from "vue";
import style from "./HelloWorld.module.css";

defineProps({
  msg: String,
  // default: "",
});
interface State {
  count: number;
}
const state = reactive<State>({ count: 0 });
const handleClick = () => {
  console.log(state.count);
  state.count++;
};
</script>

<style scoped>
.postcss {
  height: 50px;
  width: 200px;
  background-color: orange;
  transform: rotate(90deg);
}
</style>
