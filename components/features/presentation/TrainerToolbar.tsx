'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Zap, Trash2, Play, Square } from 'lucide-react';
import type { CourseLang } from '@/lib/courses';

interface TrainerToolbarProps {
  isLive: boolean;
  activeTool: 'pen' | 'laser' | null;
  setActiveTool: (tool: 'pen' | 'laser' | null) => void;
  clearDrawings: () => void;
  startLive: (slide: number, lang: CourseLang) => void;
  stopLive: () => void;
  slide: number;
  lang: CourseLang;
}

export function TrainerToolbar({
  isLive, activeTool, setActiveTool, clearDrawings,
  startLive, stopLive, slide, lang
}: TrainerToolbarProps) {
  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                activeTool === 'pen' ? 'bg-primary text-white' : 'text-white hover:bg-white/10'
              }`}
              title="Pen Tool"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'laser' ? null : 'laser')}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                activeTool === 'laser' ? 'bg-red-500 text-white' : 'text-white hover:bg-white/10'
              }`}
              title="Laser Pointer"
            >
              <Zap size={18} />
            </button>
            <button
              onClick={() => { clearDrawings(); setActiveTool(null); }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10"
              title="Clear All"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (isLive) {
            stopLive();
            setActiveTool(null);
          } else {
            startLive(slide, lang);
          }
        }}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all active:scale-95 ${
          isLive ? 'bg-red-500 text-white' : 'bg-primary text-white'
        }`}
        title={isLive ? 'Stop Live' : 'Go Live'}
      >
        {isLive ? <Square size={20} /> : <Play size={20} />}
      </button>
    </div>
  );
}
