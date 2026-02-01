import { soundManager } from "./soundManager";

let unlocked = false;

const unlock = () => {
  if (unlocked) return;
  unlocked = true;

  soundManager.play("click");

  window.removeEventListener("pointerdown", unlock);
  window.removeEventListener("keydown", unlock);
};

export const initSoundUnlock = () => {
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
};
