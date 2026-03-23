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
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
  Radio,
  Users as UsersIcon,
  ShieldCheck,
  Power,
  Zap,
} from 'lucide-react';
import type { CourseModule, CourseLang } from '@/lib/courses';
import { TRANSITION } from '@/lib/animations';
import { getAgentSession } from '@/lib/agent-session';
import { db, rtdb } from '@/lib/firebase';
import { 
  ref, 
  onValue, 
  set, 
  update, 
  onDisconnect, 
  serverTimestamp as rtdbTimestamp,
  remove
} from 'firebase/database';
import type { UserRole } from '@/types';

// --- Helpers ---

const LOAD_TIMEOUT_MS = 12_000;

const slideKey = (moduleId: string, lang: CourseLang) =>
  `brainstrade_slide_${moduleId}_${lang}`;

// --- Main Component ---

interface PresentationViewerProps {
  module: CourseModule;
  locale: string;
  initialLang: CourseLang;
  user?: { uid: string; name: string; role: UserRole } | null;
}

export default function PresentationViewer({ module, locale, initialLang, user }: PresentationViewerProps) {
  const t = useTranslations('presentation');
  const router = useRouter();

  const [lang, setLang] = useState<CourseLang>(initialLang);

  const [slide, setSlide] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(slideKey(module.id, initialLang));
    const n = saved ? parseInt(saved, 10) : 1;
    const total = module.presentations[initialLang].totalSlides;
    return n >= 1 && n <= total ? n : 1;
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Preloading state
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(new Set());

  // Sync state
  const [syncActive, setSyncActive] = useState(false);
  const [syncedBy, setSyncedBy] = useState<string | null>(null);
  const [syncedById, setSyncedById] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ id: string; name: string; role: string; inControl?: boolean }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef(slide);
  const touchStartX = useRef<number | null>(null);
  const isTrainer = user && ['admin', 'manager', 'trainer'].includes(user.role);
  const amInControl = syncActive && syncedById === (user?.uid || agentId);

  const { presentationId, totalSlides: total, cacheKey, slideUrls } = module.presentations[lang];

  const hasContent = (slideUrls && slideUrls.length > 0) || presentationId;

  useEffect(() => { slideRef.current = slide; }, [slide]);

  useEffect(() => {
    setIsLoaded(false);
    setLoadError(false);
  }, [slideUrls, presentationId, lang]);

  useEffect(() => {
    const session = getAgentSession();
    if (session) {
      setAgentName(session.name);
      setAgentId(session.id);
    }
  }, []);

  // ── Preloading Logic ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasContent) return;
    let active = true;
    setPreloadedSlides(new Set()); // Reset on presentation change

    const preloadAll = async () => {
      setIsPreloading(true);
      setPreloadingProgress(0);

      const count = total || (slideUrls?.length ?? 0);
      if (count === 0) {
        setIsPreloading(false);
        return;
      }

      let loadedCount = 0;
      const currentPreloaded = new Set<number>();

      // Priority: Preload current slide first, then next 10, then the rest
      const priority: number[] = [slideRef.current];
      for (let i = 1; i <= 10; i++) {
        const next = slideRef.current + i;
        if (next <= count && !priority.includes(next)) priority.push(next);
      }
      for (let i = 1; i <= count; i++) {
        if (!priority.includes(i)) priority.push(i);
      }

      // Load in batches
      const BATCH_SIZE = 4;
      for (let i = 0; i < priority.length; i += BATCH_SIZE) {
        if (!active) break;
        const batch = priority.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(n => {
          return new Promise((resolve) => {
            const img = new Image();
            const storageUrl = slideUrls?.[n - 1];
            const vParam = cacheKey ? `&v=${encodeURIComponent(cacheKey)}` : '';
            img.src = storageUrl ?? `/api/slide?id=${presentationId}&page=${n}${vParam}`;
            img.onload = () => {
              if (!active) return resolve(null);
              loadedCount++;
              currentPreloaded.add(n);
              setPreloadingProgress(Math.round((loadedCount / count) * 100));
              // Update state every few slides to avoid excessive re-renders
              if (loadedCount % 5 === 0 || loadedCount === count) {
                setPreloadedSlides(new Set(currentPreloaded));
              }
              resolve(null);
            };
            img.onerror = () => {
              if (!active) return resolve(null);
              loadedCount++;
              setPreloadingProgress(Math.round((loadedCount / count) * 100));
              resolve(null);
            };
          });
        }));
      }
      if (active) setIsPreloading(false);
    };

    preloadAll();
    return () => { active = false; };
  }, [presentationId, total, cacheKey, slideUrls, hasContent]);

  // ── Sync Listener ──────────────────────────────────────────────────────────

  useEffect(() => {
    const syncRef = ref(rtdb, `presentation_sync/${module.id}/state`);
    const unsub = onValue(syncRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setSyncActive(data.active || false);
        setSyncedBy(data.controlledBy || null);
        setSyncedById(data.controlledById || null);

        // If sync is active and I'm not the one in control, follow the leader
        if (data.active && data.controlledById !== (user?.uid || agentId)) {
          if (data.currentSlide && data.currentSlide !== slideRef.current) {
            const nextSlide = data.currentSlide;
            // Only show loader if not preloaded
            if (!preloadedSlides.has(nextSlide)) {
              setIsLoaded(false);
            }
            setSlide(nextSlide);
          }
          if (data.currentLang && data.currentLang !== lang) {
            setLang(data.currentLang as CourseLang);
            setIsLoaded(false); // Reset loader on lang change as it's a new presentationId
          }
        }
      } else {
        setSyncActive(false);
        setSyncedBy(null);
        setSyncedById(null);
      }
    });

    return () => unsub();
  }, [module.id, user?.uid, agentId, lang, preloadedSlides]);

  // ... (Presence Tracking and Sync Actions remain unchanged)

  // ── Presence Tracking ──────────────────────────────────────────────────────

  useEffect(() => {
    const myId = user?.uid || agentId;
    const myName = user?.name || agentName;
    if (!myId || !myName) return;

    const myPresenceRef = ref(rtdb, `presentation_sync/${module.id}/participants/${myId}`);
    
    // Set presence and handle disconnect
    set(myPresenceRef, {
      id: myId,
      name: myName,
      role: user?.role || 'agent',
      inControl: amInControl,
      updatedAt: rtdbTimestamp(),
    }).then(() => {
      // Automatically remove from RTDB when user disconnects
      onDisconnect(myPresenceRef).remove();
    }).catch(err => {
      console.error('RTDB Presence Write Fatal:', err.message);
    });

    // Update inControl status when it changes
    update(myPresenceRef, { inControl: amInControl }).catch(() => {});

    // Listen for all participants
    const participantsRef = ref(rtdb, `presentation_sync/${module.id}/participants`);
    const unsub = onValue(participantsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.values(data);
        setParticipants(list as any[]);
      } else {
        setParticipants([]);
      }
    });

    // Cleanup presence on unmount
    return () => {
      remove(myPresenceRef).catch(() => {});
      unsub();
    };
  }, [module.id, user, agentId, agentName, amInControl]);

  // ── Sync Actions ────────────────────────────────────────────────────────────

  const takeControl = async () => {
    if (!user && !agentId) return;
    const syncRef = ref(rtdb, `presentation_sync/${module.id}/state`);
    await set(syncRef, {
      active: true,
      controlledBy: user?.name || agentName,
      controlledById: user?.uid || agentId,
      currentSlide: slide,
      currentLang: lang,
      updatedAt: rtdbTimestamp(),
    });
  };

  const stopControl = async () => {
    const syncRef = ref(rtdb, `presentation_sync/${module.id}/state`);
    await update(syncRef, {
      active: false,
      updatedAt: rtdbTimestamp(),
    });
  };

  const updateSyncSlide = async (n: number) => {
    if (!amInControl) return;
    const syncRef = ref(rtdb, `presentation_sync/${module.id}/state`);
    await update(syncRef, {
      currentSlide: n,
      updatedAt: rtdbTimestamp(),
    });
  };

  const updateSyncLang = async (next: CourseLang) => {
    if (!amInControl) return;
    const syncRef = ref(rtdb, `presentation_sync/${module.id}/state`);
    await update(syncRef, {
      currentLang: next,
      updatedAt: rtdbTimestamp(),
    });
  };

  // ─── Standard Handlers ─────────────────────────────────────────────────────

  const title = lang === 'th' ? module.titleTh : module.title;
  const isComplete = slide === total;

  // Persist slide position (only if not following sync)
  useEffect(() => {
    if (!syncActive || amInControl) {
      localStorage.setItem(slideKey(module.id, lang), String(slide));
    }
  }, [slide, module.id, lang, syncActive, amInControl]);

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
    
    if (syncActive && !amInControl) return; // Prevent manual change when following sync

    const saved = localStorage.getItem(slideKey(module.id, next));
    const nextTotal = module.presentations[next].totalSlides;
    const n = saved ? parseInt(saved, 10) : 1;
    const restoredSlide = n >= 1 && n <= nextTotal ? n : 1;
    
    setLang(next);
    setSlide(restoredSlide);
    setIsLoaded(false);
    setLoadError(false);
    setPreloadedSlides(new Set()); // Reset on lang change

    if (amInControl) {
      updateSyncLang(next);
      updateSyncSlide(restoredSlide);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    url.searchParams.set('slide', String(restoredSlide));
    window.history.replaceState(null, '', url.toString());
  }, [lang, module.id, module.presentations, syncActive, amInControl]);

  const goToSlide = useCallback((n: number) => {
    if (n < 1 || n > total) return;
    if (syncActive && !amInControl) return; // Prevent manual change when following sync

    // Only show loader if slide isn't preloaded
    if (!preloadedSlides.has(n)) {
      setIsLoaded(false);
      setLoadError(false);
    }
    
    setSlide(n);

    if (amInControl) {
      updateSyncSlide(n);
    }
  }, [total, syncActive, amInControl, preloadedSlides]);

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
      className="flex flex-col overflow-hidden bg-muted/20 text-foreground dark:bg-black/20"
      style={{ height: 'calc(100dvh - 72px)' }}
    >
      {/* ── Main: fills everything, arrows flank the slide ─── */}
      <main
        className="relative flex flex-1 min-h-0 items-center gap-2 sm:gap-3 px-3 pb-3 pt-3 sm:px-4 sm:pb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Floating glass header ─────────────────────────── */}
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
                {syncActive && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">
                    <Radio size={10} /> {t('syncActive')}
                  </span>
                )}
              </div>
              <h1 className="truncate text-xs font-bold leading-tight sm:text-sm">{title}</h1>
            </div>
          </div>

          {/* Right: agent pill + lang switcher + Trainer Controls */}
          <div className="pointer-events-auto flex shrink-0 items-center gap-2">
            {syncActive && !amInControl && (
              <div className="hidden items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 sm:flex">
                <div className="flex h-5 w-5 animate-pulse items-center justify-center rounded-lg bg-primary text-white">
                  <Zap size={10} />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-black uppercase tracking-wider text-primary/80">{t('following')}</span>
                  <span className="text-[11px] font-bold truncate max-w-[100px]">{syncedBy}</span>
                </div>
              </div>
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
                  disabled={syncActive && !amInControl}
                  onClick={() => handleLangChange(l)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    lang === l
                      ? 'bg-background text-primary shadow-sm shadow-black/5'
                      : 'text-muted-foreground hover:text-foreground disabled:opacity-30'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Left nav arrow (agent only — trainer uses bottom bar) ── */}
        {!isTrainer && (
          <button
            disabled={!hasContent || slide === 1 || (syncActive && !amInControl)}
            onClick={() => goToSlide(slide - 1)}
            className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/90 shadow-lg backdrop-blur-md transition-all active:scale-95 disabled:opacity-20 hover:bg-black/5 dark:hover:bg-white/5 sm:flex"
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* ── Center: slide + overlays ──────────────────────── */}
        <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center sm:self-stretch">

          {/* The Frame — width-primary on mobile, height-primary on desktop */}
          <motion.div
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
                  
                  {isPreloading ? (
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
                      <p className="text-[9px] font-bold text-muted-foreground">
                        {preloadingProgress}% — {t('preloadingDetail')}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                      {t('syncingSlide', { slide })}
                    </p>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Sync Overlay for agents (hidden for trainer — they have the bottom bar) */}
            <AnimatePresence>
              {hasContent && syncActive && !amInControl && !isTrainer && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
                >
                  <div className="flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 shadow-xl backdrop-blur-md">
                    <Radio className="text-primary animate-pulse" size={14} />
                    <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                      {t('controlledBy', { name: syncedBy })}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Module complete badge */}
            <AnimatePresence>
              {hasContent && isComplete && isLoaded && (
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
              <AnimatePresence>
                <motion.img
                  key={slideImageUrl}
                  src={slideImageUrl}
                  className="h-full w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onLoad={() => { 
                    setIsLoaded(true); 
                    setLoadError(false); 
                    // Ensure current slide is marked as preloaded once viewed
                    setPreloadedSlides(prev => new Set(prev).add(slide));
                  }}
                  onError={() => setLoadError(true)}
                  alt={`Slide ${slide}`}
                />
              </AnimatePresence>
            )}
          </motion.div>
        </div>

        {/* ── Right nav arrow (agent only — trainer uses bottom bar) ── */}
        {!isTrainer && (
          <button
            disabled={!hasContent || slide === total || (syncActive && !amInControl)}
            onClick={() => goToSlide(slide + 1)}
            className="relative z-10 hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-20 sm:flex"
            aria-label="Next slide"
          >
            <ChevronRight size={22} />
          </button>
        )}
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

        {isTrainer ? (
          /* ── Trainer Control Bar ──────────────────────────────────── */
          <div className="flex items-center gap-2 border-t border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-xl sm:px-5 sm:gap-3">

            {/* Navigation group: Prev · counter · Next — all together */}
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-black/5 dark:bg-white/5 p-1 shrink-0">
              <button
                disabled={!hasContent || slide === 1 || (syncActive && !amInControl)}
                onClick={() => goToSlide(slide - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95 disabled:opacity-25 hover:bg-black/8 dark:hover:bg-white/8"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-2.5 text-sm font-black tabular-nums select-none whitespace-nowrap">
                {hasContent ? slide : 0}
                <span className="text-muted-foreground font-medium mx-1">/</span>
                {hasContent ? total : 0}
              </div>
              <button
                disabled={!hasContent || slide === total || (syncActive && !amInControl)}
                onClick={() => goToSlide(slide + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-all active:scale-95 disabled:opacity-25 hover:bg-primary/90"
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Participant count with hover popover */}
            <div className="relative group/tparticipants shrink-0">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-black/5 dark:bg-white/5 px-3 py-1.5 cursor-help">
                <UsersIcon size={14} />
                <span className="text-sm font-black tabular-nums">{participants.length}</span>
                <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">
                  {t('participants')}
                </span>
              </div>
              {/* Popover — opens upward */}
              <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 origin-bottom-left scale-95 opacity-0 transition-all group-hover/tparticipants:pointer-events-auto group-hover/tparticipants:scale-100 group-hover/tparticipants:opacity-100 z-50">
                <div className="rounded-xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                  <p className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-1.5">
                    {t('participants')} ({participants.length})
                  </p>
                  <div className="max-h-52 overflow-y-auto">
                    {participants.map(p => (
                      <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                        <div className={`h-2 w-2 shrink-0 rounded-full ${p.inControl ? 'bg-primary' : 'bg-muted-foreground/25'}`} />
                        <span className="truncate text-[11px] font-bold">{p.name}</span>
                        {p.role !== 'agent' && (
                          <span className="ml-auto text-[8px] font-black uppercase tracking-tighter text-primary/60">{p.role}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Presence dots when in control */}
            {amInControl && participants.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-xs no-scrollbar">
                {participants.map(p => (
                  <div
                    key={p.id}
                    title={p.name}
                    className={`shrink-0 h-2 w-2 rounded-full ring-1 ring-offset-1 ring-offset-background transition-colors ${
                      p.inControl ? 'bg-primary ring-primary/40' : 'bg-muted-foreground/30 ring-transparent'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Take Control / Stop Control — primary CTA, right-aligned */}
            <button
              disabled={!hasContent}
              onClick={amInControl ? stopControl : takeControl}
              className={`ml-auto flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                amInControl
                  ? 'bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90'
                  : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
              } disabled:opacity-50`}
            >
              {amInControl ? <Power size={15} /> : <ShieldCheck size={15} />}
              {amInControl ? t('stopControl') : t('takeControl')}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

        ) : (
          /* ── Agent Bottom Strip (unchanged) ──────────────────────── */
          <div className="flex items-center justify-between border-t border-border/50 bg-background/80 px-4 py-2 backdrop-blur-xl sm:px-5">
            {/* Slide counter + participant count */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-black tabular-nums text-sm">{hasContent ? slide : 0} / {hasContent ? total : 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t('slide')}
                </span>
              </div>
              {/* Participant count */}
              <div className="relative group/participants">
                <div className="flex items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1 text-[10px] font-bold text-muted-foreground dark:bg-white/5 cursor-help">
                  <UsersIcon size={12} className="opacity-70" />
                  <span>{participants.length}</span>
                  <span className="hidden sm:inline opacity-70 font-medium uppercase tracking-tighter ml-0.5">
                    {t('participants')}
                  </span>
                </div>
                <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-48 origin-bottom-left scale-95 opacity-0 transition-all group-hover/participants:pointer-events-auto group-hover/participants:scale-100 group-hover/participants:opacity-100 z-50">
                  <div className="rounded-xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                    <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border pb-1">
                      {t('participants')} ({participants.length})
                    </p>
                    <div className="max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {participants.map(p => (
                        <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50">
                          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.inControl ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                          <span className="truncate text-[11px] font-bold">{p.name}</span>
                          {p.role !== 'agent' && (
                            <span className="ml-auto text-[8px] font-black uppercase tracking-tighter text-primary/60">{p.role}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!syncActive && (
                <div className="hidden items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1 text-[10px] font-bold text-muted-foreground opacity-50 sm:flex dark:bg-white/5">
                  <Keyboard size={11} />
                  <span>{t('arrowsNavigate')}</span>
                </div>
              )}
              <button
                onClick={toggleFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
