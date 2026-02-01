<template>
  <div class="container">
    <div class="logo-container">
      <h1>MemeGame</h1>
    </div>

    <div class="form-container">
      <form class="registration-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label>Введите почту:</label>
          <input type="email" id="email" required />
        </div>
        <div class="input-group">
          <label>Придумайте ник:</label>
          <input type="text" id="username" required />
        </div>
        <div class="input-group">
          <label>Придумайте пароль:</label>
          <input type="password" id="password" required />
        </div>
        <div class="input-group">
          <label>Повторите пароль:</label>
          <input type="password" id="password" required />
        </div>
      </form>
    </div>

    <div class="buttons-container">
      <div class="btn">
        <button v-sound>Создать</button>
      </div>

      <div class="btn">
        <button v-sound @click="goToHome">Назад</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");

const goToHome = () => {
  router.push("/");
};

const handleLogin = () => {
  console.log("Login attempt:", {
    username: username.value,
    password: password.value,
  });

  // router.push("/home");
};

// const goToRegister = () => {
// };
</script>

<style scoped>
.container {
  width: 699px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
}

.buttons-container {
  justify-self: center;
  display: flex;
  flex-direction: row;
  gap: 25px;
}

button {
  width: 337px;
  height: 89px;
}

input {
  width: 100%;
  height: 89px;
}

.input-group {
  position: relative;
  margin-bottom: 25px;
}

.form-container {
  width: 699px;
  display: flex;
  flex-direction: column;

  border: 2px red;
}

.input-label {
  position: absolute;
  top: 27px;
  left: 40px;
  color: #666;
  pointer-events: none;
  transition: all 0.3s ease;
  user-select: none;
  background: transparent;
}

label {
  text-align: center;
  width: 699px;
  display: block;

  padding-bottom: 3px;
}
</style>
