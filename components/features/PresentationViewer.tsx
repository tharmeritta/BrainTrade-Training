'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
      className="flex flex-col bg-background text-foreground"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border shrink-0">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/${locale}/learn`)}
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Back to courses"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="w-px h-5 bg-border shrink-0" />
          <div className="p-1.5 bg-primary/15 rounded-lg shrink-0">
            <BookOpen size={14} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
              Training Module
            </p>
            <p className="text-sm font-semibold leading-none truncate">{title}</p>
          </div>
        </div>

        {/* Right: lang toggle + slide counter + fullscreen */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* TH / EN toggle */}
          <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/6 border border-black/10 dark:border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => switchLang('th')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                lang === 'th'
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => switchLang('en')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                lang === 'en'
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EN
            </button>
          </div>

          {/* Slide counter */}
          <span className="text-sm text-muted-foreground tabular-nums hidden sm:inline">
            <span className="text-foreground font-semibold">{slide}</span>
            <span className="mx-1">/</span>
            <span>{total}</span>
          </span>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div className="h-[2px] bg-border shrink-0">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Slide area ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center gap-2 px-3 py-3 min-h-0 overflow-hidden bg-muted/30 dark:bg-muted/20">
        {/* Prev */}
        <button
          onClick={() => goTo(slide - 1)}
          disabled={slide <= 1}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
                     text-muted-foreground hover:text-foreground hover:bg-accent
                     disabled:opacity-20 disabled:cursor-not-allowed
                     transition-all duration-150"
        >
          <ChevronLeft size={24} />
        </button>

        {/* iframe */}
        <div className="flex-1 h-full relative flex items-center justify-center min-w-0">
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-muted rounded-2xl">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground text-xs">Loading slide {slide}…</span>
            </div>
          )}
          <iframe
            key={`${lang}-${slide}`}
            src={embedUrl}
            className="w-full h-full rounded-2xl border border-border transition-opacity duration-300"
            style={{ opacity: loaded ? 1 : 0 }}
            allowFullScreen
            onLoad={() => setLoaded(true)}
            title={`${title} — Slide ${slide}`}
          />
        </div>

        {/* Next */}
        <button
          onClick={() => goTo(slide + 1)}
          disabled={slide >= total}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
                     text-muted-foreground hover:text-foreground hover:bg-accent
                     disabled:opacity-20 disabled:cursor-not-allowed
                     transition-all duration-150"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center gap-1.5 pb-3 pt-1">
        <Keyboard size={11} className="text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/50 tracking-wide">
          ← → arrow keys to navigate
        </span>
      </div>
    </div>
  );
}
