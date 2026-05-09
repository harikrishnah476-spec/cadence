import { create } from 'zustand';
import { performanceAnalyzer } from '@/core/PerformanceAnalyzer';
import { useUserStore } from './useUserStore';
import { useCoachingStore } from './useCoachingStore';
import { predictiveModel } from '@/core/PredictiveModel';
import { soundManager } from '@/lib/SoundManager';
import { analytics } from '@/lib/Analytics';
import { DICTIONARIES } from '@/data/dictionaries';

export type Environment = keyof typeof DICTIONARIES;

interface TypingState {
  text: string;
  userInput: string;
  startTime: number | null;
  endTime: number | null;
  errors: number[];
  
  wpm: number;
  accuracy: number;
  streak: number;
  maxStreak: number;
  combo: number;
  momentum: number;
  isCompleted: boolean;
  
  currentEnvironment: Environment;
  prediction: any;
  
  setText: (text: string) => void;
  setEnvironment: (env: Environment) => void;
  generateText: (wordCount?: number) => void;
  handleInput: (input: string) => void;
  reset: () => void; // completely clear and return home
  retry: () => void; // keep text, reset stats
  calculateStats: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  text: '',
  userInput: '',
  startTime: null,
  endTime: null,
  errors: [],
  wpm: 0,
  accuracy: 0,
  streak: 0,
  maxStreak: 0,
  combo: 1,
  momentum: 0,
  isCompleted: false,
  currentEnvironment: 'Velocity',
  prediction: null,

  setEnvironment: (env) => {
    set({ currentEnvironment: env });
    get().generateText(env === 'WriterFlow' ? 3 : 20);
  },

  setText: (text) => set({ 
    text, 
    userInput: '', 
    startTime: null, 
    endTime: null, 
    errors: [], 
    wpm: 0, 
    accuracy: 0, 
    streak: 0,
    maxStreak: 0,
    combo: 1,
    momentum: 0,
    isCompleted: false 
  }),

  generateText: (wordCount = 25) => {
    const { currentEnvironment } = get();
    const { profile } = useCoachingStore.getState();
    const weakBigrams = performanceAnalyzer.getWeakBigrams(10);
    
    let adjustedWordCount = wordCount;
    if (profile.fatigueResistance < 30) adjustedWordCount = Math.max(10, wordCount - 10);
    
    let words: string[] = [];
    const source = DICTIONARIES[currentEnvironment];

    const sentenceEnvironments: Environment[] = [
      'BeginnerDrills', 'IntermediateDrills', 'AdvancedDrills', 
      'Punctuation', 'SpeedBurst', 'Endurance', 'WriterFlow', 'Precision'
    ];

    if (sentenceEnvironments.includes(currentEnvironment)) {
      // Pick 2-3 random sentences/drills instead of 25 words
      const lineCount = currentEnvironment === 'Endurance' ? 4 : 2;
      const sentences = [...source].sort(() => 0.5 - Math.random());
      words = sentences.slice(0, lineCount);
    } else {
      for (let i = 0; i < adjustedWordCount; i++) {
        if (Math.random() < 0.4 && weakBigrams.length > 0) {
          const target = weakBigrams[Math.floor(Math.random() * weakBigrams.length)];
          const candidateWords = source.filter(w => w.includes(target));
          if (candidateWords.length > 0) {
            words.push(candidateWords[Math.floor(Math.random() * candidateWords.length)]);
            continue;
          }
        }
        words.push(source[Math.floor(Math.random() * source.length)]);
      }
    }

    get().setText(words.join(' '));
    predictiveModel.reset();
  },

