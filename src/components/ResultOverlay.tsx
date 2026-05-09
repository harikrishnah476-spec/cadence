'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTypingStore } from '@/store/useTypingStore';
import { useUserStore } from '@/store/useUserStore';
import { CheckCircle2, Share2, RotateCcw, ArrowRight, Home } from 'lucide-react';
import { analytics } from '@/lib/Analytics';

export const ResultOverlay: React.FC = () => {
  const { isCompleted, wpm, accuracy, generateText, currentEnvironment, retry, reset } = useTypingStore();
  const { onboardingPhase } = useUserStore();
  const [copied, setCopied] = useState(false);

  if (!isCompleted) return null;

  const isCalibrating = onboardingPhase === 'calibration';

  const copySummary = () => {
    const text = `Cadence // ${currentEnvironment}\n${wpm} WPM // ${accuracy}% Accuracy`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    analytics.track('milestone_reached', { type: 'share_clicked' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl text-center space-y-12"
      >
        <header className="space-y-4">
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">
            {isCalibrating ? "Baseline Established" : `Session Complete // ${currentEnvironment}`}
          </h2>
          
          <div className="flex justify-center items-baseline gap-8">
            <div>
              <div className="text-8xl font-black tracking-tighter text-white">{wpm}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">Words per Minute</div>
            </div>
            <div>
              <div className="text-8xl font-black tracking-tighter text-white/40">{accuracy}<span className="text-5xl">%</span></div>
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2">Accuracy</div>
            </div>
          </div>
        </header>

        <footer className="pt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={reset}
              className="p-4 text-white/30 hover:text-white transition-colors"
              title="Menu"
            >
              <Home size={20} />
            </button>
            <button 
              onClick={retry}
              className="flex items-center gap-2 px-8 py-4 bg-white/5 text-white/80 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-all active:scale-95"
            >
              <RotateCcw size={16} /> Retry
            </button>
            <button 
              onClick={() => generateText(25)}
              className="flex items-center gap-2 px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Continue <ArrowRight size={16} />
            </button>
            <button 
              onClick={copySummary}
              className="p-4 text-white/30 hover:text-white transition-colors"
              title="Copy Summary"
            >
              {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Share2 size={20} />}
            </button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
};

