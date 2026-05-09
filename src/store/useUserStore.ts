'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OnboardingPhase = 'calibration' | 'skill_discovery' | 'advanced';

interface Rank {
  name: string;
  color: string;
}

export function getRank(level: number): Rank {
  if (level >= 20) return { name: 'Elite', color: 'text-cyan-400' };
  if (level >= 15) return { name: 'Expert', color: 'text-purple-400' };
  if (level >= 10) return { name: 'Advanced', color: 'text-blue-400' };
  if (level >= 5)  return { name: 'Skilled', color: 'text-green-400' };
  return { name: 'Novice', color: 'text-white/40' };
}

interface UserState {
  xp: number;
  totalXp: number;
  level: number;
  bestWpm: number;
  sessions: number;
  onboardingPhase: OnboardingPhase;
  milestones: {
    firstSession: boolean;
    calibrationComplete: boolean;
    firstEnvironmentUnlock: boolean;
  };

  addXp: (amount: number) => void;
  updateBestWpm: (wpm: number) => void;
  incrementSessions: () => void;
  setOnboardingPhase: (phase: OnboardingPhase) => void;
  completeMilestone: (key: keyof UserState['milestones']) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalXp: 0,
      level: 1,
      bestWpm: 0,
      sessions: 0,
      onboardingPhase: 'calibration',
      milestones: {
        firstSession: false,
        calibrationComplete: false,
        firstEnvironmentUnlock: false,
      },

      addXp: (amount) => {
        const newTotalXp = get().totalXp + amount;
        const newLevel = Math.floor(Math.sqrt(newTotalXp / 100)) + 1;
        set({ xp: amount, totalXp: newTotalXp, level: newLevel });
      },

      updateBestWpm: (wpm) => {
        if (wpm > get().bestWpm) set({ bestWpm: wpm });
      },

      incrementSessions: () => {
        const newSessions = get().sessions + 1;
        set({ sessions: newSessions });

        if (newSessions >= 3 && get().onboardingPhase === 'calibration') {
          set({ onboardingPhase: 'skill_discovery' });
          get().completeMilestone('calibrationComplete');
        }
      },

      setOnboardingPhase: (phase) => set({ onboardingPhase: phase }),

      completeMilestone: (key) =>
        set((state) => ({
          milestones: { ...state.milestones, [key]: true },
        })),
    }),
    {
      name: 'cadence_user_v1',
    }
  )
);
