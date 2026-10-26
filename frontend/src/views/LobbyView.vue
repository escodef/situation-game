<template>
  <div class="min-h-screen bg-neo-bg p-6 flex flex-col items-center">
    <!-- Шапка профиля -->
    <header class="w-full max-w-5xl flex justify-between items-center mb-8 neo-box p-4 bg-white">
      <div class="flex items-center gap-3">
        <div class="bg-neo-yellow p-3 border-3 border-black rounded-xl font-display text-2xl tracking-wider">
          MEME WARS
        </div>
        <div class="font-black text-sm">
          Привет, <span class="bg-neo-cyan px-2 py-0.5 border-2 border-black rounded">{{ authStore.user?.nickname }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/packs" class="neo-btn bg-neo-purple text-white text-sm py-2">
          📦 Мои Паки
        </router-link>
        <button @click="authStore.logout" class="neo-btn bg-white hover:bg-neo-pink text-sm py-2">
          Выйти
        </button>
      </div>
    </header>

    <div class="w-full max-w-5xl grid md:grid-cols-3 gap-6">
      <!-- Блок входа по коду и создания -->
      <div class="md:col-span-1 space-y-6">
        <!-- Вход по 6-значному коду -->
        <div class="neo-box p-6 bg-white">
          <h2 class="text-xl font-black mb-4">🚪 ВОЙТИ ПО КОДУ</h2>
          <div class="flex gap-2">
            <input 
              v-model="roomCode" 
              placeholder="КОД (6 БУКВ)" 
              maxlength="6"
              class="w-full border-3 border-black p-2 font-black tracking-widest uppercase rounded-lg focus:outline-none focus:bg-yellow-50" />
            <button @click="joinByCode" class="neo-btn bg-neo-yellow text-sm">ГО</button>
          </div>
        </div>

        <!-- Создать игру -->
        <div class="neo-box p-6 bg-neo-yellow">
          <h2 class="text-xl font-black mb-2">⚡ СОЗДАТЬ ИГРУ</h2>
          <p class="text-sm font-bold mb-4">Настрой паки карточек, число раундов и зови пацанов.</p>
          <button @click="showCreateModal = true" class="neo-btn bg-white w-full py-3 text-lg">
            + СОЗДАТЬ ЛОББИ
          </button>
        </div>
      </div>

      <!-- Список открытых комнат -->
      <div class="md:col-span-2 neo-box p-6 bg-white">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black">🌐 ОТКРЫТЫЕ ИГРЫ</h2>
          <button @click="loadGames" class="neo-btn bg-neo-bg text-xs py-1.5">Обновить</button>
        </div>

        <div v-if="loading" class="text-center py-12 font-black text-xl animate-pulse">
          Ищем движуху...
        </div>

        <div v-else-if="games.length === 0" class="text-center py-12 font-bold text-gray-500">
          Сейчас нет активных открытых комнат. Создай свою первую!
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="g in games" 
            :key="g.id"
            class="neo-box p-4 bg-neo-bg flex justify-between items-center hover:bg-yellow-50">
            <div>
              <div class="font-black text-lg flex items-center gap-2">
                Комната #{{ g.code }}
                <span class="text-xs bg-neo-cyan px-2 py-0.5 border border-black rounded">Раундов: {{ g.maxRounds }}</span>
              </div>
              <div class="text-sm font-bold text-gray-600">
                Макс игроков: {{ g.maxPlayers }}
              </div>
            </div>
            <button @click="joinGameById(g.id)" class="neo-btn bg-neo-green text-sm py-2">
              ВЛЕТЕТЬ 👉
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка создания комнаты -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div class="neo-box p-6 bg-white max-w-md w-full">
        <h2 class="text-2xl font-black mb-4">НОВАЯ ИГРА</h2>
        
        <div class="space-y-4">
          <div>
            <label class="font-black text-sm block mb-1">Максимум игроков</label>
            <input type="number" v-model.number="form.maxPlayers" min="2" max="10" class="w-full border-3 border-black p-2 rounded-lg font-bold" />
          </div>

          <div>
            <label class="font-black text-sm block mb-1">Число раундов</label>
            <input type="number" v-model.number="form.maxRounds" min="1" max="20" class="w-full border-3 border-black p-2 rounded-lg font-bold" />
          </div>

          <label class="flex items-center gap-3 font-black cursor-pointer">
            <input type="checkbox" v-model="form.isOpen" class="w-5 h-5 border-2 border-black" />
            Сделать открытой для всех
          </label>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="showCreateModal = false" class="neo-btn bg-gray-200 flex-1">Отмена</button>
          <button @click="createGame" class="neo-btn bg-neo-yellow flex-1">Погнали</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import type { IGame } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const games = ref<IGame[]>([]);
const loading = ref(false);
const roomCode = ref('');
const showCreateModal = ref(false);

const form = ref({
  maxPlayers: 6,
  maxRounds: 5,
  isOpen: true,
});

const loadGames = async () => {
  loading.value = true;
  try {
    const { data } = await http.get('/game?page=1&take=10');
    games.value = data.data;
  } finally {
    loading.value = false;
  }
};

const joinByCode = async () => {
  if (!roomCode.value) return;
  try {
    await http.post('/game/join', { code: roomCode.value.toUpperCase() });
    const { data } = await http.get(`/game`); // Получаем ID
    const found = data.data.find((g: any) => g.code === roomCode.value.toUpperCase());
    if (found) router.push(`/game/${found.id}`);
  } catch (e: any) {
    alert(e.response?.data?.message || 'Не удалось зайти');
  }
};

const joinGameById = async (id: string) => {
  try {
    await http.post('/game/join', { gameId: id });
    router.push(`/game/${id}`);
  } catch (e: any) {
    alert(e.response?.data?.message || 'Ошибка входа');
  }
};

const createGame = async () => {
  try {
    // Получаем паки
    const [sits, cards] = await Promise.all([
      http.get('/situation-pack'),
      http.get('/card-pack'),
    ]);

    const sitIds = sits.data.data.map((p: any) => p.id);
    const cardIds = cards.data.data.map((p: any) => p.id);

    const { data } = await http.post('/game', {
      ...form.value,
      situationPacksIds: sitIds,
      cardPacksIds: cardIds,
    });

    // Автовход создателя
    await http.post('/game/join', { gameId: data.data.id });
    router.push(`/game/${data.data.id}`);
  } catch (e: any) {
    alert(e.response?.data?.message || 'Ошибка создания');
  }
};

onMounted(loadGames);
</script>