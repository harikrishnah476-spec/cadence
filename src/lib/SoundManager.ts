'use client';

import { useSettingsStore } from '@/store/useSettingsStore';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    const settings = useSettingsStore.getState();
    if (!this.ctx || !this.enabled || !settings.soundEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playKeystroke(isCorrect: boolean) {
    if (isCorrect) {
      this.playTone(800, 'sine', 0.05, 0.05);
    } else {
      this.playTone(150, 'square', 0.1, 0.03);
    }
  }

  playStreakRise(streak: number) {
    const baseFreq = 400;
    const freq = baseFreq + (streak * 2);
    this.playTone(freq, 'sine', 0.15, 0.04);
  }

  playXpGain() {
    this.playTone(1200, 'sine', 0.3, 0.02);
  }

  toggle(state?: boolean) {
    this.enabled = state ?? !this.enabled;
  }
}

export const soundManager = new SoundManager();
