'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Keyboard,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import type { CourseModule, CourseLang } from '@/lib/courses';
import { FADE_IN, TRANSITION, EASE } from '@/lib/animations';

// --- Types ---

interface SlideHeaderProps {
  title: string;
  lang: CourseLang;
  onLangChange: (l: CourseLang) => void;
  onBack: () => void;
}

interface SlideControlsProps {
  slide: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  progress: number;
}

// --- Sub-components ---

/**
 * SlideHeader: Title, breadcrumbs and language switcher
 */
function SlideHeader({ title, lang, onLangChange, onBack }: SlideHeaderProps) {
  const t = useTranslations('presentation');
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-10 flex shrink-0 flex-col"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            aria-label={t('back')}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2 opacity-60">
              <BookOpen size={12} />
              <span className="truncate text-[10px] font-bold uppercase tracking-widest">
                {t('productKnowledge')}
              </span>
            </div>
            <h1 className="truncate text-sm font-bold leading-tight sm:text-base">{title}</h1>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex shrink-0 gap-1 rounded-xl border border-black/5 bg-black/5 p-1 dark:border-white/5 dark:bg-white/5">
          {(['th', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLangChange(l)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                lang === l
                  ? 'bg-background text-primary shadow-md shadow-black/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * SlideControls: Navigation and progress bar
 */
function SlideControls({
  slide,
  total,
  onPrev,
  onNext,
  onFullscreen,
  isFullscreen,
  progress,
}: SlideControlsProps) {
  const t = useTranslations('presentation');
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-10 shrink-0"
    >
      {/* Progress bar */}
      <div className="h-1 overflow-hidden bg-black/5 dark:bg-white/5">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6">
        {/* Nav */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            disabled={slide === 1}
            onClick={onPrev}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 transition-all active:scale-95 disabled:opacity-20 hover:bg-black/5 sm:h-12 sm:w-12 dark:hover:bg-white/5"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex min-w-[60px] flex-col items-center sm:min-w-[80px]">
            <span className="font-black tabular-nums text-sm">{slide} / {total}</span>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {t('slide')}
            </span>
          </div>

          <button
            disabled={slide === total}
            onClick={onNext}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-20 sm:h-12 sm:w-12"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Shortcuts / Fullscreen */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground opacity-60 sm:flex dark:bg-white/5">
            <Keyboard size={12} />
            <span>{t('arrowsNavigate')}</span>
          </div>
          <button
            onClick={onFullscreen}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 transition-all active:scale-95 hover:bg-black/5 sm:h-12 sm:w-12 dark:hover:bg-white/5"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Component ---

interface PresentationViewerProps {
  module: CourseModule;
  locale: string;
  initialLang: CourseLang;
}

export default function PresentationViewer({ module, locale, initialLang }: PresentationViewerProps) {
  const t = useTranslations('presentation');
  const [lang, setLang] = useState<CourseLang>(initialLang);
  const [slide, setSlide] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentPresentation = module.presentations[lang];
  const { presentationId, totalSlides: total } = currentPresentation;
  const title = lang === 'th' ? module.titleTh : module.title;

  const handleLangChange = useCallback((next: CourseLang) => {
    if (next === lang) return;
    setLang(next);
    setSlide(1);
    setIsLoaded(false);
    
    // Sync URL param without hard navigation
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url.toString());
  }, [lang]);

  const goToSlide = useCallback((n: number) => {
    if (n < 1 || n > total) return;
    setIsLoaded(false);
    setSlide(n);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(slide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(slide - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slide, goToSlide]);

  // Fullscreen logic
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progress = useMemo(() => (slide / total) * 100, [slide, total]);
  const embedUrl = useMemo(
    () => `https://docs.google.com/presentation/d/${presentationId}/embed?slide=id.p${slide}&rm=minimal`,
    [presentationId, slide]
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-hidden bg-muted/20 text-foreground dark:bg-black/20"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      <SlideHeader
        title={title}
        lang={lang}
        onLangChange={handleLangChange}
        onBack={() => router.push(`/${locale}/learn`)}
      />

      {/* ── Viewer ─────────────────────────────────────────── */}
      <main className="relative flex flex-1 items-center justify-center p-2 sm:p-4 md:p-8">
        {/* Loading state */}
        <AnimatePresence mode="wait">
          {!isLoaded && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md"
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
                <div className="absolute inset-0 animate-pulse rounded-full border-4 border-primary/20" />
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                {t('syncingSlide', { slide })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Frame */}
        <motion.div
          className="relative aspect-video h-full w-full max-w-6xl overflow-hidden rounded-xl border border-border/40 bg-black shadow-2xl sm:rounded-3xl"
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={TRANSITION.base}
        >
          <iframe
            key={`${lang}-${slide}`}
            src={embedUrl}
            className="h-full w-full border-none"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
            title={`Slide ${slide} of ${title}`}
          />
        </motion.div>
      </main>

      <SlideControls
        slide={slide}
        total={total}
        progress={progress}
        isFullscreen={isFullscreen}
        onPrev={() => goToSlide(slide - 1)}
        onNext={() => goToSlide(slide + 1)}
        onFullscreen={toggleFullscreen}
      />
    </div>
  );
}

