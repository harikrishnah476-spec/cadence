'use client';

import React from 'react';
import { TypingArea } from '@/components/TypingArea';
import { useTypingStore, Environment } from '@/store/useTypingStore';
import { useUserStore, getRank, getNextRank } from '@/store/useUserStore';
import { useCoachingStore } from '@/store/useCoachingStore';
import { analytics } from '@/lib/Analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  {
    name: "Fundamentals",
    envs: [
      { id: 'BeginnerDrills', label: 'Beginner' },
      { id: 'IntermediateDrills', label: 'Intermediate' },
      { id: 'AdvancedDrills', label: 'Advanced' },
      { id: 'Velocity', label: 'Velocity' }
    ]
  },
  {
    name: "Specialized",
    envs: [
      { id: 'Precision', label: 'Precision' },
      { id: 'Punctuation', label: 'Punctuation' },
      { id: 'SpeedBurst', label: 'Burst' },
      { id: 'Endurance', label: 'Endurance' }
    ]
  },
  {
    name: "Workflows",
    envs: [
      { id: 'CodeFlow', label: 'Code' },
      { id: 'TerminalFlow', label: 'Terminal' },
      { id: 'WriterFlow', label: 'Writer' },
      { id: 'OfficeFlow', label: 'Office' }
    ]
  }
];

export const PracticeView: React.FC = () => {
  const { currentEnvironment, setEnvironment, userInput } = useTypingStore();
  const { level, xp, totalXp, onboardingPhase } = useUserStore();
  const { getRecommendations } = useCoachingStore();

  const isCalibrating = onboardingPhase === 'calibration';
  const rank = getRank(level);
  const nextRank = getNextRank(level);
  const recommendations = getRecommendations();
  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  const handleEnvironmentChange = (env: Environment) => {
    setEnvironment(env);
    analytics.track('environment_change', { environment: env });
  };

  return (
    <div className="w-full flex flex-col items-center gap-12 relative z-10 pt-16 pb-32 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {userInput.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-3xl flex flex-col gap-12"
          >
            {/* Minimal Progress Header */}
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
              <div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-2">Current Status</div>
                <div className="flex items-baseline gap-3">
                  <h2 className={cn("text-2xl font-black tracking-tight", rank.color)}>{rank.name}</h2>
                  <span className="text-sm font-mono text-white/40">Lvl {level}</span>
                </div>
              </div>
              
              {topRec && !isCalibrating && (
                <div className="text-right max-w-xs">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-2">Focus Area</div>
                  <p className="text-xs text-white/60 leading-relaxed">{topRec.message}</p>
                </div>
              )}
            </div>

            {/* Launchpad Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {CATEGORIES.map(category => (
                <div key={category.name} className="space-y-4">
                  <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{category.name}</h3>
                  <div className="flex flex-col gap-3">
                    {category.envs.map(env => {
                      const isLocked = isCalibrating && env.id !== 'Velocity';
                      const isActive = currentEnvironment === env.id;
                      return (
                        <button
                          key={env.id}
                          disabled={isLocked}
                          onClick={() => handleEnvironmentChange(env.id as Environment)}
                          className={cn(
                            "text-left text-sm font-medium transition-all group flex items-center gap-3",
                            isActive ? "text-white" : isLocked ? "text-white/5 cursor-not-allowed" : "text-white/40 hover:text-white/80"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors",
                            isActive ? "bg-white" : "bg-transparent group-hover:bg-white/20"
                          )} />
                          {env.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Primary Action Hint */}
            <div className="text-center pt-8 opacity-50">
              <span className="text-xs font-mono text-white/40 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                Type directly to begin {currentEnvironment}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TypingArea />
    </div>
  );
};
