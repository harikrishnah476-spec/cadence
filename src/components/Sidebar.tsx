'use client';

import React from 'react';
import { useUIStore, ViewState } from '@/store/useUIStore';
import { Activity, Keyboard, BarChart2, Settings, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS: { id: ViewState; label: string; icon: any }[] = [
  { id: 'practice', label: 'Practice', icon: Keyboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { currentView, setView } = useUIStore();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-white/5 bg-[#050505] flex flex-col z-40 hidden md:flex">
      <div className="p-6 pt-12 flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
          <Activity className="text-cyan-400" size={18} />
        </div>
        <h1 className="text-sm font-black tracking-[0.2em] text-white/90 uppercase">Cadence</h1>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                isActive 
                  ? "bg-white/10 text-white shadow-lg shadow-black/20" 
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <item.icon size={16} className={isActive ? "text-cyan-400" : ""} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
        v1.1.0 // Cadence
      </div>
    </aside>
  );
};
