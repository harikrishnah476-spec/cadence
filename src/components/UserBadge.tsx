'use client';

import React from 'react';
import { useUserStore, getRank } from '@/store/useUserStore';
import { motion } from 'framer-motion';

export const UserBadge: React.FC = () => {
  const { level, totalXp } = useUserStore();
  const rank = getRank(level);
  
  // Calculate progress to next level
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const progress = ((totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Level</span>
          <span className="text-sm font-black text-white">{level}</span>
          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 ${rank.color}`}>
            {rank.name}
          </span>
        </div>
        <div className="mt-1.5 w-24 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
          />
        </div>
      </div>
      
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
        <span className="text-xl font-black text-white">{level}</span>
      </div>
    </div>
  );
};
