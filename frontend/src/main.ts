import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./style.css";
import { vSound } from "./shared/sound/vSound";
import { initSoundUnlock } from "./shared/sound/soundUnlocker";
initSoundUnlock();

const app = createApp(App);

app.directive("sound", vSound);
app.use(createPinia());
app.use(router);

app.mount("#app");
