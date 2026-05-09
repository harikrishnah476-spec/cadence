'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PracticeView } from '@/components/views/PracticeView';
import { AnalyticsDashboard } from '@/components/views/AnalyticsDashboard';
import { SettingsView } from '@/components/views/SettingsView';
import { ResultOverlay } from '@/components/ResultOverlay';
import { UserBadge } from '@/components/UserBadge';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useUIStore } from '@/store/useUIStore';
import { Info } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { currentView } = useUIStore();
  const { onboardingPhase } = useUserStore();
  const isCalibrating = onboardingPhase === 'calibration';

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 overflow-hidden relative flex">
        {/* Background Noise */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
        </div>

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 relative z-10 flex flex-col min-h-screen h-screen overflow-y-auto">
          {/* Topbar (Mobile support + UserBadge) */}
          <header className="w-full px-8 py-6 flex justify-end items-center sticky top-0 z-30">
            <UserBadge />
          </header>

          {/* Dynamic Views */}
          <div className="flex-1 px-8 relative">
            <AnimatePresence mode="wait">
              {currentView === 'practice' && (
                <motion.div 
                  key="practice"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PracticeView />
                </motion.div>
              )}
              {currentView === 'analytics' && (
                <motion.div 
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnalyticsDashboard />
                </motion.div>
              )}
              {currentView === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <SettingsView />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Global Footer */}
          <footer className="w-full px-8 py-6 flex justify-between items-center text-[9px] font-bold text-white/10 uppercase tracking-[0.4em] sticky bottom-0 z-20">
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

        {/* Global Overlays */}
        <ResultOverlay />
      </main>
    </ErrorBoundary>
  );
}
