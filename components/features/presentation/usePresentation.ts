'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseModule, CourseLang } from '@/lib/courses';
import type { UserRole } from '@/types';
import { getAgentSession } from '@/lib/agent-session';
import { useLivePresentation } from '@/lib/live-presentation';

const LOAD_TIMEOUT_MS = 12_000;

const slideKey = (moduleId: string, lang: CourseLang) =>
  `brainstrade_slide_${moduleId}_${lang}`;

const viewedKey = (moduleId: string, lang: CourseLang) =>
  `brainstrade_viewed_${moduleId}_${lang}`;

export function usePresentation(
  module: CourseModule,
  user: { uid: string; name: string; role: UserRole } | null | undefined,
  initialLang: CourseLang,
  locale: string
) {
  const router = useRouter();
  const [lang, setLang] = useState<CourseLang>(initialLang);
  const [activeTool, setActiveTool] = useState<'pen' | 'laser' | null>(null);
  
  const isTrainer = !!(user && ['admin', 'trainer', 'manager'].includes(user.role));

  // Live Sync Hook
  const { 
    session, startLive, stopLive, syncSlide, updateLaser, 
    addDrawingPath, clearDrawings, isLive, isControlledByOthers 
  } = useLivePresentation(module.id, user?.uid, user?.name, !!isTrainer);

  const [slide, setSlide] = useState(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(slideKey(module.id, initialLang));
    const n = saved ? parseInt(saved, 10) : 1;
    const total = module.presentations[initialLang].totalSlides;
    return n >= 1 && n <= total ? n : 1;
  });

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
  const slideRef = useRef(slide);
  const touchStartX = useRef<number | null>(null);

  // Preloading state
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadedSlides, setPreloadedSlides] = useState<Set<number>>(new Set());

  const { presentationId, totalSlides: total, cacheKey, slideUrls } = module.presentations[lang];
  const hasContent = !!((slideUrls && slideUrls.length > 0) || presentationId);
  const isModuleComplete = viewedSlides.size >= total;

  useEffect(() => { slideRef.current = slide; }, [slide]);

  // Sync lang state if prop changes from outside (non-trainer)
  useEffect(() => {
    if (!isControlledByOthers) setLang(initialLang);
  }, [initialLang, isControlledByOthers]);

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

  useEffect(() => {
    setIsLoaded(false);
    setLoadError(false);
    setPreloadedSlides(new Set()); 

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

  // Track viewed slides
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

  // Auto-credit for live followers
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

  // Track completion
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

      if (priority.length === 0) return;
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

  // Standard Handlers
  useEffect(() => {
    localStorage.setItem(slideKey(module.id, lang), String(slide));
  }, [slide, module.id, lang]);

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
    const saved = localStorage.getItem(slideKey(module.id, next));
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
  }, [lang, module.id, module.presentations, isLive, syncSlide]);

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

  const slideImageUrl = useMemo(() => {
    const storageUrl = slideUrls?.[slide - 1];
    if (storageUrl) return storageUrl;
    const vParam = cacheKey ? `&v=${encodeURIComponent(cacheKey)}` : '';
    return `/api/slide?id=${presentationId}&page=${slide}${vParam}`;
  }, [presentationId, slide, cacheKey, slideUrls]);

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
    slideImageUrl, progress,
    total, hasContent,
    activeTool, setActiveTool,
    isTrainer,
    session, startLive, stopLive, updateLaser, addDrawingPath, clearDrawings, isLive, isControlledByOthers
  };
}
