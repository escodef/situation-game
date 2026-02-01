import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../pages/HomePage.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../pages/LoginPage.vue"),
    },
    {
      path: "/registration",
      name: "registration",
      component: () => import("../pages/RegistrationPage.vue"),
    },
    {
      path: "/lobby",
      name: "lobby",
      component: () => import("../pages/Lobby.vue"),
    },
  ],
});

export default router;
