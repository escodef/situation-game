import type { Directive } from "vue";
import { soundManager } from "./soundManager";

export const vSound: Directive = {
  mounted(el) {
    el.addEventListener("mouseenter", () => {
      soundManager.play("hover");
    });

    el.addEventListener("click", () => {
      soundManager.play("click");
    });
  },
};
