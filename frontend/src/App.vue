<template>
  <NeoToast />
  <div v-if="!authStore.isAuthChecked" class="min-h-screen bg-neo-bg flex flex-col items-center justify-center gap-4">
    <div class="neo-box bg-neo-yellow px-8 py-4 font-display text-3xl tracking-wider animate-bounce">
      ЗАГРУЗКА МЕМОВ...
    </div>
  </div>
  <router-view v-else v-slot="{ Component }">
    <Transition name="pop" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import NeoToast from '@/components/NeoToast.vue';

const authStore = useAuthStore();
onMounted(() => {
  authStore.initSession();
});
</script>