  handleInput: (input) => {
    const { text, startTime, isCompleted, errors: currentErrors, currentEnvironment } = get();
    if (isCompleted) return;

    const now = Date.now();
    if (!startTime) {
      analytics.startSession();
      performanceAnalyzer.clearSessionData();
    }
    const newStartTime = startTime ?? now;
    
    const errors: number[] = [];
    const lastCharIndex = input.length - 1;
    let isCorrect = true;
    
    if (lastCharIndex >= 0) {
      const prevChar = lastCharIndex > 0 ? text[lastCharIndex - 1] : ' ';
      const currentChar = text[lastCharIndex];
      isCorrect = input[lastCharIndex] === text[lastCharIndex];
      
      const lastTime = (get() as any)._lastKeystrokeTime || now;
      const latency = now - lastTime;
      
      performanceAnalyzer.recordKeystroke(prevChar, currentChar, latency, isCorrect);
      predictiveModel.recordKeystroke(latency, isCorrect);
      
      (get() as any)._lastKeystrokeTime = now;
      soundManager.playKeystroke(isCorrect);
    }

    for (let i = 0; i < input.length; i++) {
      if (input[i] !== text[i]) {
        errors.push(i);
      }
    }

    // Contextual Completion Logic
    const isDone = input.length === text.length && errors.length === 0;
    
    const wasNewlyCorrect = isCorrect && errors.length <= currentErrors.length;
    const newStreak = wasNewlyCorrect ? get().streak + 1 : 0;
    const newMaxStreak = Math.max(get().maxStreak, newStreak);
    const newCombo = 1 + Math.floor(newStreak / 20) * 0.5;
    const newMomentum = Math.min(newStreak / 50, 1);

    if (newStreak > 0 && newStreak % 10 === 0) {
      soundManager.playStreakRise(newStreak);
    }

    const prediction = predictiveModel.predict();

    set({
      userInput: input,
      startTime: newStartTime,
      endTime: isDone ? now : null,
      errors,
      isCompleted: isDone,
      streak: newStreak,
      maxStreak: newMaxStreak,
      combo: newCombo,
      momentum: newMomentum,
      prediction
    });

    get().calculateStats();
    
    if (input.length % 5 === 0) {
      performanceAnalyzer.recordSpeedSample(get().wpm);
    }

    if (isDone) {
      const { wpm, accuracy } = get();
      const insights = performanceAnalyzer.getInsights();
      
      useCoachingStore.getState().recordSession({
        timestamp: now,
        wpm,
        accuracy,
        rhythmStability: insights.rhythmStability,
        fatigueIndex: insights.fatigueIndex,
        consistencyScore: insights.consistencyScore,
        weakPoints: insights.weakPoints
      });

      const xpEarned = Math.round((wpm * accuracy) / 10);
      useUserStore.getState().addXp(xpEarned);
      useUserStore.getState().updateBestWpm(wpm);
      useUserStore.getState().incrementSessions();
      soundManager.playXpGain();
      analytics.endSession(wpm, accuracy);
    }
  },

  calculateStats: () => {
    const { userInput, startTime, endTime, errors } = get();
    if (!startTime) return;

    const now = endTime ?? Date.now();
    const durationInMinutes = (now - startTime) / 1000 / 60;
    
    if (durationInMinutes <= 0) return;

    const wordsTyped = userInput.length / 5;
    const wpm = Math.round(wordsTyped / durationInMinutes);
    const accuracy = userInput.length > 0 
      ? Math.round(((userInput.length - errors.length) / userInput.length) * 100)
      : 100;

    set({ wpm, accuracy });
  },

  reset: () => set({
    text: '',
    userInput: '',
    startTime: null,
    endTime: null,
    errors: [],
    wpm: 0,
    accuracy: 0,
    streak: 0,
    maxStreak: 0,
    combo: 1,
    momentum: 0,
    isCompleted: false,
    prediction: null
  }),

  retry: () => set((state) => ({
    userInput: '',
    startTime: null,
    endTime: null,
    errors: [],
    wpm: 0,
    accuracy: 0,
    streak: 0,
    maxStreak: 0,
    combo: 1,
    momentum: 0,
    isCompleted: false,
    prediction: null
  }))
}));
