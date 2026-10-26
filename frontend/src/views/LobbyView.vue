<template>
  <div class="min-h-screen bg-neo-bg p-4 md:p-6 flex flex-col items-center">
    <!-- Шапка профиля -->
    <header class="w-full max-w-5xl flex flex-wrap justify-between items-center gap-4 mb-8 neo-box p-4 bg-white">
      <div class="flex items-center gap-4">
        <div class="bg-neo-yellow px-4 py-2 border-3 border-black rounded-xl font-display text-2xl tracking-wider shadow-neo-sm transform -rotate-2">
          MEME WARS
        </div>
        <div class="font-black text-sm md:text-base">
          Игрок: <span class="bg-neo-cyan px-2.5 py-1 border-2 border-black rounded-lg shadow-neo-sm">{{ authStore.user?.nickname }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/packs" class="neo-btn bg-neo-purple text-white text-sm py-2 neo-box-hover">
          📦 Наборы и Мемы
        </router-link>
        <button @click="onLogout" class="neo-btn bg-white hover:bg-neo-pink hover:text-white text-sm py-2">
          Выйти
        </button>
      </div>
    </header>

    <div class="w-full max-w-5xl grid md:grid-cols-3 gap-6">
      <!-- Левая колонка: Вход по коду + Создание -->
      <div class="md:col-span-1 space-y-6">
        <!-- Вход по 6-значному коду -->
        <div class="neo-box p-6 bg-white">
          <h2 class="text-xl font-black mb-3">🔑 ВОЙТИ ПО КОДУ</h2>
          <p class="text-xs font-bold text-gray-500 mb-3">Введи 6-значный код закрытой или открытой комнаты друга:</p>
          <div class="flex gap-2">
            <input
              v-model="roomCode"
              @keyup.enter="joinByCode"
              placeholder="AB12CD"
              maxlength="6"
              class="w-full border-3 border-black p-2.5 font-black text-lg tracking-widest uppercase rounded-xl focus:outline-none focus:bg-yellow-50 text-center"
            />
            <button @click="joinByCode" :disabled="joiningCode" class="neo-btn bg-neo-yellow text-sm px-4">
              ГО
            </button>
          </div>
        </div>

        <!-- Создать игру -->
        <div class="neo-box p-6 bg-neo-yellow relative overflow-hidden">
          <h2 class="text-2xl font-black mb-2">⚡ СВОЯ КОМНАТА</h2>
          <p class="text-sm font-bold mb-5">Выбери наборы мемов, паки ситуаций, число раундов и зови друзей!</p>
          <button @click="openCreateModal" class="neo-btn bg-white w-full py-3.5 text-lg neo-box-hover">
            + СОЗДАТЬ ЛОББИ
          </button>
        </div>
      </div>

      <!-- Правая колонка: Список открытых комнат -->
      <div class="md:col-span-2 neo-box p-6 bg-white flex flex-col">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black flex items-center gap-2">
            🌐 ОТКРЫТЫЕ КОМНАТЫ
          </h2>
          <button @click="loadGames" class="neo-btn bg-neo-bg text-xs py-1.5">
            🔄 Обновить
          </button>
        </div>

        <div v-if="loading" class="text-center py-16 font-black text-xl animate-pulse">
          Ищем активные катки...
        </div>

        <div v-else-if="games.length === 0" class="text-center py-16 border-3 border-dashed border-black rounded-xl bg-neo-bg p-6">
          <div class="text-4xl mb-2">🏜️</div>
          <div class="font-black text-lg mb-1">Пока нет открытых комнат</div>
          <p class="text-sm font-bold text-gray-600">Нажми «+ Создать лобби» слева и стань хостом первой игры!</p>
        </div>

        <TransitionGroup v-else name="pop" tag="div" class="space-y-4">
          <div
            v-for="g in games"
            :key="g.id"
            class="neo-box p-4 bg-neo-bg flex flex-wrap justify-between items-center gap-4 hover:bg-yellow-50 transition-colors"
          >
            <div>
              <div class="font-black text-lg flex items-center gap-2">
                <span>Комната</span>
                <span class="bg-neo-yellow px-2 py-0.5 border-2 border-black rounded font-mono tracking-wider">#{{ g.code }}</span>
                <span
                  :class="g.status === 'WAITING' ? 'bg-neo-green' : 'bg-neo-orange text-white'"
                  class="text-xs px-2 py-0.5 border-2 border-black rounded uppercase"
                >
                  {{ g.status === 'WAITING' ? 'Ожидание' : 'В игре' }}
                </span>
              </div>
              <div class="text-xs font-bold text-gray-600 mt-1 flex gap-3">
                <span>👥 Макс. игроков: {{ g.maxPlayers }}</span>
                <span>🔄 Раундов: {{ g.maxRounds }}</span>
              </div>
            </div>
            <button
              @click="joinGameById(g.id)"
              :disabled="g.status !== 'WAITING'"
              class="neo-btn bg-neo-cyan text-sm py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ВЛЕТЕТЬ 👉
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- МОДАЛКА СОЗДАНИЯ КОМНАТЫ С ВЫБОРОМ ПАКОВ -->
    <Transition name="pop">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="neo-box p-6 md:p-8 bg-white max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-neo-lg">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black bg-neo-yellow px-3 py-1 border-3 border-black rounded-lg shadow-neo-sm">
              ⚙️ НАСТРОЙКА КОМНАТЫ
            </h2>
            <button @click="showCreateModal = false" class="border-3 border-black px-2.5 py-1 rounded-lg font-black hover:bg-neo-pink hover:text-white">
              ✕
            </button>
          </div>

          <div class="space-y-6">
            <!-- Число игроков и раундов -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="font-black text-xs uppercase block mb-1">Максимум игроков (2–10)</label>
                <input
                  type="number"
                  v-model.number="form.maxPlayers"
                  min="2"
                  max="10"
                  class="w-full border-3 border-black p-2.5 rounded-xl font-black text-lg focus:bg-yellow-50 focus:outline-none"
                />
              </div>
              <div>
                <label class="font-black text-xs uppercase block mb-1">Количество раундов (1–20)</label>
                <input
                  type="number"
                  v-model.number="form.maxRounds"
                  min="1"
                  max="20"
                  class="w-full border-3 border-black p-2.5 rounded-xl font-black text-lg focus:bg-yellow-50 focus:outline-none"
                />
              </div>
            </div>

            <!-- Открытая / Закрытая -->
            <label class="flex items-center gap-3 p-3 border-3 border-black rounded-xl bg-neo-bg cursor-pointer hover:bg-yellow-50">
              <input type="checkbox" v-model="form.isOpen" class="w-5 h-5 accent-black cursor-pointer" />
              <div>
                <div class="font-black text-sm">Открытая комната в общем списке</div>
                <div class="text-xs font-bold text-gray-500">Если выключить — зайти смогут только друзья по коду</div>
              </div>
            </label>

            <!-- ВЫБОР НАБОРОВ СИТУАЦИЙ -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="font-black text-sm uppercase">📝 Наборы ситуаций (выбрано: {{ selectedSitPacks.length }})</label>
                <button type="button" @click="toggleAllSitPacks" class="text-xs font-black underline">
                  Выбрать все
                </button>
              </div>
              <div v-if="loadingPacks" class="text-xs font-bold animate-pulse py-3">Загружаем наборы...</div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto p-1">
                <div
                  v-for="pack in situationPacks"
                  :key="pack.id"
                  @click="toggleSelection(selectedSitPacks, pack.id)"
                  :class="selectedSitPacks.includes(pack.id) ? 'bg-neo-green shadow-neo-sm -translate-y-0.5' : 'bg-white opacity-75'"
                  class="border-3 border-black p-2.5 rounded-xl cursor-pointer font-black text-sm flex items-center justify-between transition-all"
                >
                  <span class="truncate">{{ pack.name }}</span>
                  <span class="border-2 border-black w-5 h-5 flex items-center justify-center rounded bg-white text-xs">
                    {{ selectedSitPacks.includes(pack.id) ? '✓' : '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ВЫБОР НАБОРОВ КАРТОЧЕК (МЕМОВ) -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="font-black text-sm uppercase">🃏 Наборы карточек-мемов (выбрано: {{ selectedCardPacks.length }})</label>
                <button v-if="cardPacks.length" type="button" @click="toggleAllCardPacks" class="text-xs font-black underline">
                  Выбрать все
                </button>
              </div>

              <div v-if="loadingPacks" class="text-xs font-bold animate-pulse py-3">Загружаем карточки...</div>

              <!-- Если в БД нет ни одного набора картинок -->
              <div v-else-if="cardPacks.length === 0" class="border-3 border-black bg-neo-pink/15 p-4 rounded-xl text-center">
                <p class="font-black text-sm text-neo-pink mb-2">
                  ⚠️ В базе пока нет ни одного набора карточек!
                </p>
                <p class="text-xs font-bold text-gray-700 mb-3">
                  Для старта игры нужен хотя бы 1 пак мемов. Загрузи свои картинки в разделе «Наборы и Мемы».
                </p>
                <router-link to="/packs" class="neo-btn bg-neo-purple text-white text-xs py-2 inline-flex">
                  📦 Перейти к загрузке паков
                </router-link>
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto p-1">
                <div
                  v-for="pack in cardPacks"
                  :key="pack.id"
                  @click="toggleSelection(selectedCardPacks, pack.id)"
                  :class="selectedCardPacks.includes(pack.id) ? 'bg-neo-cyan shadow-neo-sm -translate-y-0.5' : 'bg-white opacity-75'"
                  class="border-3 border-black p-2.5 rounded-xl cursor-pointer font-black text-sm flex items-center justify-between transition-all"
                >
                  <span class="truncate">{{ pack.name }}</span>
                  <span class="border-2 border-black w-5 h-5 flex items-center justify-center rounded bg-white text-xs">
                    {{ selectedCardPacks.includes(pack.id) ? '✓' : '' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button @click="showCreateModal = false" class="neo-btn bg-gray-200 flex-1">Отмена</button>
            <button
              @click="createGame"
              :disabled="creatingGame"
              class="neo-btn bg-neo-yellow flex-1 text-lg disabled:opacity-50"
            >
              {{ creatingGame ? 'Создаём...' : 'СОЗДАТЬ И ВОЙТИ 🚀' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import type { ICardPack, IGame, ISituationPack } from '@/types';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const games = ref<IGame[]>([]);
const loading = ref(false);
const roomCode = ref('');
const joiningCode = ref(false);

const showCreateModal = ref(false);
const loadingPacks = ref(false);
const creatingGame = ref(false);

const situationPacks = ref<ISituationPack[]>([]);
const cardPacks = ref<ICardPack[]>([]);
const selectedSitPacks = ref<string[]>([]);
const selectedCardPacks = ref<string[]>([]);

const form = ref({
  maxPlayers: 6,
  maxRounds: 5,
  isOpen: true,
});

const loadGames = async () => {
  loading.value = true;
  try {
    const { data } = await http.get('/game?page=1&take=20');
    games.value = data.data || [];
  } catch {
    toast.error('Не удалось загрузить список игр');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = async () => {
  showCreateModal.value = true;
  loadingPacks.value = true;
  try {
    const [sitsRes, cardsRes] = await Promise.all([
      http.get('/situation-pack?page=1&take=20'),
      http.get('/card-pack?page=1&take=20'),
    ]);
    situationPacks.value = sitsRes.data.data || [];
    cardPacks.value = cardsRes.data.data || [];

    // По умолчанию выбираем все доступные паки
    selectedSitPacks.value = situationPacks.value.map((p) => p.id);
    selectedCardPacks.value = cardPacks.value.map((p) => p.id);
  } catch {
    toast.error('Ошибка при загрузке наборов');
  } finally {
    loadingPacks.value = false;
  }
};

const toggleSelection = (list: string[], id: string) => {
  const idx = list.indexOf(id);
  if (idx === -1) list.push(id);
  else list.splice(idx, 1);
};

const toggleAllSitPacks = () => {
  if (selectedSitPacks.value.length === situationPacks.value.length) {
    selectedSitPacks.value = [];
  } else {
    selectedSitPacks.value = situationPacks.value.map((p) => p.id);
  }
};

const toggleAllCardPacks = () => {
  if (selectedCardPacks.value.length === cardPacks.value.length) {
    selectedCardPacks.value = [];
  } else {
    selectedCardPacks.value = cardPacks.value.map((p) => p.id);
  }
};

const joinByCode = async () => {
  const cleanCode = roomCode.value.trim().toUpperCase();
  if (cleanCode.length !== 6) {
    toast.warning('Код комнаты должен состоять из 6 символов!');
    return;
  }
  joiningCode.value = true;
  try {
    await http.post('/game/join', { code: cleanCode });
    // Получаем актуальный gameId пользователя через /user/me (работает и для закрытых игр!)
    const { data: meData } = await http.get('/user/me');
    if (meData.user?.gameId) {
      toast.success(`Вход в комнату #${cleanCode}!`);
      router.push(`/game/${meData.user.gameId}`);
    } else {
      toast.error('Не удалось определить ID комнаты');
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Комната не найдена или уже заполнена');
  } finally {
    joiningCode.value = false;
  }
};

const joinGameById = async (id: string) => {
  try {
    await http.post('/game/join', { gameId: id });
    toast.success('Влетаем в игру!');
    router.push(`/game/${id}`);
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Не удалось присоединиться к комнате');
  }
};

const createGame = async () => {
  if (form.value.maxPlayers < 2 || form.value.maxPlayers > 10) {
    toast.warning('Количество игроков должно быть от 2 до 10');
    return;
  }
  if (form.value.maxRounds < 1) {
    toast.warning('Укажи хотя бы 1 раунд');
    return;
  }
  if (selectedSitPacks.value.length === 0) {
    toast.warning('Выбери хотя бы один набор ситуаций!');
    return;
  }
  if (selectedCardPacks.value.length === 0) {
    toast.warning('Выбери хотя бы один набор карточек-мемов!');
    return;
  }

  creatingGame.value = true;
  try {
    const { data } = await http.post('/game', {
      maxPlayers: form.value.maxPlayers,
      maxRounds: form.value.maxRounds,
      isOpen: form.value.isOpen,
      situationPacksIds: selectedSitPacks.value,
      cardPacksIds: selectedCardPacks.value,
    });

    const newGameId = data.data.id;
    await http.post('/game/join', { gameId: newGameId });
    toast.success(`Комната #${data.data.code} создана!`);
    showCreateModal.value = false;
    router.push(`/game/${newGameId}`);
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Ошибка при создании комнаты');
  } finally {
    creatingGame.value = false;
  }
};

const onLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

onMounted(loadGames);
</script>