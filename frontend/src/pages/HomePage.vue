<template>
  <div class="container">
    <div class="logo-container">
      <h1>MemeGame</h1>
    </div>

    <div class="buttons-container">
      <div class="btn">
        <button v-sound @click="goToLogin">Войти</button>
      </div>

      <div class="btn">
        <button v-sound>Регистрация</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goToLogin = () => {
  router.push("/login");
};

// const goToRegister = () => {
// };
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 130px;
  margin-bottom: 50px;
}
.buttons-container {
  justify-self: center;
  display: flex;
  flex-direction: column;
  gap: 25px;
}
button {
  width: 337px;
  height: 89px;
}
</style>
