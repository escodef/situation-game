<template>
  <div class="min-h-screen bg-neo-bg flex items-center justify-center p-4">
    <div class="neo-box p-8 bg-white max-w-md w-full shadow-neo-lg">
      <div class="text-center mb-6">
        <h1 class="font-display text-4xl tracking-wider mb-2">МЕМНАЯ ПАПКА</h1>
        <p class="font-black text-xs uppercase tracking-widest text-gray-500">
          Скидывай мемы. Выигрывай друзей.
        </p>
      </div>

      <!-- Вкладки Вход / Регистрация -->
      <div class="flex border-3 border-black rounded-xl overflow-hidden mb-6 p-1 bg-neo-bg">
        <button 
          @click="isRegister = false" 
          :class="!isRegister ? 'bg-neo-yellow shadow-neo-sm font-black' : 'font-bold'"
          class="flex-1 py-2 text-center rounded-lg transition-all">
          ВХОД
        </button>
        <button 
          @click="isRegister = true" 
          :class="isRegister ? 'bg-neo-pink text-white shadow-neo-sm font-black' : 'font-bold'"
          class="flex-1 py-2 text-center rounded-lg transition-all">
          РЕГИСТРАЦИЯ
        </button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <div v-if="isRegister">
          <label class="font-black text-xs uppercase block mb-1">Никнейм</label>
          <input 
            v-model="form.nickname" 
            placeholder="СуперМемер2000"
            class="w-full border-3 border-black p-2.5 rounded-lg font-bold focus:outline-none focus:bg-yellow-50" />
        </div>

        <div>
          <label class="font-black text-xs uppercase block mb-1">Почта</label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="mem@game.ru"
            class="w-full border-3 border-black p-2.5 rounded-lg font-bold focus:outline-none focus:bg-yellow-50" />
        </div>

        <div>
          <label class="font-black text-xs uppercase block mb-1">Пароль</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="••••••••"
            class="w-full border-3 border-black p-2.5 rounded-lg font-bold focus:outline-none focus:bg-yellow-50" />
        </div>

        <button type="submit" class="neo-btn bg-neo-cyan w-full py-3.5 text-lg mt-6">
          {{ isRegister ? 'СОЗДАТЬ АККАУНТ 🔥' : 'ПОГНАЛИ В ИГРУ 🚀' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isRegister = ref(false);

const form = ref({
  email: '',
  password: '',
  nickname: '',
});

const submit = async () => {
  try {
    if (isRegister.value) {
      await http.post('/auth/register', form.value);
    }
    const { data } = await http.post('/auth/login', {
      email: form.value.email,
      password: form.value.password,
    });
    authStore.setAuth(data.user, data.accessToken);
    router.push('/');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка авторизации');
  }
};
</script>