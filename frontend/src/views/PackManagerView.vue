<template>
  <div class="min-h-screen bg-neo-bg p-4 md:p-6 flex flex-col items-center">
    <header class="w-full max-w-5xl flex justify-between items-center mb-8 neo-box p-4 bg-white">
      <router-link to="/" class="neo-btn bg-neo-bg text-sm py-1.5">👈 Назад в лобби</router-link>
      <h1 class="font-display text-2xl tracking-wider">НАБОРЫ И МЕМЫ</h1>
    </header>

    <!-- СПИСОК УЖЕ ИМЕЮЩИХСЯ ПАКОВ В БАЗЕ -->
    <section class="w-full max-w-5xl grid md:grid-cols-2 gap-6 mb-8">
      <div class="neo-box p-5 bg-neo-yellow">
        <h3 class="font-black text-lg mb-3">📚 Доступные паки ситуаций ({{ sitPacks.length }})</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="p in sitPacks"
            :key="p.id"
            class="bg-white border-2 border-black px-3 py-1 rounded-lg font-black text-xs shadow-neo-sm"
          >
            📝 {{ p.name }}
          </span>
        </div>
      </div>

      <div class="neo-box p-5 bg-neo-cyan">
        <h3 class="font-black text-lg mb-3">🃏 Доступные паки карточек ({{ cardPacks.length }})</h3>
        <div v-if="cardPacks.length === 0" class="text-xs font-black bg-white border-2 border-black p-2 rounded-lg">
          Паков карточек еще нет — загрузи первый ниже!
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <span
            v-for="p in cardPacks"
            :key="p.id"
            class="bg-white border-2 border-black px-3 py-1 rounded-lg font-black text-xs shadow-neo-sm"
          >
            🖼️ {{ p.name }}
          </span>
        </div>
      </div>
    </section>

    <!-- ФОРМЫ СОЗДАНИЯ -->
    <div class="w-full max-w-5xl grid md:grid-cols-2 gap-6">
      <!-- Загрузка пака карточек (Мемов) -->
      <div class="neo-box p-6 bg-white flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-black mb-1">📸 ЗАГРУЗИТЬ ПАК МЕМОВ</h2>
          <p class="text-xs font-bold text-gray-500 mb-4">Форматы PNG, JPG, WEBP (до 2 МБ каждый, от 1 до 50 файлов).</p>

          <form @submit.prevent="uploadCardPack" class="space-y-4">
            <div>
              <label class="font-black text-xs uppercase block mb-1">Название пака (3–50 символов)</label>
              <input
                v-model="cardPackName"
                placeholder="Например: Золотой фонд Твича"
                class="w-full border-3 border-black p-2.5 rounded-xl font-bold focus:bg-yellow-50 focus:outline-none"
              />
            </div>

            <div>
              <label class="font-black text-xs uppercase block mb-1">Выбери картинки</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                @change="onFilesSelected"
                class="w-full border-3 border-black p-2 rounded-xl font-bold bg-neo-bg text-sm cursor-pointer"
              />
            </div>

            <!-- Превью выбранных файлов -->
            <div v-if="previews.length > 0" class="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border-2 border-black rounded-xl bg-neo-bg">
              <img
                v-for="(src, i) in previews"
                :key="i"
                :src="src"
                class="w-full h-16 object-cover border border-black rounded"
              />
            </div>

            <button type="submit" :disabled="uploading" class="neo-btn bg-neo-pink text-white w-full py-3">
              {{ uploading ? 'Загружаем в S3...' : `Загрузить пак (${previews.length} шт.) 🚀` }}
            </button>
          </form>
        </div>
      </div>

      <!-- Создание пака ситуаций -->
      <div class="neo-box p-6 bg-white">
        <h2 class="text-xl font-black mb-1">✍️ СОЗДАТЬ ПАК СИТУАЦИЙ</h2>
        <p class="text-xs font-bold text-gray-500 mb-4">Добавь минимум 3 смешные жизненные ситуации.</p>

        <form @submit.prevent="uploadSituationPack" class="space-y-3">
          <div>
            <label class="font-black text-xs uppercase block mb-1">Название набора</label>
            <input
              v-model="sitPackName"
              placeholder="Например: Общажные будни"
              class="w-full border-3 border-black p-2.5 rounded-xl font-bold focus:bg-yellow-50 focus:outline-none"
            />
          </div>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div v-for="(sit, idx) in situations" :key="idx" class="flex gap-2 items-center">
              <span class="font-black text-xs w-6">#{{ idx + 1 }}</span>
              <input
                v-model="sit.text"
                :placeholder="'Когда...'"
                class="w-full border-2 border-black p-2 rounded-lg text-sm font-bold"
              />
              <button
                v-if="situations.length > 3"
                type="button"
                @click="situations.splice(idx, 1)"
                class="border-2 border-black bg-neo-pink text-white px-2 py-1 rounded font-black text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          <button
            type="button"
            @click="situations.push({ text: '', isAdult: false, category: 'Пользовательские' })"
            class="neo-btn bg-neo-yellow text-xs py-1.5 w-full"
          >
            + Добавить еще ситуацию
          </button>

          <button type="submit" class="neo-btn bg-neo-green w-full py-3 mt-4">
            Сохранить набор ситуаций 💾
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { http } from '@/api/http';
import { useToastStore } from '@/stores/toast';
import type { ICardPack, ISituationPack } from '@/types';

