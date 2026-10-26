import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '@/api/http';
import { socket } from '@/api/socket';
import type { IUser } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IUser | null>(null);
  const token = ref<string | null>(localStorage.getItem('access_token'));
  const isAuthChecked = ref(false);

  const initSession = async () => {
    if (!token.value) {
      isAuthChecked.value = true;
      return;
    }
    try {
      const { data } = await http.get('/user/me');
      user.value = data.user;
      socket.connect(token.value);
    } catch {
      logout();
    } finally {
      isAuthChecked.value = true;
    }
  };

  const setAuth = (newUser: IUser, newToken: string) => {
    user.value = newUser;
    token.value = newToken;
    localStorage.setItem('access_token', newToken);
    socket.connect(newToken);
  };

  const logout = async () => {
    try {
      await http.post('/auth/logout');
    } catch (_) {}
    user.value = null;
    token.value = null;
    localStorage.removeItem('access_token');
    socket.disconnect();
  };

  return { user, token, isAuthChecked, initSession, setAuth, logout };
});