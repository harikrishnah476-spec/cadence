'use client';

import React from 'react';
import { TypingArea } from '@/components/TypingArea';
import { useTypingStore, Environment } from '@/store/useTypingStore';
import { useUserStore } from '@/store/useUserStore';
import { analytics } from '@/lib/Analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Briefcase, PenTool, Wind, Lock, Target, Crosshair, Zap, Quote, Flame } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ENVIRONMENTS: { id: Environment; label: string; icon: any; minLevel: number }[] = [
  { id: 'Velocity', label: 'Velocity', icon: Wind, minLevel: 1 },
  { id: 'CodeFlow', label: 'Code', icon: Code, minLevel: 2 },
  { id: 'TerminalFlow', label: 'Terminal', icon: Terminal, minLevel: 2 },
  { id: 'OfficeFlow', label: 'Office', icon: Briefcase, minLevel: 2 },
  { id: 'WriterFlow', label: 'Writer', icon: PenTool, minLevel: 2 },
  { id: 'Precision', label: 'Precision', icon: Crosshair, minLevel: 3 },
  { id: 'Endurance', label: 'Endurance', icon: Target, minLevel: 4 },
  { id: 'Punctuation', label: 'Punctuation', icon: Quote, minLevel: 3 },
  { id: 'SpeedBurst', label: 'Burst', icon: Flame, minLevel: 5 },
];

export const PracticeView: React.FC = () => {
  const { currentEnvironment, setEnvironment, userInput } = useTypingStore();
  const { onboardingPhase } = useUserStore();

  const isCalibrating = onboardingPhase === 'calibration';

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
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-cyan-400/60">
              <Target size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Adaptive Rhythm Mastery</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white/90">
              {isCalibrating ? "Align Your Cadence" : "Master Your Rhythm"}
            </h2>
            <p className="text-xs text-white/30 max-w-lg leading-relaxed mx-auto">
              {isCalibrating 
                ? `Cadence analyzes your input rhythm to optimize your professional workflow. Complete your baseline calibration to begin.` 
                : `Your training is now optimized for professional cadence. Choose a workflow below to begin deliberate practice.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-xl max-w-4xl mx-auto">
        {ENVIRONMENTS.map(env => {
          const isLocked = isCalibrating && env.id !== 'Velocity';
          return (
            <button
              key={env.id}
              disabled={isLocked}
              onClick={() => handleEnvironmentChange(env.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                currentEnvironment === env.id 
                  ? "bg-white text-black shadow-lg" 
                  : isLocked ? "text-white/5 cursor-not-allowed" : "text-white/20 hover:text-white/40"
              )}
            >
              {isLocked ? <Lock size={10} /> : <env.icon size={12} />}
              {env.label}
            </button>
          );
        })}
      </div>

      <TypingArea />
      
      <div className="flex items-center gap-12 text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">
        <div className="flex items-center gap-2"><Zap size={10} /> Real-time Validation</div>
        <div className="flex items-center gap-2"><Target size={10} /> Rhythm Analysis</div>
      </div>
    </div>
  );
};
