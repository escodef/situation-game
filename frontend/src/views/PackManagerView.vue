<template>
  <div class="min-h-screen bg-neo-bg p-6 flex flex-col items-center">
    <header class="w-full max-w-4xl flex justify-between items-center mb-8 neo-box p-4 bg-white">
      <router-link to="/" class="neo-btn bg-neo-bg text-sm py-1.5">👈 Назад в лобби</router-link>
      <h1 class="font-display text-2xl tracking-wider">УПРАВЛЕНИЕ ПАКАМИ</h1>
    </header>

    <div class="w-full max-w-4xl grid md:grid-cols-2 gap-6">
      <!-- Загрузка пака карточек (Мемов) -->
      <div class="neo-box p-6 bg-white">
        <h2 class="text-xl font-black mb-2">📸 ЗАГРУЗИТЬ ПАК МЕМОВ</h2>
        <p class="text-sm font-bold text-gray-600 mb-4">Поддерживаются PNG, JPG, WEBP (до 50 картинок).</p>

        <form @submit.prevent="uploadCardPack" class="space-y-4">
          <div>
            <label class="font-black text-xs uppercase block mb-1">Название пака</label>
            <input v-model="cardPackName" required class="w-full border-3 border-black p-2 rounded-lg font-bold" />
          </div>

          <div>
            <label class="font-black text-xs uppercase block mb-1">Файлы мемов</label>
            <input type="file" multiple accept="image/*" @change="onFilesSelected" class="w-full border-3 border-black p-2 rounded-lg font-bold bg-neo-bg" />
          </div>

          <button type="submit" :disabled="uploading" class="neo-btn bg-neo-pink text-white w-full py-3">
            {{ uploading ? 'Загрузка в S3...' : 'Загрузить пак карточек 🚀' }}
          </button>
        </form>
      </div>

      <!-- Создание пака ситуаций -->
      <div class="neo-box p-6 bg-white">
        <h2 class="text-xl font-black mb-2">✍️ СОЗДАТЬ ПАК СИТУАЦИЙ</h2>
        <p class="text-sm font-bold text-gray-600 mb-4">Добавь свои текстовые панчлайны (минимум 3 штуки).</p>

        <form @submit.prevent="uploadSituationPack" class="space-y-3">
          <input v-model="sitPackName" placeholder="Название пака (например: Студенческие будни)" required class="w-full border-3 border-black p-2 rounded-lg font-bold" />

          <div v-for="(sit, idx) in situations" :key="idx" class="flex gap-2">
            <input v-model="sit.text" :placeholder="'Ситуация #' + (idx + 1)" required class="w-full border-2 border-black p-1.5 rounded-lg text-sm" />
          </div>

          <button type="button" @click="situations.push({ text: '', isAdult: false, category: 'Пользовательские' })" class="neo-btn bg-neo-yellow text-xs py-1">
            + Еще ситуация
          </button>

          <button type="submit" class="neo-btn bg-neo-green w-full py-3 mt-4">
            Сохранить ситуации 💾
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { http } from '@/api/http';

const cardPackName = ref('');
const selectedFiles = ref<FileList | null>(null);
const uploading = ref(false);

const sitPackName = ref('');
const situations = ref([
  { text: 'Когда проснулся за минуту до будильника', isAdult: false, category: 'Жизнь' },
  { text: 'Когда препод спросил: "Кто готов отвечать?"', isAdult: false, category: 'Учеба' },
  { text: 'Твое лицо, когда банкомат съел карту', isAdult: false, category: 'Фейлы' },
]);

const onFilesSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  selectedFiles.value = target.files;
};

const uploadCardPack = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return;
  uploading.value = true;
  const formData = new FormData();
  formData.append('name', cardPackName.value);
  Array.from(selectedFiles.value).forEach((file) => {
    formData.append('cards', file);
  });

  try {
    await http.post('/card-pack', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('Пак карточек успешно загружен!');
    cardPackName.value = '';
  } catch (e: any) {
    alert(e.response?.data?.message || 'Ошибка загрузки');
  } finally {
    uploading.value = false;
  }
};

const uploadSituationPack = async () => {
  try {
    await http.post('/situation-pack', {
      name: sitPackName.value,
      situations: situations.value,
    });
    alert('Пак ситуаций успешно добавлен!');
    sitPackName.value = '';
  } catch (e: any) {
    alert(e.response?.data?.message || 'Ошибка');
  }
};
</script>