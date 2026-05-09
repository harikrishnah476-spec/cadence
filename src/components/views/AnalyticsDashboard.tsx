'use client';

import React from 'react';
import { useCoachingStore } from '@/store/useCoachingStore';
import { useUserStore } from '@/store/useUserStore';
import { Activity, TrendingUp, AlertCircle, Zap, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';

export const AnalyticsDashboard: React.FC = () => {
  const { profile, history, getRecommendations } = useCoachingStore();
  const { bestWpm, sessions } = useUserStore();
  
  const recommendations = getRecommendations();
  const recentHistory = history.slice(-20);
  
  const avgWpm = recentHistory.length > 0 
    ? Math.round(recentHistory.reduce((acc, curr) => acc + curr.wpm, 0) / recentHistory.length)
    : 0;

  const maxHistoryWpm = Math.max(...recentHistory.map(h => h.wpm), 50); // Min scale of 50

  return (
    <div className="w-full max-w-5xl mx-auto pt-8 pb-32 space-y-12">
      <header>
        <h2 className="text-3xl font-black tracking-tight text-white/90">Performance Analytics</h2>
        <p className="text-xs text-white/40 mt-2">Longitudinal analysis of your rhythmic progression.</p>
      </header>

      {/* Top Level Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp />} label="Peak Velocity" value={`${bestWpm} WPM`} />
        <StatCard icon={<Activity />} label="Avg Velocity (Recent)" value={`${avgWpm} WPM`} />
        <StatCard icon={<Crosshair />} label="Fatigue Resistance" value={`${Math.round(profile.fatigueResistance)}%`} />
        <StatCard icon={<Zap />} label="Sessions Completed" value={sessions.toString()} />
      </div>

      {/* Velocity Trend Chart (Lightweight SVG) */}
      <section className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Velocity Trend (Last 20 Sessions)</h3>
        </div>
        
        {recentHistory.length >= 2 ? (
          <div className="relative h-48 w-full flex items-end justify-between gap-1 mt-4">
            {recentHistory.map((session, i) => {
              const heightPct = (session.wpm / maxHistoryWpm) * 100;
              return (
                <div key={i} className="relative flex-1 group flex justify-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    className="w-full max-w-[12px] bg-cyan-500/20 rounded-t-sm group-hover:bg-cyan-400 transition-colors"
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap z-10 pointer-events-none">
                    {session.wpm} WPM | {session.accuracy}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-white/20 text-xs border border-dashed border-white/10 rounded-xl">
            Not enough session data to plot trends.
          </div>
        )}
      </section>

      {/* Adaptive Coaching Insights */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">System Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.length > 0 ? recommendations.map((rec, i) => (
            <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-xl flex gap-4 items-start">
              <div className={`p-2 rounded-lg ${rec.priority === 'high' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                {rec.priority === 'high' ? <AlertCircle size={16} /> : <Activity size={16} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white/80 mb-1">{rec.type}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{rec.message}</p>
              </div>
            </div>
          )) : (
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white/40">
              No active behavioral interventions required. Your cadence is stable.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
    <div className="text-white/20 [&>svg]:w-5 [&>svg]:h-5">{icon}</div>
    <div>
      <div className="text-2xl font-black text-white/90">{value}</div>
      <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">{label}</div>
    </div>
  </div>
);
