type SoundName = "hover" | "click";

class SoundManager {
  private sounds: Record<SoundName, HTMLAudioElement>;

  constructor() {
    this.sounds = {
      hover: new Audio("/audio/hover.wav"),
      click: new Audio("/audio/click.wav"),
    };

    Object.values(this.sounds).forEach((sound) => {
      sound.volume = 0.5;
    });
  }

  play(name: SoundName) {
    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

export const soundManager = new SoundManager();
