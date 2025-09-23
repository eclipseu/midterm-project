class AudioService {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentBackground: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;
  private audioEnabled: boolean = false;
  private pendingAudioKey: string | null = null;

  constructor() {
    this.preloadAudio();
    this.setupUserInteractionListener();
  }

  private preloadAudio() {
    const audioFiles = {
      "background-menu": "/assets/audio/background-menu.mp3",
      background: "/assets/audio/background.mp3",
      "background-gameover": "/assets/audio/background-gameover.mp3",
      "background-victory": "/assets/audio/background-victory.mp3",
      choice: "/assets/audio/choice.mp3",
    };

    Object.entries(audioFiles).forEach(([key, src]) => {
      const audio = new Audio(src);
      if (key === "choice") {
        // Sound effects don't loop and have a bit lower volume
        audio.loop = false;
        audio.volume = this.volume;
      } else {
        // Background music loops
        audio.loop = true;
        audio.volume = this.volume;
      }
      audio.preload = "auto";
      this.audioElements.set(key, audio);
    });
  }

  private setupUserInteractionListener() {
    const enableAudio = () => {
      console.log("Audio enabled by user interaction");
      this.audioEnabled = true;

      // Play pending audio if there is one
      if (this.pendingAudioKey && !this.isMuted) {
        console.log(`Playing pending audio: ${this.pendingAudioKey}`);
        this.playBackground(this.pendingAudioKey);
        this.pendingAudioKey = null;
      }

      document.removeEventListener("click", enableAudio);
      document.removeEventListener("keydown", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };

    document.addEventListener("click", enableAudio, { once: true });
    document.addEventListener("keydown", enableAudio, { once: true });
    document.addEventListener("touchstart", enableAudio, { once: true });
  }

  public playBackground(audioKey: string): void {
    console.log(
      `Attempting to play audio: ${audioKey}, audioEnabled: ${this.audioEnabled}, isMuted: ${this.isMuted}`
    );

    if (this.isMuted) return;

    // If audio is not enabled yet, store the request for later
    if (!this.audioEnabled) {
      console.log(`Audio not enabled yet, storing ${audioKey} as pending`);
      this.pendingAudioKey = audioKey;
      return;
    }

    // Stop current background music
    this.stopBackground();

    const audio = this.audioElements.get(audioKey);
    if (audio) {
      this.currentBackground = audio;
      audio.currentTime = 0;
      audio.volume = this.volume;

      console.log(`Playing audio: ${audioKey}`);
      audio.play().catch((error) => {
        console.warn("Audio play failed:", error);
      });
    } else {
      console.warn(`Audio not found: ${audioKey}`);
    }
  }

  public stopBackground(): void {
    if (this.currentBackground) {
      this.currentBackground.pause();
      this.currentBackground.currentTime = 0;
      this.currentBackground = null;
    }
  }

  public playSoundEffect(soundKey: string): void {
    if (this.isMuted || !this.audioEnabled) return;

    const audio = this.audioElements.get(soundKey);
    if (audio) {
      // Reset the sound to the beginning
      audio.currentTime = 0;
      audio.volume = this.volume; // Sound effects at max volume

      audio.play().catch((error) => {
        console.warn("Sound effect play failed:", error);
      });
    } else {
      console.warn(`Sound effect not found: ${soundKey}`);
    }
  }

  public setVolume(newVolume: number): void {
    this.volume = Math.max(0, Math.min(1, newVolume));
    this.audioElements.forEach((audio, key) => {
      if (key === "choice") {
        // Sound effects at max volume
        audio.volume = this.volume;
      } else {
        // Background music uses full volume
        audio.volume = this.volume;
      }
    });
  }

  public mute(): void {
    this.isMuted = true;
    this.stopBackground();
  }

  public unmute(): void {
    this.isMuted = false;
  }

  public toggleMute(): boolean {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const audioService = new AudioService();