const toast = useToastStore();

const sitPacks = ref<ISituationPack[]>([]);
const cardPacks = ref<ICardPack[]>([]);

const cardPackName = ref('');
const selectedFiles = ref<File[]>([]);
const previews = ref<string[]>([]);
const uploading = ref(false);

const sitPackName = ref('');
const situations = ref([
  { text: 'Когда проснулся за минуту до будильника', isAdult: false, category: 'Жизнь' },
  { text: 'Когда препод спросил: "Кто готов отвечать?"', isAdult: false, category: 'Учеба' },
  { text: 'Твое лицо, когда банкомат съел карту', isAdult: false, category: 'Фейлы' },
]);

const loadExistingPacks = async () => {
  try {
    const [sRes, cRes] = await Promise.all([
      http.get('/situation-pack?page=1&take=20'),
      http.get('/card-pack?page=1&take=20'),
    ]);
    sitPacks.value = sRes.data.data || [];
    cardPacks.value = cRes.data.data || [];
  } catch {
    toast.error('Не удалось загрузить существующие наборы');
  }
};

const onFilesSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  if (files.length > 50) {
    toast.warning('Максимум 50 картинок за раз!');
    return;
  }

  selectedFiles.value = files;
  previews.value = files.map((file) => URL.createObjectURL(file));
};

const uploadCardPack = async () => {
  if (cardPackName.value.trim().length < 3) {
    toast.warning('Название пака должно быть не короче 3 символов!');
    return;
  }
  if (selectedFiles.value.length === 0) {
    toast.warning('Выбери хотя бы одну картинку-мем!');
    return;
  }

  uploading.value = true;
  const formData = new FormData();
  formData.append('name', cardPackName.value.trim());
  selectedFiles.value.forEach((file) => {
    formData.append('cards', file);
  });

  try {
    const { data } = await http.post('/card-pack', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.success === false) {
      toast.error(data.message || 'Не удалось загрузить файлы в S3');
      return;
    }
    toast.success('Пак карточек успешно загружен!');
    cardPackName.value = '';
    selectedFiles.value = [];
    previews.value = [];
    await loadExistingPacks();
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Ошибка при загрузке карточек');
  } finally {
    uploading.value = false;
  }
};

const uploadSituationPack = async () => {
  if (sitPackName.value.trim().length < 3) {
    toast.warning('Название пака должно быть не короче 3 символов!');
    return;
  }
  const validSituations = situations.value.filter((s) => s.text.trim().length > 0);
  if (validSituations.length < 3) {
    toast.warning('Заполни минимум 3 ситуации!');
    return;
  }

  try {
    const { data } = await http.post('/situation-pack', {
      name: sitPackName.value.trim(),
      situations: validSituations,
    });
    if (data.success === false) {
      toast.error(data.message || 'Ошибка сохранения');
      return;
    }
    toast.success('Набор ситуаций успешно сохранен!');
    sitPackName.value = '';
    await loadExistingPacks();
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Ошибка при сохранении набора');
  }
};

onMounted(loadExistingPacks);
</script>