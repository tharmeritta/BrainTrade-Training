/* eslint-disable @next/next/no-img-element */
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
  Trophy,
  Sparkles,
} from 'lucide-react';

import type { CourseModule, CourseLang } from '@/lib/courses';
import { TRANSITION } from '@/lib/animations';
import type { UserRole } from '@/types';

import DrawingCanvas from '../DrawingCanvas';
import { usePresentation } from './usePresentation';
import { PresentationHeader } from './PresentationHeader';
import { PresentationControls } from './PresentationControls';
import { TrainerToolbar } from './TrainerToolbar';
import { PresenterViewModal } from './PresenterViewModal';

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
  const [showCompletionModal, setShowCompletionModal] = React.useState(false);
  const [isPresenterViewOpen, setIsPresenterViewOpen] = React.useState(false);
  const promptedRef = useRef(false);

  const {
    lang, handleLangChange,
    slide, goToSlide,
    viewedSlides, isModuleComplete,
    isLoaded, setIsLoaded, loadError, setLoadError,
    isFullscreen, toggleFullscreen,
    agentName,
    isPreloading, preloadingProgress,
    containerRef, handleTouchStart, handleTouchEnd,
    slideImageUrl, nextSlideImageUrl, progress,
    total, hasContent,
    activeTool, setActiveTool,
    isTrainer,
    markAsComplete, isSaving,
    dragOffset, isSwiping,
    session, startLive, stopLive, updateLaser, addDrawingPath, clearDrawings, isLive, isControlledByOthers
  } = usePresentation(module, user, initialLang, locale);

  const title = lang === 'th' ? module.titleTh : module.title;

  // Automatically trigger completion confirmation modal when reaching final slide & all slides viewed
  React.useEffect(() => {
    if (!isTrainer && hasContent && isLoaded && (slide === total || isModuleComplete) && !promptedRef.current) {
      promptedRef.current = true;
      setShowCompletionModal(true);
    }
  }, [slide, total, isModuleComplete, isTrainer, hasContent, isLoaded]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col overflow-hidden text-foreground ${embedded ? 'bg-transparent' : 'bg-muted/20 dark:bg-black/20'}`}
      style={{ height: embedded ? '100%' : 'calc(100dvh - 3.5rem)' }}
    >
      {/* -- Presenter View Modal (macOS Dual Screen Presenter) -- */}
      {isTrainer && (
        <PresenterViewModal
          isOpen={isPresenterViewOpen}
          onClose={() => setIsPresenterViewOpen(false)}
          module={module}
          slide={slide}
          total={total}
          lang={lang}
          slideImageUrl={slideImageUrl}
          nextSlideImageUrl={nextSlideImageUrl}
          goToSlide={goToSlide}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          clearDrawings={clearDrawings}
          isLive={isLive}
          startLive={startLive}
          stopLive={stopLive}
          session={session}
          addDrawingPath={addDrawingPath}
          updateLaser={updateLaser}
        />
      )}

      {/* -- Main content area -- */}
      <main
        className={`relative flex flex-1 flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 ${
          embedded ? 'p-0' : 'px-2 pt-14 pb-2 landscape:pt-12 landscape:pb-1 landscape:px-3 sm:px-4 sm:pt-4 sm:pb-4 min-h-0'
        }`}
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
          className="relative z-10 hidden h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/90 shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/5 sm:flex"
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
            onOpenPresenterMode={() => setIsPresenterViewOpen(true)}
          />
        )}

        {/* -- Center: slide + overlays -- */}
        <div className="flex-1 w-full h-full min-w-0 min-h-0 flex items-center justify-center max-h-[100dvh] max-w-7xl mx-auto">
          <motion.div
            ref={frameRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-video w-full max-w-full max-h-full overflow-hidden rounded-xl border border-border/40 bg-black shadow-2xl landscape:h-full landscape:w-auto sm:rounded-3xl touch-pan-y max-w-6xl max-h-[calc(100dvh-7.5rem)] landscape:max-h-[calc(100dvh-4.5rem)]"
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
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={slideImageUrl}
                  drag={isControlledByOthers || (isTrainer && activeTool) ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_e, info) => {
                    const threshold = 100;
                    const velocityThreshold = 300;
                    const offset = info.offset.x;
                    const velocity = info.velocity.x;

                    if (offset < -threshold || velocity < -velocityThreshold) {
                      if (slide < total) goToSlide(slide + 1);
                    } else if (offset > threshold || velocity > velocityThreshold) {
                      if (slide > 1) goToSlide(slide - 1);
                    }
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: dragOffset }}
                  exit={{ opacity: 0 }}
                  transition={
                    isSwiping
                      ? { type: 'tween', duration: 0.04 }
                      : { type: 'spring', stiffness: 400, damping: 32 }
                  }
                  className={`relative h-full w-full select-none ${
                    isControlledByOthers || (isTrainer && activeTool)
                      ? ''
                      : 'cursor-grab active:cursor-grabbing'
                  }`}
                >
                  <DrawingCanvas 
                    isTrainer={!!isTrainer} isActive={isLive || isControlledByOthers}
                    mode={activeTool} drawings={session?.drawings || []} laserPos={session?.laserPos || null}
                    onDrawEnd={addDrawingPath} onLaserMove={updateLaser}
                  />
                  <img
                    src={slideImageUrl}
                    alt={`Slide ${slide}`}
                    className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
                    onLoad={() => { setIsLoaded(true); setLoadError(false); }}
                    onError={() => setLoadError(true)}
                    draggable={false}
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
          className="relative z-10 hidden h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-20 sm:flex"
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
        markAsComplete={() => setShowCompletionModal(true)} isSaving={isSaving}
        onPrevSlide={() => goToSlide(slide - 1)}
        onNextSlide={() => goToSlide(slide + 1)}
        isControlledByOthers={isControlledByOthers}
      />

      {/* -- Completion Confirmation Pop-up Modal Prompt -- */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden relative max-h-[90dvh] overflow-y-auto"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner relative">
                <Trophy size={32} />
                <Sparkles size={16} className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight text-foreground">
                  {lang === 'th' ? '🎉 สำเร็จการเรียนรู้โมดูลนี้แล้ว!' : '🎉 Course Completed!'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === 'th' 
                    ? `คุณอ่านสไลด์บทเรียนเรื่อง "${title}" ครบถ้วนแล้ว ต้องการบันทึกและยืนยันการเรียนจบหรือไม่?` 
                    : `You have reviewed all slides for "${title}". Would you like to confirm and mark this module as COMPLETED in your progress record?`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await markAsComplete();
                    setShowCompletionModal(false);
                    router.push(`/${locale}/learn`);
                  }}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {lang === 'th' ? 'ยืนยันการเรียนจบโมดูล' : 'Confirm & Mark Completed'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary/80 transition-all shrink-0"
                >
                  {lang === 'th' ? 'ทบทวนสไลด์ต่อ' : 'Keep Reviewing'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
