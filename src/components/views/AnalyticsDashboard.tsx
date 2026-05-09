'use client';

import React from 'react';
import { useCoachingStore } from '@/store/useCoachingStore';
import { useUserStore } from '@/store/useUserStore';
import { motion } from 'framer-motion';

export const AnalyticsDashboard: React.FC = () => {
  const { history, getRecommendations } = useCoachingStore();
  const { bestWpm, sessions } = useUserStore();
  
  const recommendations = getRecommendations();
  const recentHistory = history.slice(-30);
  
  const maxHistoryWpm = Math.max(...recentHistory.map(h => h.wpm), 50);

  return (
    <div className="w-full max-w-4xl mx-auto pt-16 pb-32 space-y-16">
      <header className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-1">Longitudinal Analysis</h2>
          <h1 className="text-3xl font-black tracking-tight text-white/90">Performance Trend</h1>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Peak Velocity</div>
            <div className="text-2xl font-black text-white">{bestWpm} <span className="text-[10px] opacity-40">WPM</span></div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Sessions</div>
            <div className="text-2xl font-black text-white">{sessions}</div>
          </div>
        </div>
      </header>

      {/* Velocity Trend Chart (Lightweight SVG) */}
      <section className="space-y-6">
        {recentHistory.length >= 2 ? (
          <div className="relative h-64 w-full flex items-end justify-between gap-1">
            {recentHistory.map((session, i) => {
              const heightPct = (session.wpm / maxHistoryWpm) * 100;
              return (
                <div key={i} className="relative flex-1 group flex justify-center h-full items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    className="w-full max-w-[8px] bg-white/10 rounded-t-sm group-hover:bg-white/40 transition-colors"
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap z-10 pointer-events-none shadow-xl">
                    {session.wpm} WPM <span className="text-white/40 ml-2">{session.accuracy}% ACC</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-white/20 text-xs font-mono border border-dashed border-white/5 rounded-xl">
            Insufficient session data for trend analysis.
          </div>
        )}
      </section>

      {/* Minimalist System Insights */}
      {recommendations.length > 0 && (
        <section className="pt-8 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-4">System Guidance</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <p key={i} className={`text-sm ${rec.priority === 'high' ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                <span className="opacity-50 mr-2">—</span> {rec.message}
              </p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

