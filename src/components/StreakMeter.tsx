'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingStore } from '@/store/useTypingStore';
import { Zap, Flame } from 'lucide-react';

export const StreakMeter: React.FC = () => {
  const { streak, combo, momentum } = useTypingStore();

  if (streak < 5) return null;

  return (
    <div className="absolute -top-16 left-0 right-0 flex justify-center pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-4 px-6 py-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: streak % 10 === 0 ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.2 }}
          >
            {streak > 30 ? (
              <Flame className="text-orange-500 fill-orange-500" size={20} />
            ) : (
              <Zap className="text-cyan-400 fill-cyan-400" size={20} />
            )}
          </motion.div>
          <span className="text-xl font-black italic tracking-tighter">
            {streak} <span className="text-xs text-white/40 not-italic ml-1">STREAK</span>
          </span>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Combo</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={combo}
              initial={{ scale: 1.5, color: '#fff' }}
              animate={{ scale: 1, color: combo > 1 ? '#22d3ee' : '#fff' }}
              className="text-xl font-black italic"
            >
              {combo.toFixed(1)}x
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Momentum Bar */}
        <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            animate={{ width: `${momentum * 100}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
};
