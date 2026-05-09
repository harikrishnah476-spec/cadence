import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PerformanceBaseline {
  wpm: number;
  accuracy: number;
  rhythmStability: number;
  fatigueIndex: number;
  timestamp: number;
}

export interface UserPerformanceProfile {
  fatigueResistance: number; // 0-100, ability to maintain performance
  rhythmStabilityTrend: number[]; 
  consistencyEvolution: number[];
  skillAdaptationRate: number; // Measurable WPM gain per session
  lastTrainingDate: number;
  baselines: {
    initial: PerformanceBaseline | null;
    current: PerformanceBaseline | null;
  };
}

export interface SessionRecord {
  timestamp: number;
  wpm: number;
  accuracy: number;
  rhythmStability: number;
  fatigueIndex: number;
  consistencyScore: number;
  weakPoints: string[];
}

interface CoachingState {
  profile: UserPerformanceProfile;
  history: SessionRecord[];
  
  recordSession: (record: SessionRecord) => void;
  getRecommendations: () => { type: string; message: string; priority: 'low' | 'med' | 'high' }[];
  calculateProfile: () => void;
}

export const useCoachingStore = create<CoachingState>()(
  persist(
    (set, get) => ({
      profile: {
        fatigueResistance: 50,
        rhythmStabilityTrend: [],
        consistencyEvolution: [],
        skillAdaptationRate: 0,
        lastTrainingDate: Date.now(),
        baselines: {
          initial: null,
          current: null
        }
      },
      history: [],

      recordSession: (record) => {
        const { history, profile } = get();
        const newHistory = [...history, record].slice(-100);
        
        // Establish Initial Baseline if it doesn't exist (after 3 sessions for stability)
        let initialBaseline = profile.baselines.initial;
        if (!initialBaseline && newHistory.length === 3) {
          const avg = newHistory.reduce((acc, h) => ({
            wpm: acc.wpm + h.wpm / 3,
            accuracy: acc.accuracy + h.accuracy / 3,
            rhythmStability: acc.rhythmStability + h.rhythmStability / 3,
            fatigueIndex: acc.fatigueIndex + h.fatigueIndex / 3,
          }), { wpm: 0, accuracy: 0, rhythmStability: 0, fatigueIndex: 0 });
          
          initialBaseline = { ...avg, timestamp: Date.now() };
        }

        const currentBaseline = {
          wpm: record.wpm,
          accuracy: record.accuracy,
          rhythmStability: record.rhythmStability,
          fatigueIndex: record.fatigueIndex,
          timestamp: record.timestamp
        };

        set({ 
          history: newHistory,
          profile: {
            ...profile,
            baselines: {
              initial: initialBaseline,
              current: currentBaseline
            }
          }
        });
        get().calculateProfile();
      },

      calculateProfile: () => {
        const { history, profile } = get();
        if (history.length < 5) return;

        const latest = history.slice(-10);
        
        // Fatigue Resistance (Inverse of performance decay)
        const avgFatigue = latest.reduce((a, b) => a + b.fatigueIndex, 0) / latest.length;
        const fatigueResistance = Math.max(0, 100 - avgFatigue * 2);

        // Skill Adaptation Rate (Measurable improvement delta)
        const firstAvgWpm = history.slice(0, 5).reduce((a, b) => a + b.wpm, 0) / 5;
        const lastAvgWpm = latest.reduce((a, b) => a + b.wpm, 0) / latest.length;
        const skillAdaptationRate = (lastAvgWpm - firstAvgWpm) / history.length;

        set({
          profile: {
            ...profile,
            fatigueResistance,
            rhythmStabilityTrend: history.map(h => h.rhythmStability),
            consistencyEvolution: history.map(h => h.consistencyScore),
            skillAdaptationRate,
            lastTrainingDate: Date.now()
          }
        });
      },

      getRecommendations: () => {
        const { profile, history } = get();
        if (history.length === 0) return [{ type: 'Baseline', message: 'Complete 3 sessions to establish your performance baseline.', priority: 'high' }];

        const latest = history[history.length - 1];
        const recommendations: { type: string; message: string; priority: 'low' | 'med' | 'high' }[] = [];

        // Behavioral Intervention Logic
        if (latest.fatigueIndex > 15) {
          recommendations.push({ 
            type: 'Recovery', 
            message: 'Fatigue-related slowdown detected. Performance efficiency is dropping.', 
            priority: 'high' 
          });
        }

        if (latest.rhythmStability > 0.3) {
          recommendations.push({ 
            type: 'Rhythm', 
            message: 'Rhythm instability detected. Focus on consistent intervals to stabilize performance.', 
            priority: 'med' 
          });
        }

        if (profile.skillAdaptationRate < 0.1 && history.length > 20) {
          recommendations.push({ 
            type: 'Training', 
            message: 'Progress plateau identified. Switching to a high-precision skill path is recommended.', 
            priority: 'med' 
          });
        }

        return recommendations;
      }
    }),
    {
      name: 'elite_performance_v2'
    }
  )
);
