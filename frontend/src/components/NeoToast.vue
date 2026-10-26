<template>
  <div class="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="t in toastStore.toasts"
        :key="t.id"
        :class="bgClass(t.type)"
        class="pointer-events-auto border-4 border-black shadow-neo-lg rounded-xl p-4 flex items-start justify-between gap-3 transform transition-all"
      >
        <div class="flex items-center gap-2.5 font-black text-sm md:text-base leading-snug">
          <span class="text-xl shrink-0">{{ icon(t.type) }}</span>
          <span>{{ t.message }}</span>
        </div>
        <button
          @click="toastStore.remove(t.id)"
          class="border-2 border-black bg-white text-black hover:bg-black hover:text-white rounded-md px-1.5 py-0.5 font-black text-xs transition-colors shrink-0"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToastStore, type ToastType } from '@/stores/toast';

const toastStore = useToastStore();

const bgClass = (type: ToastType) => {
  switch (type) {
    case 'error':
      return 'bg-neo-pink text-white';
    case 'success':
      return 'bg-neo-green text-black';
    case 'warning':
      return 'bg-neo-yellow text-black';
    default:
      return 'bg-neo-cyan text-black';
  }
};

const icon = (type: ToastType) => {
  switch (type) {
    case 'error':
      return '💥';
    case 'success':
      return '🔥';
    case 'warning':
      return '⚠️';
    default:
      return '⚡';
  }
};
</script>