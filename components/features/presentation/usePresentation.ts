'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseModule, CourseLang } from '@/lib/courses';
import type { UserRole } from '@/types';
import { getAgentSession } from '@/lib/session/agent';
import { useLivePresentation } from '@/lib/live-presentation';

const LOAD_TIMEOUT_MS = 12_000;

// Versioned keys with userId to prevent leakage between sessions
const slideKey = (moduleId: string, lang: CourseLang, userId: string) =>
  `bt_v2_slide_${userId}_${moduleId}_${lang}`;

const viewedKey = (moduleId: string, lang: CourseLang, userId: string) =>
  `bt_v2_viewed_${userId}_${moduleId}_${lang}`;

export function usePresentation(
  module: CourseModule,
  user: { uid: string; name: string; role: UserRole } | null | undefined,
  initialLang: CourseLang,
  locale: string
) {
  const router = useRouter();
  const [lang, setLang] = useState<CourseLang>(initialLang);
  const [activeTool, setActiveTool] = useState<'pen' | 'laser' | null>(null);
  
  // Identify the session immediately if possible (client-side)
  const [agentId, setAgentId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return getAgentSession()?.id || null;
  });
  const [agentName, setAgentName] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return getAgentSession()?.name || null;
  });

  const isTrainer = !!(user && ['admin', 'trainer', 'manager'].includes(user.role)) && agentId !== 'admin-preview-agent';

  // Unique identifier for this session's progress
  const effectiveId = useMemo(() => {
    if (agentId) return `agent_${agentId}`;
    if (user?.uid) return `user_${user.uid}`;
    return 'guest';
  }, [agentId, user?.uid]);

  // Live Sync Hook
  const { 
    session, startLive, stopLive, syncSlide, updateLaser, 
    addDrawingPath, clearDrawings, isLive, isControlledByOthers 
  } = useLivePresentation(module.id, user?.uid, user?.name, !!isTrainer);

  const [slide, setSlide] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(slideKey(module.id, initialLang, effectiveId));
    const n = saved ? parseInt(saved, 10) : 1;
    const total = module.presentations[initialLang].totalSlides;
    return n >= 1 && n <= total ? n : 1;
  });

  const [viewedSlides, setViewedSlides] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem(viewedKey(module.id, initialLang, effectiveId));
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

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef(slide);
  const touchStartX = useRef<number | null>(null);

  // Preloading state
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Blob URL caching state & refs
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const blobUrlsRef = useRef<Map<number, string>>(new Map());

  const { presentationId, totalSlides: total, cacheKey, slideUrls } = module.presentations[lang];
  const hasContent = !!((slideUrls && slideUrls.length > 0) || presentationId);
  const isModuleComplete = viewedSlides.size >= total;

  useEffect(() => { slideRef.current = slide; }, [slide]);

  // Cleanup Blob URLs on unmount or language/module change
  useEffect(() => {
    setBlobUrls({});
    const currentBlobUrls = blobUrlsRef.current;
    return () => {
      currentBlobUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      currentBlobUrls.clear();
    };
  }, [module.id, lang]);

  const markAsComplete = useCallback(async () => {
    if (!agentId || !module.id || isTrainer || isSaving) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/agent/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          agentName: agentName || '',
          learnedModules: [module.id]
        })
      });
      // Also update local viewedSlides to "all" to show UI feedback immediately
      const allSlides = new Set<number>();
      for (let i = 1; i <= total; i++) allSlides.add(i);
      setViewedSlides(allSlides);
      localStorage.setItem(viewedKey(module.id, lang, effectiveId), JSON.stringify(Array.from(allSlides)));
    } catch (err) {
      console.error('Failed to save learning progress:', err);
    } finally {
      setIsSaving(false);
    }
  }, [agentId, module.id, isTrainer, isSaving, agentName, total, lang, effectiveId]);

  // Sync lang state if prop changes from outside (non-trainer)
  useEffect(() => {
    if (!isControlledByOthers) setLang(initialLang);
  }, [initialLang, isControlledByOthers]);

  // 1. Follow trainer via Firebase RTDB
  useEffect(() => {
    if (isControlledByOthers && session?.active) {
      if (session.slide !== slide) setSlide(session.slide);
      if (session.lang !== lang) setLang(session.lang as CourseLang);
    }
  }, [isControlledByOthers, session, slide, lang]);

  // 1b. Listen to local macOS Dual Screen BroadcastChannel (Audience Window Mode)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const isAudienceView = urlParams.get('audienceView') === 'true';

    if (!isAudienceView) return;

    const channel = new BroadcastChannel('bt_presenter_dual_screen');
    channel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_SLIDE' && event.data?.moduleId === module.id) {
        if (event.data.slide && event.data.slide !== slide) {
          setSlide(event.data.slide);
          setIsLoaded(false);
        }
        if (event.data.lang && event.data.lang !== lang) {
          setLang(event.data.lang as CourseLang);
          setIsLoaded(false);
        }
      }
    };

    return () => channel.close();
  }, [module.id, slide, lang]);

  // 2. Broadcast updates (as trainer)
  useEffect(() => {
    if (isTrainer && isLive) {
      syncSlide(slide, lang);
    }
  }, [slide, lang, isTrainer, isLive, syncSlide]);

  // Reload progress when module, lang, or identity changes
  useEffect(() => {
    setIsLoaded(false);
    setLoadError(false);
    setPreloadedSlides(new Set()); 

    const saved = localStorage.getItem(viewedKey(module.id, lang, effectiveId));
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

    // Also reload current slide for this session
    const savedSlide = localStorage.getItem(slideKey(module.id, lang, effectiveId));
    if (savedSlide) {
      const n = parseInt(savedSlide, 10);
      if (n >= 1 && n <= total) setSlide(n);
    } else {
      setSlide(1);
    }
  }, [slideUrls, presentationId, lang, module.id, effectiveId, total]);

  // Handle identity changes (e.g. if session is loaded late)
  useEffect(() => {
    const session = getAgentSession();
    if (session) {
      setAgentName(session.name);
      setAgentId(session.id);
    }
  }, []);

  // Track viewed slides
  useEffect(() => {
    if (isLoaded && hasContent) {
      setViewedSlides(prev => {
        if (prev.has(slide)) return prev;
        const next = new Set(prev).add(slide);
        localStorage.setItem(viewedKey(module.id, lang, effectiveId), JSON.stringify(Array.from(next)));
        return next;
      });
    }
  }, [slide, isLoaded, hasContent, module.id, lang, effectiveId]);

  // Auto-credit for live followers
  useEffect(() => {
    if (isLive && !isTrainer && isLoaded && hasContent) {
      setViewedSlides(prev => {
        if (prev.has(slide)) return prev;
        const next = new Set(prev).add(slide);
        localStorage.setItem(viewedKey(module.id, lang, effectiveId), JSON.stringify(Array.from(next)));
        return next;
      });
    }
  }, [slide, isLive, isTrainer, isLoaded, hasContent, module.id, lang, effectiveId]);

  // Track completion on server
  useEffect(() => {
    if (!agentId || !module.id || !total || isTrainer) return;
    if (isModuleComplete && isLoaded) {
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

  const getRawSlideUrl = useCallback(
    (n: number) => {
      const storageUrl = slideUrls?.[n - 1];
      if (storageUrl) return storageUrl;
      return `/api/slide?page=${n}`;
    },
    [slideUrls]
  );

  const fetchAndCacheSlide = useCallback(
    async (n: number) => {
      if (blobUrlsRef.current.has(n)) {
        return blobUrlsRef.current.get(n)!;
      }
      const rawUrl = getRawSlideUrl(n);
      try {
        const res = await fetch(rawUrl);
        if (!res.ok) {
          // Log non-ok responses (410/404) cleanly without throwing unhandled exceptions
          console.warn(`[Presentation] Slide #${n} returned HTTP ${res.status}`);
          return rawUrl;
        }
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        blobUrlsRef.current.set(n, objectUrl);
        setBlobUrls(prev => ({ ...prev, [n]: objectUrl }));
        return objectUrl;
      } catch (err) {
        console.warn(`[Presentation] Failed to fetch slide #${n} blob:`, err);
        return rawUrl;
      }
    },
    [getRawSlideUrl]
  );

  // Preloading Logic
  useEffect(() => {
    if (!hasContent) return;
    let active = true;

    const preloadWindow = async () => {
      const count = total || (slideUrls?.length ?? 0);
      if (count === 0) return;

      const WINDOW_AHEAD = 5;
      const WINDOW_BEHIND = 2;
      const priority: number[] = [];
      if (!preloadedSlides.has(slide)) priority.push(slide);
      for (let i = 1; i <= WINDOW_AHEAD; i++) {
        const n = slide + i;
        if (n <= count && !preloadedSlides.has(n)) priority.push(n);
      }
      for (let i = 1; i <= WINDOW_BEHIND; i++) {
        const n = slide - i;
        if (n >= 1 && !preloadedSlides.has(n)) priority.push(n);
      }

      const currentReady = preloadedSlides.has(slide);
      if (!currentReady) {
        // Immediately mark the current slide preloaded so the presentation displays without blocking UI
        setPreloadedSlides(prev => new Set(prev).add(slide));
        setIsPreloading(true);
        setPreloadingProgress(0);
      }

      let loadedInBatch = 0;
      for (const n of priority) {
        if (!active) break;
        const objectUrl = await fetchAndCacheSlide(n);
        if (!active) break;

        await new Promise((resolve) => {
          const img = new Image();
          img.src = objectUrl;
          img.onload = () => {
            if (!active) return resolve(null);
            setPreloadedSlides(prev => new Set(prev).add(n));
            loadedInBatch++;
            setPreloadingProgress(Math.round((loadedInBatch / priority.length) * 100));
            resolve(null);
          };
          img.onerror = () => {
            if (!active) return resolve(null);
            // Mark attempted so we do not infinitely retry broken/410 upstream slides
            setPreloadedSlides(prev => new Set(prev).add(n));
            loadedInBatch++;
            resolve(null);
          };
        });
      }
      if (active) setIsPreloading(false);
    };

    preloadWindow();
    return () => { active = false; };
  }, [slide, presentationId, total, cacheKey, slideUrls, hasContent, preloadedSlides, fetchAndCacheSlide]);

  // Persistent current slide for this session
  useEffect(() => {
    localStorage.setItem(slideKey(module.id, lang, effectiveId), String(slide));
  }, [slide, module.id, lang, effectiveId]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('slide', String(slide));
    window.history.replaceState(null, '', url.toString());
  }, [slide]);

  useEffect(() => {
    if (isLoaded || loadError) return;
    const timer = setTimeout(() => setLoadError(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, loadError]);

  const goToSlide = useCallback((n: number) => {
    if (n < 1 || n > total) return;
    setIsLoaded(false);
    setLoadError(false);
    setSlide(n);
    if (isLive) syncSlide(n, lang);
  }, [total, isLive, syncSlide, lang]);

  const handleLangChange = useCallback((next: CourseLang) => {
    if (next === lang) return;
    const saved = localStorage.getItem(slideKey(module.id, next, effectiveId));
    const nextTotal = module.presentations[next].totalSlides;
    const n = saved ? parseInt(saved, 10) : 1;
    const restoredSlide = n >= 1 && n <= nextTotal ? n : 1;
    
    setLang(next);
    setSlide(restoredSlide);
    setIsLoaded(false);
    setLoadError(false);
    setPreloadedSlides(new Set()); 

    if (isLive) syncSlide(restoredSlide, next);

    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    url.searchParams.set('slide', String(restoredSlide));
    window.history.replaceState(null, '', url.toString());
  }, [lang, module.id, module.presentations, isLive, syncSlide, effectiveId]);

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

  // Keyboard & Wireless Remote Clicker Navigation (Logitech, Kensington, Targus, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const nextKeys = ['ArrowRight', 'ArrowDown', 'PageDown', 'Space', 'n', 'N'];
      const prevKeys = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p', 'P'];

      if (nextKeys.includes(e.key)) {
        e.preventDefault();
        goToSlide(slideRef.current + 1);
      } else if (prevKeys.includes(e.key)) {
        e.preventDefault();
        goToSlide(slideRef.current - 1);
      } else if (e.key === 'F5' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToSlide, toggleFullscreen]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 35) {
      goToSlide(slideRef.current + (delta > 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }, [goToSlide]);

  const slideImageUrl = useMemo(() => {
    if (blobUrls[slide]) return blobUrls[slide];
    return getRawSlideUrl(slide);
  }, [slide, blobUrls, getRawSlideUrl]);

  const nextSlideImageUrl = useMemo(() => {
    if (slide >= total) return null;
    const nextNum = slide + 1;
    if (blobUrls[nextNum]) return blobUrls[nextNum];
    return getRawSlideUrl(nextNum);
  }, [slide, total, blobUrls, getRawSlideUrl]);

  const progress = useMemo(
    () => ((slide - 1) / Math.max(total - 1, 1)) * 100,
    [slide, total]
  );

  return {
    lang, handleLangChange,
    slide, goToSlide,
    viewedSlides, isModuleComplete,
    isLoaded, setIsLoaded, loadError, setLoadError,
    isFullscreen, toggleFullscreen,
    agentName, agentId,
    isPreloading, preloadingProgress,
    containerRef, handleTouchStart, handleTouchEnd,
    slideImageUrl, nextSlideImageUrl, progress,
    total, hasContent,
    activeTool, setActiveTool,
    isTrainer,
    markAsComplete, isSaving,
    session, startLive, stopLive, updateLaser, addDrawingPath, clearDrawings, isLive, isControlledByOthers
  };
}
