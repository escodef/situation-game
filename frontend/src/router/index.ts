import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '@/views/AuthView.vue';
import LobbyView from '@/views/LobbyView.vue';
import GameBoardView from '@/views/GameBoardView.vue';
import PackManagerView from '@/views/PackManagerView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: AuthView },
    { path: '/', component: LobbyView, meta: { requiresAuth: true } },
    { path: '/game/:id', component: GameBoardView, meta: { requiresAuth: true } },
    { path: '/packs', component: PackManagerView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('access_token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});