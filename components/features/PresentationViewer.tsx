'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
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
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Radio,
  Pencil,
  Zap,
  Trash2,
  Play,
  Square,
  X
} from 'lucide-react';
import type { CourseModule, CourseLang } from '@/lib/courses';
import { TRANSITION } from '@/lib/animations';
import { getAgentSession } from '@/lib/agent-session';
import type { UserRole } from '@/types';
import { useLivePresentation } from '@/lib/live-presentation';
import DrawingCanvas from './DrawingCanvas';

// --- Helpers ---

const LOAD_TIMEOUT_MS = 12_000;

const slideKey = (moduleId: string, lang: CourseLang) =>
  `brainstrade_slide_${moduleId}_${lang}`;

const viewedKey = (moduleId: string, lang: CourseLang) =>
  `brainstrade_viewed_${moduleId}_${lang}`;

// --- Main Component ---

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
  showLangToggle = false,
}: PresentationViewerProps) {
  const t = useTranslations('presentation');
  const router = useRouter();

  const [lang, setLang] = useState<CourseLang>(initialLang);
  const [activeTool, setActiveTool] = useState<'pen' | 'laser' | null>(null);

  const isTrainer = user && ['admin', 'trainer', 'manager'].includes(user.role);

  // Live Sync Hook
  const { 
    session, startLive, stopLive, syncSlide, updateLaser, 
    addDrawingPath, clearDrawings, isLive, isControlledByOthers 
  } = useLivePresentation(module.id, user?.uid, user?.name, !!isTrainer);

  // Sync lang state if prop changes from outside
  useEffect(() => {
    if (!isControlledByOthers) setLang(initialLang);
  }, [initialLang, isControlledByOthers]);

  const [slide, setSlide] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(slideKey(module.id, initialLang));
    const n = saved ? parseInt(saved, 10) : 1;
    const total = module.presentations[initialLang].totalSlides;
    return n >= 1 && n <= total ? n : 1;
  });

  // ── Sync with Live Session ───────────────────────────────────────────────────
  
  // 1. Follow trainer
  useEffect(() => {
    if (isControlledByOthers && session?.active) {
      if (session.slide !== slide) setSlide(session.slide);
      if (session.lang !== lang) setLang(session.lang as CourseLang);
    }
  }, [isControlledByOthers, session, slide, lang]);

  // 2. Broadcast updates (as trainer)
  useEffect(() => {
    if (isTrainer && isLive) {
      syncSlide(slide, lang);
    }
  }, [slide, lang, isTrainer, isLive, syncSlide]);

  const [viewedSlides, setViewedSlides] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem(viewedKey(module.id, initialLang));
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        return new Set(Array.isArray(arr) ? arr : []);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef(slide);
  const touchStartX = useRef<number | null>(null);

  // Preloading state
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(new Set());

  const { presentationId, totalSlides: total, cacheKey, slideUrls } = module.presentations[lang];

  const hasContent = (slideUrls && slideUrls.length > 0) || presentationId;

  const isModuleComplete = viewedSlides.size >= total;

  useEffect(() => { slideRef.current = slide; }, [slide]);

  useEffect(() => {
    setIsLoaded(false);
    setLoadError(false);
    setPreloadedSlides(new Set()); // Clear memory on presentation change

    // Restore viewed slides for the new lang/module
    const saved = localStorage.getItem(viewedKey(module.id, lang));
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        setViewedSlides(new Set(Array.isArray(arr) ? arr : []));
      } catch {
        setViewedSlides(new Set());
      }
    } else {
      setViewedSlides(new Set());
    }
  }, [slideUrls, presentationId, lang, module.id]);

  useEffect(() => {
    const session = getAgentSession();
    if (session) {
      setAgentName(session.name);
      setAgentId(session.id);
    }
  }, []);

  // ── Track viewed slides ───────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && hasContent) {
      setViewedSlides(prev => {
        if (prev.has(slide)) return prev;
        const next = new Set(prev).add(slide);
        localStorage.setItem(viewedKey(module.id, lang), JSON.stringify(Array.from(next)));
        return next;
      });
    }
  }, [slide, isLoaded, hasContent, module.id, lang]);

  // Auto-credit for live followers: if we are in a live session and not the trainer,
  // we should mark the current slide as viewed even if we didn't manually click it.
  useEffect(() => {
    if (isLive && !isTrainer && isLoaded && hasContent) {
      setViewedSlides(prev => {
        if (prev.has(slide)) return prev;
        const next = new Set(prev).add(slide);
        localStorage.setItem(viewedKey(module.id, lang), JSON.stringify(Array.from(next)));
        return next;
      });
    }
  }, [slide, isLive, isTrainer, isLoaded, hasContent, module.id, lang]);

  // ── Track completion ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!agentId || !module.id || !total || isTrainer) return;
    
    if (isModuleComplete && isLoaded) {
      // Small delay to ensure they actually see the current slide
      const timer = setTimeout(() => {
        fetch('/api/agent/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            agentName: agentName || '',
            learnedModules: [module.id]
          })
        }).catch(err => console.error('Failed to save learning progress:', err));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isModuleComplete, total, isLoaded, agentId, agentName, module.id, isTrainer]);

  // ── Preloading Logic (Sliding Window) ─────────────────────────────────────

  useEffect(() => {
    if (!hasContent) return;
    let active = true;

    const preloadWindow = async () => {
      const count = total || (slideUrls?.length ?? 0);
      if (count === 0) return;

      // Sliding Window: 5 ahead, 2 behind
      const WINDOW_AHEAD = 5;
      const WINDOW_BEHIND = 2;
      
      const priority: number[] = [];
      // Current slide first
      if (!preloadedSlides.has(slide)) priority.push(slide);
      
      // Then ahead
      for (let i = 1; i <= WINDOW_AHEAD; i++) {
        const n = slide + i;
        if (n <= count && !preloadedSlides.has(n)) priority.push(n);
      }
      
      // Then behind (for quick back navigation)
      for (let i = 1; i <= WINDOW_BEHIND; i++) {
        const n = slide - i;
        if (n >= 1 && !preloadedSlides.has(n)) priority.push(n);
      }

      if (priority.length === 0) return;

      // Only show global preloading state if the current slide isn't ready
      const currentReady = preloadedSlides.has(slide);
      if (!currentReady) {
        setIsPreloading(true);
        setPreloadingProgress(0);
      }

      let loadedInBatch = 0;
      for (const n of priority) {
        if (!active) break;
        
        await new Promise((resolve) => {
          const img = new Image();
          const storageUrl = slideUrls?.[n - 1];
          const vParam = cacheKey ? `&v=${encodeURIComponent(cacheKey)}` : '';
          img.src = storageUrl ?? `/api/slide?id=${presentationId}&page=${n}${vParam}`;
          
          img.onload = () => {
            if (!active) return resolve(null);
            setPreloadedSlides(prev => new Set(prev).add(n));
            loadedInBatch++;
            setPreloadingProgress(Math.round((loadedInBatch / priority.length) * 100));
            resolve(null);
          };
          img.onerror = () => {
            if (!active) return resolve(null);
            loadedInBatch++;
            resolve(null);
          };
        });
      }
      
      if (active) setIsPreloading(false);
    };

    preloadWindow();
    return () => { active = false; };
  }, [slide, presentationId, total, cacheKey, slideUrls, hasContent, preloadedSlides]);

  // ─── Standard Handlers ─────────────────────────────────────────────────────

  const title = lang === 'th' ? module.titleTh : module.title;
  const isComplete = slide === total;

  // Persist slide position
  useEffect(() => {
    localStorage.setItem(slideKey(module.id, lang), String(slide));
  }, [slide, module.id, lang]);

  // Sync slide to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('slide', String(slide));
    window.history.replaceState(null, '', url.toString());
  }, [slide]);

  // Loading timeout
  useEffect(() => {
    if (isLoaded || loadError) return;
    const timer = setTimeout(() => setLoadError(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, loadError]);

  const handleLangChange = useCallback((next: CourseLang) => {
    if (next === lang) return;
    
    const saved = localStorage.getItem(slideKey(module.id, next));
    const nextTotal = module.presentations[next].totalSlides;
    const n = saved ? parseInt(saved, 10) : 1;
    const restoredSlide = n >= 1 && n <= nextTotal ? n : 1;
    
    setLang(next);
    setSlide(restoredSlide);
    setIsLoaded(false);
    setLoadError(false);
    setPreloadedSlides(new Set()); // Reset on lang change

    if (isLive) syncSlide(restoredSlide, next);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    url.searchParams.set('slide', String(restoredSlide));
    window.history.replaceState(null, '', url.toString());
  }, [lang, module.id, module.presentations, isLive, syncSlide]);

  const goToSlide = useCallback((n: number) => {
    if (n < 1 || n > total) return;

    // Reset loader to ensure we track the next slide properly
    setIsLoaded(false);
    setLoadError(false);
    
    setSlide(n);
    if (isLive) syncSlide(n, lang);
  }, [total, isLive, syncSlide, lang]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToSlide(slideRef.current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToSlide(slideRef.current - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToSlide]);

  // Touch / swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goToSlide(slideRef.current + (delta > 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }, [goToSlide]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // 0% at slide 1, 100% at last slide
  const progress = useMemo(
    () => ((slide - 1) / Math.max(total - 1, 1)) * 100,
    [slide, total]
  );

  const slideImageUrl = useMemo(() => {
    const storageUrl = slideUrls?.[slide - 1];
    if (storageUrl) return storageUrl;
    const vParam = cacheKey ? `&v=${encodeURIComponent(cacheKey)}` : '';
    return `/api/slide?id=${presentationId}&page=${slide}${vParam}`;
  }, [presentationId, slide, cacheKey, slideUrls]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col overflow-hidden text-foreground ${embedded ? 'bg-transparent' : 'bg-muted/20 dark:bg-black/20'}`}
      style={{ height: embedded ? '100%' : 'calc(100dvh - 72px)' }}
    >
      {/* ── Main: fills everything, arrows flank the slide ─── */}
      <main
        className={`relative flex flex-1 min-h-0 items-center gap-2 sm:gap-3 ${embedded ? 'p-0' : 'px-3 pb-3 pt-3 sm:px-4 sm:pb-4'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Floating glass header ─────────────────────────── */}
        {!minimal && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Left: back + breadcrumb + title */}
          <div className="pointer-events-auto flex min-w-0 items-center gap-2">
            <button
              onClick={() => router.push(`/${locale}/learn`)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-black/8 dark:hover:bg-white/8"
              aria-label={t('back')}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 opacity-50">
                <BookOpen size={10} />
                <span className="truncate text-[9px] font-bold uppercase tracking-widest">
                  {t('productKnowledge')}
                </span>
              </div>
              <h1 className="truncate text-xs font-bold leading-tight sm:text-sm">{title}</h1>
            </div>
          </div>

          {/* Right: agent pill + lang switcher */}
          <div className="pointer-events-auto flex shrink-0 items-center gap-2">
            {isControlledByOthers && session?.active && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase text-white shadow-lg"
              >
                <Radio size={12} className="animate-pulse" />
                <span>LIVE: {session.trainerName}</span>
              </motion.div>
            )}

            {(user?.name || agentName) && (
              <div className="hidden items-center gap-1.5 rounded-xl border border-black/5 bg-black/5 px-2.5 py-1.5 dark:border-white/5 dark:bg-white/5 sm:flex">
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User size={11} />
                </div>
                <span className="text-xs font-black">{user?.name || agentName}</span>
              </div>
            )}

            <div className="flex gap-0.5 rounded-xl border border-black/5 bg-black/5 p-1 dark:border-white/5 dark:bg-white/5">
              {(['th', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    lang === l
                      ? 'bg-background text-primary shadow-sm shadow-black/5'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* ── Left nav arrow ── */}
        <button
          disabled={!hasContent || slide === 1 || isControlledByOthers}
          onClick={() => goToSlide(slide - 1)}
          className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/90 shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/5 sm:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={22} />
        </button>

        {/* ── Trainer Controls Toolbar ─────────────────────── */}
        {isTrainer && (
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
        )}

        {/* ── Center: slide + overlays ──────────────────────── */}
        <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center sm:self-stretch">

          {/* The Frame — width-primary on mobile, height-primary on desktop */}
          <motion.div
            ref={frameRef}
            className="relative aspect-video w-full max-w-full overflow-hidden rounded-xl border border-border/40 bg-black shadow-2xl sm:w-auto sm:h-full sm:rounded-3xl"
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={TRANSITION.base}
          >
            {/* Empty State Overlay */}
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

            {/* Loading / Error overlay — scoped inside the frame */}
            <AnimatePresence mode="wait">
              {hasContent && loadError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background/40 backdrop-blur-md"
                >
                  <AlertCircle className="text-destructive" size={36} />
                  <p className="text-sm font-bold text-destructive">{t('loadError')}</p>
                  <button
                    onClick={() => { setLoadError(false); setIsLoaded(false); }}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-all active:scale-95"
                  >
                    <RefreshCw size={14} />
                    {t('retry')}
                  </button>
                </motion.div>
              ) : hasContent && !isLoaded ? (
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
                  
                  {isPreloading && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                        {t('preloading')}
                      </p>
                      <div className="h-1 w-32 overflow-hidden rounded-full bg-primary/10">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${preloadingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Module complete badge */}
            <AnimatePresence>
              {hasContent && isModuleComplete && isLoaded && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2"
                >
                  <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 shadow-xl backdrop-blur-md">
                    <CheckCircle2 className="shrink-0 text-emerald-500" size={18} />
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {t('moduleComplete')}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasContent && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideImageUrl}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full w-full"
                >
                  <DrawingCanvas 
                    isTrainer={!!isTrainer}
                    isActive={isLive || isControlledByOthers}
                    mode={activeTool}
                    drawings={session?.drawings || []}
                    laserPos={session?.laserPos || null}
                    onDrawEnd={addDrawingPath}
                    onLaserMove={updateLaser}
                  />
                  <NextImage
                    src={slideImageUrl}
                    fill
                    className="object-contain"
                    onLoad={() => {
                      setIsLoaded(true);
                      setLoadError(false);
                      // Ensure current slide is marked as preloaded once viewed
                      setPreloadedSlides(prev => new Set(prev).add(slide));
                    }}
                    onError={() => setLoadError(true)}
                    alt={`Slide ${slide}`}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* ── Right nav arrow ── */}
        <button
          disabled={!hasContent || slide === total || isControlledByOthers}
          onClick={() => goToSlide(slide + 1)}
          className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-20 sm:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={22} />
        </button>
      </main>

      {/* ── Bottom strip ─────────────────────────────────────── */}
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
                  {viewedSlides.size} / {total}
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
    </div>
  );
}
