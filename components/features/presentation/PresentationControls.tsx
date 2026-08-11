'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Maximize2, Minimize2, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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
  markAsComplete?: () => void;
  isSaving?: boolean;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  isControlledByOthers?: boolean;
}

export function PresentationControls({
  t, progress, slide, total, hasContent,
  isTrainer, viewedCount, isModuleComplete,
  toggleFullscreen, isFullscreen,
  markAsComplete, isSaving,
  onPrevSlide, onNextSlide, isControlledByOthers = false
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

      <div className="flex items-center justify-between border-t border-border/50 bg-background/80 px-3 py-2.5 backdrop-blur-xl sm:px-5 pb-[max(0.625rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] gap-2">
        {/* Slide counter + progress info + Mobile Nav */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Prev Button */}
          {onPrevSlide && (
            <button
              disabled={!hasContent || slide <= 1 || isControlledByOthers}
              onClick={onPrevSlide}
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background/90 text-foreground shadow-sm transition-all active:scale-95 disabled:opacity-20 hover:bg-muted sm:hidden"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-black tabular-nums text-sm">{hasContent ? slide : 0} / {hasContent ? total : 0}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('slide')}
            </span>
          </div>

          {/* Mobile Next Button */}
          {onNextSlide && (
            <button
              disabled={!hasContent || slide >= total || isControlledByOthers}
              onClick={onNextSlide}
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all active:scale-95 disabled:opacity-20 sm:hidden"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Viewed progress (for agents) */}
          {!isTrainer && (
            <div className="hidden xs:flex items-center gap-2 border-l border-border/50 pl-2.5 sm:pl-4">
              <span className={`font-black tabular-nums text-sm ${isModuleComplete ? 'text-emerald-500' : ''}`}>
                {viewedCount} / {total}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('viewed')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Manual Complete Button */}
          {!isTrainer && !isModuleComplete && markAsComplete && (
            <button
              onClick={markAsComplete}
              disabled={isSaving}
              className="flex min-h-[44px] sm:min-h-[36px] items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 hover:bg-emerald-600"
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span className="truncate">{t('markComplete') || 'Complete'}</span>
            </button>
          )}

          <div className="hidden items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1 text-[10px] font-bold text-muted-foreground opacity-50 sm:flex dark:bg-white/5">
            <Keyboard size={11} />
            <span>{t('arrowsNavigate')}</span>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="flex h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-[36px] sm:min-w-[36px] shrink-0 items-center justify-center rounded-xl border border-border/50 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
