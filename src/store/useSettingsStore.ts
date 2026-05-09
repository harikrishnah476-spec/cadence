import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  animationIntensity: 'full' | 'reduced' | 'none';
  fontSize: 'small' | 'medium' | 'large';
  toggleSound: () => void;
  setAnimationIntensity: (intensity: 'full' | 'reduced' | 'none') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      soundEnabled: true,
      animationIntensity: 'full',
      fontSize: 'medium',
      
      toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
      setAnimationIntensity: (intensity) => set({ animationIntensity: intensity }),
      setFontSize: (size) => set({ fontSize: size }),
    }),
    {
      name: 'cadence_settings_v1',
    }
  )
);
