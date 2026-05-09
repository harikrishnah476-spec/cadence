'use client';

import React from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Volume2, VolumeX, Type, Zap } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { soundEnabled, fontSize, animationIntensity, toggleSound, setFontSize, setAnimationIntensity } = useSettingsStore();

  return (
    <div className="w-full max-w-3xl mx-auto pt-8 pb-32 space-y-12">
      <header>
        <h2 className="text-3xl font-black tracking-tight text-white/90">Settings</h2>
        <p className="text-xs text-white/40 mt-2">Customize your training environment.</p>
      </header>

      <div className="space-y-6">
        {/* Audio Preferences */}
        <section className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white/80">Audio Feedback</h3>
              <p className="text-[10px] text-white/40 mt-1">Mechanical keystroke sounds and milestone cues.</p>
            </div>
            <button 
              onClick={toggleSound}
              className={`p-3 rounded-xl transition-all ${soundEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/20'}`}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </section>

        {/* Interface Preferences */}
        <section className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-8">
          {/* Font Size */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white/80 flex items-center gap-2"><Type size={16} /> Typography Scale</h3>
              <p className="text-[10px] text-white/40 mt-1">Adjust the size of the typing interface text.</p>
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                    fontSize === size ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5 w-full" />

          {/* Animation Intensity */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white/80 flex items-center gap-2"><Zap size={16} /> Animation Intensity</h3>
              <p className="text-[10px] text-white/40 mt-1">Control visual feedback, screen shake, and caret motion.</p>
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
              {(['full', 'reduced', 'none'] as const).map(intensity => (
                <button
                  key={intensity}
                  onClick={() => setAnimationIntensity(intensity)}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${
                    animationIntensity === intensity ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
