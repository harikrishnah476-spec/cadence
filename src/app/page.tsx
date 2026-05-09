'use client';

import { TypingArea } from '@/components/TypingArea';
import { UserBadge } from '@/components/UserBadge';
import { ResultOverlay } from '@/components/ResultOverlay';
import { Keyboard, Zap, Activity, Code, Terminal, Briefcase, PenTool, Wind, Info, Lock, Target } from 'lucide-react';
import { useTypingStore, Environment } from '@/store/useTypingStore';
import { useUserStore } from '@/store/useUserStore';
import { analytics } from '@/lib/Analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
];

export default function Home() {
  const { currentEnvironment, setEnvironment, userInput } = useTypingStore();
  const { onboardingPhase, sessions } = useUserStore();

  const isCalibrating = onboardingPhase === 'calibration';

  const handleEnvironmentChange = (env: Environment) => {
    setEnvironment(env);
    analytics.track('environment_change', { environment: env });
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 overflow-hidden relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen gap-16">
          <nav className="w-full max-w-6xl flex justify-between items-center absolute top-12 px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/5">
                <Activity className="text-white/40" size={18} />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-[0.2em] text-white/40 uppercase">Cadence</h1>
              </div>
            </div>
            <UserBadge />
          </nav>

          <div className="w-full flex flex-col items-center gap-12">
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

            <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-xl">
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
              <div className="flex items-center gap-2"><Activity size={10} /> Rhythm Analysis</div>
            </div>
          </div>

          <footer className="w-full max-w-6xl absolute bottom-12 px-6 flex justify-between items-center text-[9px] font-bold text-white/10 uppercase tracking-[0.4em]">
            <div className="flex items-center gap-2">
              <Info size={10} />
              <span>{isCalibrating ? "Phase 1: Establishing Baseline Cadence" : "Phase 2: Rhythmic Workflow Mastery"}</span>
            </div>
            <div className="flex gap-6">
              <span>Adaptive Engine: {isCalibrating ? "Aligning" : "Synchronized"}</span>
              <span>v1.1.0</span>
            </div>
          </footer>
        </div>

        <ResultOverlay />
      </main>
    </ErrorBoundary>
  );
}
