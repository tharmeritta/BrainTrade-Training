'use client';

import React, { useRef } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import type { CourseModule, CourseLang } from '@/lib/courses';
import { TRANSITION } from '@/lib/animations';
import type { UserRole } from '@/types';

import DrawingCanvas from '../DrawingCanvas';
import { usePresentation } from './usePresentation';
import { PresentationHeader } from './PresentationHeader';
import { PresentationControls } from './PresentationControls';
import { TrainerToolbar } from './TrainerToolbar';

interface PresentationViewerProps {
  module: CourseModule;
  locale: string;
  initialLang: CourseLang;
  user?: { uid: string; name: string; role: UserRole } | null;
  minimal?: boolean;
  embedded?: boolean;
  showLangToggle?: boolean;
}

export default function PresentationViewer({ 
  module, locale, initialLang, user,
  minimal = false,
  embedded = false,
}: PresentationViewerProps) {
  const t = useTranslations('presentation');
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement>(null);

  const {
    lang, handleLangChange,
    slide, goToSlide,
    viewedSlides, isModuleComplete,
    isLoaded, setIsLoaded, loadError, setLoadError,
    isFullscreen, toggleFullscreen,
    agentName,
    isPreloading, preloadingProgress,
    containerRef, handleTouchStart, handleTouchEnd,
    slideImageUrl, progress,
    total, hasContent,
    activeTool, setActiveTool,
    isTrainer,
    markAsComplete, isSaving,
    session, startLive, stopLive, updateLaser, addDrawingPath, clearDrawings, isLive, isControlledByOthers
  } = usePresentation(module, user, initialLang, locale);

  const title = lang === 'th' ? module.titleTh : module.title;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col overflow-hidden text-foreground ${embedded ? 'bg-transparent' : 'bg-muted/20 dark:bg-black/20'}`}
      style={{ height: embedded ? '100%' : 'calc(100dvh - 72px)' }}
    >
      {/* -- Main content area -- */}
      <main
        className={`relative flex flex-1 min-h-0 items-center gap-2 sm:gap-3 ${embedded ? 'p-0' : 'px-3 pb-3 pt-3 sm:px-4 sm:pb-4'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!minimal && (
          <PresentationHeader 
            t={t} locale={locale} router={router} title={title}
            isControlledByOthers={isControlledByOthers} session={session}
            user={user} agentName={agentName} lang={lang} onLangChange={handleLangChange}
          />
        )}

        {/* -- Left Navigation -- */}
        <button
          disabled={!hasContent || slide === 1 || isControlledByOthers}
          onClick={() => goToSlide(slide - 1)}
          className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/90 shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/5 sm:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>

        {/* -- Trainer Controls -- */}
        {isTrainer && (
          <TrainerToolbar 
            isLive={isLive} activeTool={activeTool} setActiveTool={setActiveTool}
            clearDrawings={clearDrawings} startLive={startLive} stopLive={stopLive}
            slide={slide} lang={lang}
          />
        )}

        {/* -- Center: slide + overlays -- */}
        <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center sm:self-stretch">
          <motion.div
            ref={frameRef}
            className="relative aspect-video w-full max-w-full overflow-hidden rounded-xl border border-border/40 bg-black shadow-2xl sm:w-auto sm:h-full sm:rounded-3xl"
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={TRANSITION.base}
          >
            {/* Empty State */}
            {!hasContent && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-muted/20 backdrop-blur-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
                  <BookOpen className="opacity-20" size={32} />
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-bold opacity-80">No Slides Available</p>
                  <p className="text-[10px] font-medium opacity-50 mt-1 max-w-[200px]">The presentation content is currently being updated or has not been uploaded yet.</p>
                </div>
              </div>
            )}

            {/* Loading / Error States */}
            <AnimatePresence mode="wait">
              {hasContent && loadError ? (
                <motion.div
                  key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/40 backdrop-blur-md"
                >
                  <AlertCircle className="text-destructive" size={36} />
                  <p className="text-sm font-bold text-destructive">{t('loadError')}</p>
                  <button
                    onClick={() => { setLoadError(false); setIsLoaded(false); }}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-all active:scale-95"
                  >
                    <RefreshCw size={14} /> {t('retry')}
                  </button>
                </motion.div>
              ) : hasContent && !isLoaded ? (
                <motion.div
                  key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md"
                >
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <div className="absolute inset-0 animate-pulse rounded-full border-4 border-primary/20" />
                  </div>
                  {isPreloading && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">{t('preloading')}</p>
                      <div className="h-1 w-32 overflow-hidden rounded-full bg-primary/10">
                        <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${preloadingProgress}%` }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Completion Badge */}
            <AnimatePresence>
              {hasContent && isModuleComplete && isLoaded && (
                <motion.div
                  key="complete" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                  className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2"
                >
                  <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 shadow-xl backdrop-blur-md">
                    <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{t('moduleComplete')}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slide Content */}
            {hasContent && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideImageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="relative h-full w-full"
                >
                  <DrawingCanvas 
                    isTrainer={!!isTrainer} isActive={isLive || isControlledByOthers}
                    mode={activeTool} drawings={session?.drawings || []} laserPos={session?.laserPos || null}
                    onDrawEnd={addDrawingPath} onLaserMove={updateLaser}
                  />
                  <NextImage
                    src={slideImageUrl} fill className="object-contain" alt={`Slide ${slide}`} priority
                    onLoad={() => { setIsLoaded(true); setLoadError(false); }}
                    onError={() => setLoadError(true)}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* -- Right Navigation -- */}
        <button
          disabled={!hasContent || slide === total || isControlledByOthers}
          onClick={() => goToSlide(slide + 1)}
          className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-20 sm:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>
      </main>

      {/* -- Bottom Strip -- */}
      <PresentationControls 
        t={t} progress={progress} slide={slide} total={total} hasContent={hasContent}
        isTrainer={isTrainer} viewedCount={viewedSlides.size} isModuleComplete={isModuleComplete}
        toggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen}
        markAsComplete={markAsComplete} isSaving={isSaving}
      />
    </div>
  );
}
