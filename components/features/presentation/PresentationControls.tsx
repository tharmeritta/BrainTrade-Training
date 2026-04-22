'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Maximize2, Minimize2 } from 'lucide-react';

interface PresentationControlsProps {
  t: (key: string) => string;
  progress: number;
  slide: number;
  total: number;
  hasContent: boolean;
  isTrainer: boolean;
  viewedCount: number;
  isModuleComplete: boolean;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function PresentationControls({
  t, progress, slide, total, hasContent,
  isTrainer, viewedCount, isModuleComplete,
  toggleFullscreen, isFullscreen
}: PresentationControlsProps) {
  return (
    <div className="relative z-10 shrink-0">
      {/* Progress bar */}
      <div className="h-0.5 overflow-hidden bg-black/8 dark:bg-white/8">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-border/50 bg-background/80 px-4 py-2 backdrop-blur-xl sm:px-5">
        {/* Slide counter + progress info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black tabular-nums text-sm">{hasContent ? slide : 0} / {hasContent ? total : 0}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('slide')}
            </span>
          </div>

          {/* Viewed progress (for agents) */}
          {!isTrainer && (
            <div className="flex items-center gap-2 border-l border-border/50 pl-4">
              <span className={`font-black tabular-nums text-sm ${isModuleComplete ? 'text-emerald-500' : ''}`}>
                {viewedCount} / {total}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('viewed')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1 text-[10px] font-bold text-muted-foreground opacity-50 sm:flex dark:bg-white/5">
            <Keyboard size={11} />
            <span>{t('arrowsNavigate')}</span>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
