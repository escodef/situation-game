<template>
  <div class="container">
    <div class="box-container">
      <div class="upper-buttons">
        <label>Настройки лобби (ключ доступа — JA5GH)</label>
        <div class="close-btn" v-sound>
          <label>X</label>
        </div>
      </div>
      <div class="box-container-inside">
        <div class="upper-column">
          <div class="settings-group">
            <span>Интервал:</span>
            <div class="options-container">
              <div
                class="option-item"
                v-sound
                :class="{ active: interval === 20 }"
                @click="interval = 20"
              >
                <span>20 сек.</span>
              </div>
              <div
                class="option-item"
                v-sound
                :class="{ active: interval === 40 }"
                @click="interval = 40"
              >
                <span>40 сек.</span>
              </div>
            </div>
          </div>
          <div class="settings-group">
            <span>Фон лобби:</span>
            <div class="options-container">
              <div
                class="option-item"
                v-sound
                :class="{ active: background === 'serenity' }"
                @click="background = 'serenity'"
              >
                <span>Безмятежность</span>
              </div>
              <div
                class="option-item"
                v-sound
                :class="{ active: background === 'autumn' }"
                @click="background = 'autumn'"
              >
                <span>Осень</span>
              </div>
            </div>
          </div>
          <div class="down-column">
            <span>Кол-во раундов:</span>
            <div class="options-container">
              <div
                class="option-item"
                v-sound
                :class="{ active: rounds === 10 }"
                @click="rounds = 10"
              >
                <span>10</span>
              </div>
              <div
                class="option-item"
                v-sound
                :class="{ active: rounds === 20 }"
                @click="rounds = 20"
              >
                <span>20</span>
              </div>
              <div
                class="option-item"
                v-sound
                :class="{ active: rounds === 30 }"
                @click="rounds = 30"
              >
                <span>30</span>
              </div>
              <div
                class="option-item"
                v-sound
                :class="{ active: rounds === 40 }"
                @click="rounds = 40"
              >
                <span>40</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="buttons-container">
        <div class="btn">
          <button v-sound>Настройки</button>
        </div>

        <div class="btn">
          <button v-sound>Начать</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

const interval = ref<20 | 40>(20);
const background = ref<"serenity" | "autumn">("serenity");
const rounds = ref<10 | 20 | 30 | 40>(20);
</script>

<style scoped>
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

.upper-column {
  padding: 60px 60px;
  display: flex;
  flex-direction: column;
  gap: 110px;
}

.down-column {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-group,
.options-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.options-container {
  gap: 140px;
}

.option-item {
  cursor: pointer;
  position: relative;
}

.option-item.active::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: var(--text-color-main);
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
</style>
