'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useTypingStore } from '@/store/useTypingStore';
import { useSettingsStore } from '@/store/useSettingsStore';
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
  const { fontSize, animationIntensity } = useSettingsStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();
  const [isFocused, ReactSetIsFocused] = React.useState(true);

  const isUnstable = prediction?.instabilityRisk || prediction?.consistencyWarning;
  const isFocusLocked = streak > 40 && !isUnstable; // Magic Moment Trigger

  useEffect(() => {
    if (!text) generateText(20);
    inputRef.current?.focus();
  }, [text, generateText]);

  useEffect(() => {
    if (errors.length > 0 && animationIntensity !== 'none') {
      const shakeConfig = animationIntensity === 'full' 
        ? { x: [0, -2, 2, -2, 2, 0], duration: 0.1 }
        : { x: [0, -1, 1, 0], duration: 0.05 };

      controls.start({
        x: shakeConfig.x,
        transition: { duration: shakeConfig.duration }
      });
    }
  }, [errors.length, controls, animationIntensity]);

  return (
    <motion.div 
      animate={controls}
      className={cn(
        "relative w-full max-w-4xl py-16 cursor-text transition-all duration-1000",
        isFocused ? "opacity-100" : "opacity-30 grayscale",
        isUnstable && "opacity-80",
        isFocusLocked && "drop-shadow-[0_0_15px_rgba(34,211,238,0.15)]"
      )}
      onClick={() => inputRef.current?.focus()}
    >

      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 cursor-default"
        value={userInput}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => ReactSetIsFocused(true)}
        onBlur={() => ReactSetIsFocused(false)}
        autoFocus
        spellCheck={false}
      />

      <div className={cn(
        "flex flex-wrap gap-x-[0.25em] font-mono leading-loose tracking-tight select-none",
        fontSize === 'small' ? 'text-2xl' : fontSize === 'large' ? 'text-5xl' : 'text-4xl'
      )}>
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-[10px] font-bold uppercase tracking-widest"
          >
            Click anywhere to resume
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
