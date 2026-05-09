'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useTypingStore } from '@/store/useTypingStore';
import { Target } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Character = React.memo(({ char, state, isCurrent, momentum }: { 
  char: string; 
  state: 'untyped' | 'calibrated' | 'misaligned'; 
  isCurrent: boolean;
  momentum: number;
}) => {
  return (
    <span
      className={cn(
        "relative transition-all duration-150 ease-out",
        state === 'untyped' && "text-white/10",
        state === 'calibrated' && "text-white/90",
        state === 'misaligned' && "text-red-500 bg-red-500/20 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.2)]",
        isCurrent && "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-400 after:shadow-[0_0_8px_rgba(34,211,238,0.8)]"
      )}
      style={{
        textShadow: state === 'calibrated' ? `0 0 ${momentum * 8}px rgba(255, 255, 255, ${momentum * 0.2})` : 'none',
        filter: state === 'calibrated' ? `brightness(${1 + momentum * 0.1})` : 'none',
      }}
    >
      {char}
    </span>
  );
});

Character.displayName = 'Character';

export const TypingArea: React.FC = () => {
  const { text, userInput, errors, isCompleted, handleInput, generateText, momentum, prediction, streak } = useTypingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const [isFocused, setIsFocused] = React.useState(true);

  const isUnstable = prediction?.instabilityRisk || prediction?.consistencyWarning;
  const isFocusLocked = streak > 40 && !isUnstable; // Magic Moment Trigger

  useEffect(() => {
    if (!text) generateText(20);
    inputRef.current?.focus();
  }, [text, generateText]);

  useEffect(() => {
    if (errors.length > 0) {
      controls.start({
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.1 }
      });
    }
  }, [errors.length, controls]);

  return (
    <motion.div 
      animate={controls}
      className={cn(
        "relative w-full max-w-4xl p-16 bg-white/[0.02] border border-white/5 rounded-2xl cursor-text transition-all duration-1000",
        isFocused ? "border-white/10" : "opacity-30 grayscale",
        isUnstable && "border-red-500/20 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]",
        isFocusLocked && "border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.05)]"
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence>
        {isUnstable && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2 pointer-events-none"
          >
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Rhythm Instability Detected // Slow Down</span>
          </motion.div>
        )}
        {isFocusLocked && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center gap-2 pointer-events-none"
          >
            <Target size={10} className="text-cyan-400 animate-spin-slow" />
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Focus Locked // Peak Rhythm</span>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 cursor-default"
        value={userInput}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-x-[0.25em] font-mono text-4xl leading-loose tracking-tight select-none">
        {text.split('').map((char, index) => {
          let state: 'untyped' | 'calibrated' | 'misaligned' = 'untyped';
          if (index < userInput.length) {
            state = errors.includes(index) ? 'misaligned' : 'calibrated';
          }
          const isCurrent = index === userInput.length;

          return (
            <Character 
              key={index} 
              char={char} 
              state={state} 
              isCurrent={isCurrent} 
              momentum={momentum} 
            />
          );
        })}
      </div>

      {!isFocused && !isCompleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-2xl pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded"
          >
            Click or Press Any Key to Resume
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
