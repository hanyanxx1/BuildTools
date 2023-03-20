<template>
  <div>
    hello
    <img src="@/assets/kf.jpg" />
    <img :src="avatarUrl" />
    <div class="avatar" />
    <HelloWorld msg="hello" />
  </div>
</template>
<script setup lang="ts">
//https://github.com/vuejs/rfcs/blob/master/active-rfcs/0040-script-setup.md
import HelloWorld from "@/components/HelloWorld.vue";
import avatarUrl from "@/assets/kf.jpg";
fetch("/api/get")
  .then((response) => response.json())
  .then(console.log);
</script>
<style scope>
.avatar {
  width: 200px;
  height: 200px;
  background-image: url(@/assets/kf.jpg);
  background-size: contain;
}
</style>
