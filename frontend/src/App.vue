<template>
  <div v-if="!authStore.isAuthChecked" class="min-h-screen bg-neo-bg flex items-center justify-center font-black text-2xl animate-pulse">
    ЗАГРУЗКА МЕМОВ...
  </div>
  <router-view v-else />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
onMounted(() => {
  authStore.initSession();
});
</script>