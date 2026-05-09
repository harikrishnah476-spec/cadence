'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingStore } from '@/store/useTypingStore';
import { performanceAnalyzer, PerformanceInsights } from '@/core/PerformanceAnalyzer';
import { useCoachingStore } from '@/store/useCoachingStore';
import { useUserStore } from '@/store/useUserStore';
import { Target, Zap, Activity, TrendingDown, Clock, MessageSquare, AlertCircle, ArrowRight, BarChart2, Globe, HelpCircle, Share2, CheckCircle2, Heart, Smile, Frown, RotateCcw, Home } from 'lucide-react';
import { analytics } from '@/lib/Analytics';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ResultOverlay: React.FC = () => {
  const { isCompleted, wpm, accuracy, generateText, currentEnvironment, retry, reset } = useTypingStore();
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const { profile, getRecommendations } = useCoachingStore();
  const { onboardingPhase, sessions } = useUserStore();
  const [copied, setCopied] = useState(false);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const recommendations = getRecommendations();

  useEffect(() => {
    if (isCompleted) {
      setInsights(performanceAnalyzer.getInsights());
    }
  }, [isCompleted]);

  if (!isCompleted || !insights) return null;

  const isCalibrating = onboardingPhase === 'calibration';
  const initial = profile.baselines.initial;
  const wpmDelta = initial ? wpm - initial.wpm : 0;

  const copySummary = () => {
    const text = `Cadence // ${currentEnvironment}\n${wpm} WPM // ${accuracy}% Accuracy\nPerformance Growth: ${wpmDelta > 0 ? '+' : ''}${wpmDelta} WPM since baseline.\nMaster your rhythm at Cadence.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    analytics.track('milestone_reached', { type: 'share_clicked' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSentiment = (val: string) => {
    setSentiment(val);
    analytics.track('milestone_reached', { type: 'sentiment_captured', value: val });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-[#0a0a0a] border border-white/5 rounded-2xl p-10 space-y-10 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <header className="flex justify-between items-start border-b border-white/5 pb-8">
          <div>
            <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-1">
              {isCalibrating ? "Cadence Alignment" : `Practical Validation // ${currentEnvironment}`}
            </h2>
            <h1 className="text-3xl font-black tracking-tight text-white/90 uppercase">
              {isCalibrating ? "Establishing Your Baseline" : "Training Progress"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={copySummary}
              className="p-3 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white/80 transition-colors"
              title="Copy Summary"
            >
              {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Share2 size={20} />}
            </button>
            <div className="flex gap-3">
              <StatPill label="WPM" value={wpm} />
              <StatPill label="ACC" value={`${accuracy}%`} />
            </div>
          </div>
        </header>

        {/* Milestone Card (Emotional Reinforcement) */}
        {sessions === 3 && isCalibrating && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-8 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              <Trophy size={24} className="text-black" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">Cadence Aligned</h3>
              <p className="text-xs text-white/40 max-w-md mx-auto">
                Your rhythmic profile is now synchronized. Professional environments and detailed growth tracking have been unlocked.
              </p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Progress Evidence */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
              <BarChart2 size={12} /> Performance Growth
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DeltaCard label="Current Speed" value={wpm} unit="WPM" />
              <DeltaCard 
                label="Baseline Gap" 
                value={`${wpmDelta > 0 ? '+' : ''}${wpmDelta}`} 
                unit="WPM" 
                status={wpmDelta >= 0 ? 'success' : 'error'} 
              />
            </div>
          </section>

          {/* Behavioral Sentiment Loop */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={12} /> Emotional Sync
            </h3>
            <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
              <div className="text-xs text-white/40 font-medium">How did this session feel?</div>
              <div className="flex gap-2">
                <SentimentButton icon={<Frown size={18} />} active={sentiment === 'bad'} onClick={() => handleSentiment('bad')} />
                <SentimentButton icon={<Smile size={18} />} active={sentiment === 'good'} onClick={() => handleSentiment('good')} />
                <SentimentButton icon={<Heart size={18} />} active={sentiment === 'flow'} onClick={() => handleSentiment('flow')} />
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard 
            icon={<Activity size={18} />} 
            label="Rhythm" 
            value={insights.rhythmStability < 0.2 ? "Smooth" : "Uneven"} 
            desc="Predictability of your keystrokes."
            status={insights.rhythmStability < 0.2 ? 'success' : 'warning'}
          />
          <InsightCard 
            icon={<TrendingDown size={18} />} 
            label="Stamina" 
            value={insights.fatigueIndex > 10 ? "Tired" : "Steady"} 
            desc="How well you maintain speed."
            status={insights.fatigueIndex > 10 ? 'error' : 'success'}
          />
          <InsightCard 
            icon={<Zap size={18} />} 
            label="Focus" 
            value={`${accuracy}%`} 
            desc="Overall typing precision."
            status={accuracy > 95 ? 'success' : 'warning'}
          />
        </div>

        <footer className="pt-8 flex justify-between items-center border-t border-white/5">
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 text-white/40 font-bold uppercase text-xs tracking-widest rounded-xl hover:text-white hover:bg-white/10 transition-all active:scale-[0.98]"
            title="Return to Menu"
          >
            <Home size={18} /> Menu
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={retry}
              className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white/80 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw size={18} /> Retry
            </button>
            <button 
              onClick={() => generateText(25)}
              className="flex items-center gap-2 px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5"
            >
              Next Challenge <ArrowRight size={18} />
            </button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
};

const SentimentButton = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
      active ? "bg-white text-black scale-110 shadow-lg" : "bg-white/5 text-white/20 hover:text-white/40 hover:bg-white/10"
    )}
  >
    {icon}
  </button>
);

const StatPill = ({ label, value }: { label: string, value: string | number }) => (
  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex flex-col items-center min-w-[80px]">
    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
    <span className="text-lg font-black text-white/90">{value}</span>
  </div>
);

const DeltaCard = ({ label, value, unit, status }: { label: string; value: string | number; unit: string; status?: 'success' | 'error' }) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
    <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">{label}</div>
    <div className={cn("text-xl font-black", !status ? "text-white/80" : status === 'success' ? "text-green-400" : "text-red-400")}>
      {value}<span className="text-[10px] ml-1 opacity-40 font-bold">{unit}</span>
    </div>
  </div>
);

const InsightCard = ({ icon, label, value, desc, status }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  desc: string,
  status: 'success' | 'warning' | 'error'
}) => (
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
    <div className="flex items-center gap-2 text-white/30">
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end gap-2">
      <span className={`text-xl font-black ${
        status === 'success' ? 'text-green-400' : 
        status === 'warning' ? 'text-orange-400' : 'text-red-400'
      }`}>{value}</span>
    </div>
    <p className="text-[10px] text-white/20 leading-relaxed">{desc}</p>
  </div>
);

const Trophy = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
