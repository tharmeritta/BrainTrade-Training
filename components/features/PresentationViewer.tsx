'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Keyboard,
  ArrowLeft,
} from 'lucide-react';
import type { CourseModule, CourseLang } from '@/lib/courses';

interface Props {
  module: CourseModule;
  locale: string;
  initialLang: CourseLang;
}

export default function PresentationViewer({ module, locale, initialLang }: Props) {
  const [lang, setLang] = useState<CourseLang>(initialLang);
  const [slide, setSlide] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { presentationId, totalSlides: total } = module.presentations[lang];
  const title = lang === 'th' ? module.titleTh : module.title;

  const switchLang = (next: CourseLang) => {
    if (next === lang) return;
    setLang(next);
    setSlide(1);
    setLoaded(false);
    // Sync URL param without hard navigation
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url.toString());
  };

  const goTo = useCallback(
    (n: number) => {
      if (n < 1 || n > total) return;
      setLoaded(false);
      setSlide(n);
    },
    [total],
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goTo(slide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goTo(slide - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slide, goTo]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const progress = (slide / total) * 100;
  const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?slide=id.p${slide}&rm=minimal`;

  return (
    <div
      ref={containerRef}
      className="flex flex-col bg-muted/20 dark:bg-black/20 text-foreground overflow-hidden"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col shrink-0 relative z-10"
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
          {/* Left: back + title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => router.push(`/${locale}/learn`)}
              className="shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
              title="Back to courses"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="hidden sm:block w-px h-8 bg-border/50 shrink-0" />
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl shrink-0">
                <BookOpen size={18} className="text-primary" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-0.5">
                  Training Module
                </p>
                <p className="text-sm sm:text-base font-semibold leading-none truncate text-foreground/90">{title}</p>
              </div>
            </div>
          </div>

          {/* Right: lang toggle + slide counter + fullscreen */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* TH / EN toggle - Desktop */}
            <div className="hidden sm:flex items-center p-1 bg-muted/50 border border-border/50 rounded-xl">
              {(['th', 'en'] as CourseLang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    lang === l ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lang === l && (
                    <motion.div
                      layoutId="lang-active-tab-presentation"
                      className="absolute inset-0 bg-primary rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 uppercase">{l}</span>
                </button>
              ))}
            </div>
            
            {/* TH / EN toggle - Mobile */}
            <div className="flex sm:hidden items-center p-0.5 bg-muted/50 border border-border/50 rounded-lg">
              {(['th', 'en'] as CourseLang[]).map((l) => (
                 <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                    lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                 >
                   {l}
                 </button>
              ))}
            </div>

            {/* Slide counter */}
            <div className="hidden md:flex items-center px-3 py-1.5 bg-accent/30 rounded-lg border border-border/50">
              <span className="text-sm text-foreground font-semibold tabular-nums">{slide}</span>
              <span className="text-sm text-muted-foreground/50 mx-1.5">/</span>
              <span className="text-sm text-muted-foreground tabular-nums">{total}</span>
            </div>

            <div className="w-px h-6 bg-border/50 shrink-0 hidden sm:block" />

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/30 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
        
        {/* ── Progress bar ────────────────────────────────────── */}
        <div className="h-0.5 w-full bg-border/30 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* ── Slide area ──────────────────────────────────────── */}
      <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 md:p-6 min-h-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
        <div className="w-full h-full max-w-6xl mx-auto flex items-center gap-2 sm:gap-4 md:gap-6 relative z-0">
          
          {/* Prev Button (Desktop) */}
          <button
            onClick={() => goTo(slide - 1)}
            disabled={slide <= 1}
            className="hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-full
                       bg-background/80 hover:bg-background border border-border shadow-sm
                       text-foreground/70 hover:text-foreground hover:scale-105 active:scale-95
                       disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            <ChevronLeft size={24} />
          </button>

          {/* iframe Container */}
          <motion.div 
            className="flex-1 h-full relative flex items-center justify-center min-w-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-white/20 dark:border-white/10 bg-black/5"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">
              {!loaded && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-background/50 backdrop-blur-sm"
                >
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                  <span className="text-foreground/70 text-sm font-medium tracking-wide">Loading slide {slide} / {total}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <iframe
              key={`${lang}-${slide}`}
              src={embedUrl}
              className={`w-full h-full transition-opacity duration-500 bg-background ${loaded ? 'opacity-100' : 'opacity-0'}`}
              allowFullScreen
              onLoad={() => setLoaded(true)}
              title={`${title} — Slide ${slide}`}
            />
            
            {/* Mobile slide controls overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center sm:hidden z-20 pointer-events-none">
               <div className="flex items-center gap-4 bg-background/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-border pointer-events-auto">
                 <button
                    onClick={() => goTo(slide - 1)}
                    disabled={slide <= 1}
                    className="p-2 rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-xs font-semibold tabular-nums px-2">
                    {slide} / {total}
                  </span>
                  <button
                    onClick={() => goTo(slide + 1)}
                    disabled={slide >= total}
                    className="p-2 rounded-full hover:bg-accent disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
          </motion.div>

          {/* Next Button (Desktop) */}
          <button
            onClick={() => goTo(slide + 1)}
            disabled={slide >= total}
            className="hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-full
                       bg-background/80 hover:bg-background border border-border shadow-sm
                       text-foreground/70 hover:text-foreground hover:scale-105 active:scale-95
                       disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed
                       transition-all duration-200"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="shrink-0 flex items-center justify-center gap-2 pb-4 pt-1"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 shadow-sm">
          <Keyboard size={12} className="text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-medium">
            Use <kbd className="px-1.5 py-0.5 rounded-sm bg-muted text-foreground border border-border/50 shadow-sm text-[10px] uppercase font-sans mx-0.5">←</kbd> <kbd className="px-1.5 py-0.5 rounded-sm bg-muted text-foreground border border-border/50 shadow-sm text-[10px] uppercase font-sans mx-0.5">→</kbd> arrow keys to navigate
          </span>
        </div>
      </motion.div>
    </div>
  );
}

