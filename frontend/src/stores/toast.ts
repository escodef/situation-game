import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface IToast {
  id: number;
  message: string;
  type: ToastType;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<IToast[]>([]);
  let nextId = 1;

  const show = (message: string, type: ToastType = 'error', duration = 4000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      remove(id);
    }, duration);
  };

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  return {
    toasts,
    show,
    error: (msg: string) => show(msg, 'error'),
    success: (msg: string) => show(msg, 'success'),
    info: (msg: string) => show(msg, 'info'),
    warning: (msg: string) => show(msg, 'warning'),
    remove,
  };
});