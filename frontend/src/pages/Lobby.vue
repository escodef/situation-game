<template>
  <div class="lobby-page">
    <div class="container" v-if="!settingsOpened">
      <div class="box-container">
        <div class="upper-buttons">
          <label>Лобби (ключ доступа — JA5GH)</label>
          <div class="close-btn" v-sound>
            <label>X</label>
          </div>
        </div>
        <div class="box-container-inside">
          <div
            v-for="player in players"
            :key="player.id"
            class="player-row"
            v-sound
          >
            <div class="player-left">
              <div
                class="avatar"
                :style="{
                  backgroundColor: stringToColor(player.nickname),
                  border:
                    player.role === 'creator'
                      ? '3px solid ' + 'var(--text-color-player-host)'
                      : 'none',
                }"
              >
                <label
                  class="avatar-char"
                  :style="{
                    color:
                      player.role === 'creator'
                        ? 'var(--text-color-player-host)'
                        : 'var(--text-color-secondary)',
                  }"
                >
                  {{ player.nickname.charAt(0).toUpperCase() }}
                </label>
              </div>

              <label
                class="nickname"
                :style="{
                  color:
                    player.role === 'creator'
                      ? 'var(--text-color-player-host)'
                      : 'var(--text-color-secondary)',
                }"
              >
                {{ player.nickname }}
              </label>
            </div>

            <label v-if="player.role === 'creator'" class="host-label">
              <Хост>
            </label>
          </div>
        </div>
      </div>
    </div>
    <LobbySettings v-else />
    <div class="buttons-container" v-if="isCreator">
      <div class="btn" @click="toggleSettings">
        <button v-sound>{{ settingsOpened ? "Лобби" : "Настройки" }}</button>
      </div>

      <div class="btn">
        <button v-sound>Начать</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { stringToColor } from "../utils/stringToColor";
import LobbySettings from "../components/LobbySettings.vue";

const router = useRouter();
const route = useRoute();

type PlayerRole = "creator" | "user";

interface Player {
  id: number;
  nickname: string;
  role: PlayerRole;
}

const players = ref<Player[]>([
  { id: 1, nickname: "ShadowFox", role: "user" },
  { id: 2, nickname: "NightWolf", role: "user" },
  { id: 3, nickname: "IronClaw", role: "user" },
  { id: 4, nickname: "GhostByte", role: "creator" },
  { id: 5, nickname: "PixelRider", role: "user" },
  { id: 6, nickname: "DarkNova", role: "user" },
  { id: 7, nickname: "CyberAce", role: "user" },
  { id: 8, nickname: "RedComet", role: "user" },
]);

const isCreator = ref(true);
const settingsOpened = ref(false);

const toggleSettings = () => {
  settingsOpened.value = !settingsOpened.value;

  if (settingsOpened.value) {
    router.push({ hash: "#settings" });
  } else {
    router.push({ hash: "" });
  }
};

watch(
  () => route.hash,
  (newHash) => {
    settingsOpened.value = newHash === "#settings";
  },
  { immediate: true },
);
</script>

<style scoped>
.lobby-page {
  height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  background-image:
    linear-gradient(rgba(30, 30, 30, 0.66), rgba(30, 30, 30, 0.66)),
    url("/images/bg1.png");

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-container {
  width: 1047px;
  height: 819px;
  background-color: var(--box-bg-secondary);
  display: flex;
  flex-direction: column;

  box-shadow: 16px 16px 0px var(--box-bg-shadow);
}

.box-container-inside {
  width: 1023px;
  height: 753px;
  background-color: var(--box-bg-primary);
  align-self: center;
  margin-top: auto;
  margin-bottom: 12px;
}

.upper-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  padding-left: 14px;
}

.close-btn {
  width: 40px;
  height: 40px;
  background-color: var(--close-btn-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  cursor: pointer;

  box-shadow:
    inset 3px 4px 4px 0 rgba(255, 255, 255, 0.25),
    inset -3px -6px 9.4px -1px rgba(0, 0, 0, 0.25);

  label {
    font-size: 18px;
    margin-left: 4px;
    margin-top: 3px;
    text-shadow: none;
    cursor: pointer;
  }
}

.close-btn:hover {
  transform: scale(0.96);
}

.buttons-container {
  position: absolute;
  right: calc((100vw - 1822px) / 2);
  bottom: calc((100vh - 819px) / 2);
  display: flex;
  flex-direction: column;
  gap: 25px;
}
button {
  width: 337px;
  height: 89px;
}

.player-row {
  height: calc(753px / 8);

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;
  box-sizing: border-box;
}

.player-row:hover {
  opacity: 0.8;
}

.player-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar {
  width: 64px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 4px;

  color: #fff;
}

.host-label {
  color: var(--text-color-player-host);
  cursor: pointer;
}
</style>
