/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pencil,
  Zap,
  Trash2,
  Play,
  Square,
  Clock,
  ExternalLink,
  BookOpen,
  X,
  FileText,
  Grid,
  Users,
  AlertTriangle,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

import type { CourseModule, CourseLang } from '@/lib/courses';
import DrawingCanvas from '../DrawingCanvas';
import type { LiveSessionState, Point, DrawingPath } from '@/lib/live-presentation';

interface PresenterViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: CourseModule;
  slide: number;
  total: number;
  lang: CourseLang;
  slideImageUrl: string;
  nextSlideImageUrl: string | null;
  goToSlide: (n: number) => void;
  activeTool: 'pen' | 'laser' | null;
  setActiveTool: (tool: 'pen' | 'laser' | null) => void;
  clearDrawings: () => void;
  isLive: boolean;
  startLive: (slide: number, lang: CourseLang) => void;
  stopLive: () => void;
  session: LiveSessionState | null;
  addDrawingPath: (path: DrawingPath) => void;
  updateLaser: (pos: Point | null) => void;
}

export function PresenterViewModal({
  isOpen,
  onClose,
  module,
  slide,
  total,
  lang,
  slideImageUrl,
  nextSlideImageUrl,
  goToSlide,
  activeTool,
  setActiveTool,
  clearDrawings,
  isLive,
  startLive,
  stopLive,
  session,
  addDrawingPath,
  updateLaser,
}: PresenterViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [audienceWindow, setAudienceWindow] = useState<Window | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [currentNote, setCurrentNote] = useState<string>('');
  const [showGrid, setShowGrid] = useState(false);
  const [noteFontSize, setNoteFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [activeViewers, setActiveViewers] = useState<number>(0);
  const [penColor, setPenColor] = useState<string>('#ef4444');
  const [targetMinutes, setTargetMinutes] = useState<number>(30);

  useEffect(() => {
    setMounted(true);
  }, []);

  const title = lang === 'th' ? module.titleTh : module.title;

  // Timer & Clock
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    const clockTimer = setInterval(() => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(clockTimer);
    };
  }, [isOpen]);

  // Load pre-configured speaker notes from module if available
  useEffect(() => {
    const preloadedNotes = module.presentations[lang]?.speakerNotes || {};
    setNotes((prev) => ({ ...preloadedNotes, ...prev }));
  }, [module, lang]);

  // Load / Sync Note for current slide
  useEffect(() => {
    setCurrentNote(notes[slide] || '');
  }, [slide, notes]);

  // Listen to live viewers presence from Firebase RTDB
  useEffect(() => {
    if (!isOpen || !isLive) {
      setActiveViewers(0);
      return;
    }
    const viewersRef = ref(rtdb, `live_sessions/${module.id}/viewers`);
    const unsubscribe = onValue(viewersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data === 'object') {
        setActiveViewers(Object.keys(data).length);
      } else if (typeof data === 'number') {
        setActiveViewers(data);
      } else {
        setActiveViewers(session?.viewersCount || 0);
      }
    });

    return () => unsubscribe();
  }, [isOpen, isLive, module.id, session?.viewersCount]);

  const handleNoteChange = (text: string) => {
    setCurrentNote(text);
    setNotes((prev) => ({ ...prev, [slide]: text }));
  };

  // BroadcastChannel for macOS Dual Screen Pop-up
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    channelRef.current = new BroadcastChannel('bt_presenter_dual_screen');

    return () => {
      channelRef.current?.close();
    };
  }, []);

  // Wireless Remote Clicker Keyboard Support in Presenter Mode
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const nextKeys = ['ArrowRight', 'ArrowDown', 'PageDown', 'Space', 'n', 'N'];
      const prevKeys = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace', 'p', 'P'];

      if (nextKeys.includes(e.key)) {
        e.preventDefault();
        if (slide < total) goToSlide(slide + 1);
      } else if (prevKeys.includes(e.key)) {
        e.preventDefault();
        if (slide > 1) goToSlide(slide - 1);
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGrid((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (showGrid) {
          setShowGrid(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slide, total, goToSlide, onClose, showGrid]);

  // macOS Trackpad Two-Finger Horizontal Sticky Swipe Gesture
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swipeDeltaRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.closest('#speaker-notes-textarea') || showGrid) return;

      // Check if it's primarily a horizontal two-finger trackpad swipe
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
        if (isTransitioningRef.current) return;

        setIsSwiping(true);
        // Swiping left moves slide left (-x), swiping right moves slide right (+x)
        swipeDeltaRef.current -= e.deltaX * 1.0;

        // Apply boundary resistance (rubber-band) if at first or last slide
        let effectiveOffset = swipeDeltaRef.current;
        if ((slide === 1 && effectiveOffset > 0) || (slide === total && effectiveOffset < 0)) {
          effectiveOffset = effectiveOffset * 0.25;
        }

        const clampedOffset = Math.max(-250, Math.min(250, effectiveOffset));
        setDragOffset(clampedOffset);

        if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          const threshold = 60;
          if (swipeDeltaRef.current < -threshold && slide < total) {
            isTransitioningRef.current = true;
            goToSlide(slide + 1);
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 300);
          } else if (swipeDeltaRef.current > threshold && slide > 1) {
            isTransitioningRef.current = true;
            goToSlide(slide - 1);
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 300);
          }

          // Spring bounce back to center
          swipeDeltaRef.current = 0;
          setDragOffset(0);
          setIsSwiping(false);
        }, 110);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [isOpen, slide, total, goToSlide, showGrid]);

  // Broadcast state to audience window whenever slide/lang changes
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'SYNC_SLIDE',
        slide,
        lang,
        slideImageUrl,
        moduleId: module.id,
      });
    }
  }, [slide, lang, slideImageUrl, module.id]);

  // Launch Audience Display Window (for Mac Secondary Screen / External Monitor)
  const openAudienceWindow = () => {
    setPopupBlocked(false);
    const width = 1280;
    const height = 720;
    const left = window.screen.width ? window.screen.width : 0;
    const top = 0;

    try {
      const popup = window.open(
        `/${lang}/learn/${module.id}?slide=${slide}&embedded=true&audienceView=true`,
        'BrainTradeAudienceWindow',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setPopupBlocked(true);
      } else {
        setAudienceWindow(popup);
      }
    } catch {
      setPopupBlocked(true);
    }
  };

  if (!isOpen) return null;

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    const hrs = Math.floor(mins / 60);
    const displayMins = mins % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(displayMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(displayMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getNoteFontClass = () => {
    switch (noteFontSize) {
      case 'sm': return 'text-xs leading-relaxed';
      case 'base': return 'text-sm leading-relaxed';
      case 'lg': return 'text-base leading-relaxed';
      case 'xl': return 'text-lg leading-loose';
      default: return 'text-sm leading-relaxed';
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="presenter-view-title"
        className="fixed inset-0 z-[10000] flex flex-col bg-slate-950 text-white font-sans overflow-hidden select-none"
      >
        {/* -- Presenter Mode Top Bar -- */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-md gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0">
              <BookOpen size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="presenter-view-title" className="text-sm font-black tracking-tight text-slate-100 truncate">
                {title}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 truncate">
                {lang === 'th' ? 'โหมดผู้สอน (macOS Presenter View)' : 'macOS Presenter View'}
              </p>
            </div>
          </div>

          {/* Timers & Status */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Live Trainee Audience Presence Counter */}
            {isLive && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400 animate-pulse">
                <Users size={13} aria-hidden="true" />
                <span>{activeViewers} {lang === 'th' ? 'ผู้เรียนกำลังรับชม' : 'Connected'}</span>
              </div>
            )}

            {/* Session Pacing & Timer Gauge */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-200 border border-slate-700">
              <Clock size={13} className="text-amber-400" aria-hidden="true" />
              <span className={elapsedSeconds > targetMinutes * 60 ? 'text-rose-400 font-black' : ''}>
                {formatElapsed(elapsedSeconds)}
              </span>
              <span className="text-slate-600">/</span>
              <select
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                aria-label="Target session duration"
                className="bg-transparent text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none text-[11px] font-bold"
              >
                <option value={15} className="bg-slate-900 text-white">15m Target</option>
                <option value={30} className="bg-slate-900 text-white">30m Target</option>
                <option value={45} className="bg-slate-900 text-white">45m Target</option>
                <option value={60} className="bg-slate-900 text-white">60m Target</option>
              </select>
              <span className="text-slate-600" aria-hidden="true">|</span>
              <span className="text-slate-400">{currentTime}</span>
            </div>

            {/* Live Indicator */}
            <button
              onClick={() => (isLive ? stopLive() : startLive(slide, lang))}
              aria-label={
                isLive
                  ? lang === 'th'
                    ? 'จบการถ่ายทอดสด'
                    : 'Stop Live Broadcast'
                  : lang === 'th'
                    ? 'เริ่มถ่ายทอดสด'
                    : 'Go Live Broadcast'
              }
              aria-pressed={isLive}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isLive
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isLive ? <Square size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              <span>{isLive ? (lang === 'th' ? 'จบการถ่ายทอด' : 'Stop Live') : (lang === 'th' ? 'เริ่มถ่ายทอดสด' : 'Go Live')}</span>
            </button>

            {/* Dual Screen / Audience Pop-up */}
            <button
              onClick={openAudienceWindow}
              aria-label={
                audienceWindow && !audienceWindow.closed
                  ? lang === 'th'
                    ? 'หน้าต่างผู้เรียนกำลังเปิดใช้งาน'
                    : 'Audience display window is active'
                  : lang === 'th'
                    ? 'เปิดหน้าต่างผู้เรียนสำหรับจอเสริม'
                    : 'Launch audience window for external monitor'
              }
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                audienceWindow && !audienceWindow.closed
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Open Audience Window for Mac External Monitor / Projector"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span className="hidden md:inline">
                {audienceWindow && !audienceWindow.closed
                  ? (lang === 'th' ? 'จอผู้เรียนเปิดอยู่' : 'Audience Window Active')
                  : (lang === 'th' ? 'เปิดจอผู้เรียน (Dual Screen)' : 'Dual Screen')}
              </span>
            </button>

            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle notes sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title={isSidebarOpen ? 'Maximize Slide View' : 'Show Notes & Next Slide'}
            >
              {isSidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>

            <button
              onClick={onClose}
              aria-label={lang === 'th' ? 'ปิดโหมดผู้สอน' : 'Close presenter view'}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Popup Blocked Alert Banner */}
        {popupBlocked && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400 shrink-0" />
              <span>
                {lang === 'th'
                  ? 'หน้าต่างแสดงผลผู้เรียนถูกบล็อกโดยเบราว์เซอร์ กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้เพื่อแสดงผลบนจอเสริม'
                  : 'Audience window popup was blocked by your browser. Please allow popups for this site to enable secondary screen projection.'}
              </span>
            </div>
            <button
              onClick={() => setPopupBlocked(false)}
              className="text-amber-400 hover:text-white text-xs font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* -- Main Presenter Body -- */}
        <div className="flex flex-1 overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4">
          {/* LEFT/CENTER: Current Main Slide + Toolbar (Adaptive Container) */}
          <div className="flex flex-1 flex-col gap-3 min-w-0 h-full">
            <div className="relative flex-1 rounded-2xl border border-slate-800 bg-black overflow-hidden shadow-2xl flex items-center justify-center min-h-0">
              <motion.div
                className={`relative w-full h-full flex items-center justify-center select-none ${
                  activeTool ? '' : 'cursor-grab active:cursor-grabbing'
                }`}
                drag={activeTool ? false : 'x'}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_e, info) => {
                  const threshold = 60;
                  const velocityThreshold = 250;
                  const offset = info.offset.x;
                  const velocity = info.velocity.x;

                  if (offset < -threshold || velocity < -velocityThreshold) {
                    if (slide < total) goToSlide(slide + 1);
                  } else if (offset > threshold || velocity > velocityThreshold) {
                    if (slide > 1) goToSlide(slide - 1);
                  }
                }}
                animate={{ x: dragOffset }}
                transition={
                  isSwiping
                    ? { type: 'tween', duration: 0.04 }
                    : { type: 'spring', stiffness: 400, damping: 32 }
                }
              >
                <img
                  src={slideImageUrl}
                  alt={lang === 'th' ? `สไลด์ปัจจุบันที่ ${slide} จาก ${total}` : `Current slide ${slide} of ${total}`}
                  className="max-h-full max-w-full object-contain pointer-events-none select-none"
                  draggable={false}
                />
                <DrawingCanvas
                  isTrainer={true}
                  isActive={true}
                  mode={activeTool}
                  color={penColor}
                  drawings={session?.drawings || []}
                  laserPos={session?.laserPos || null}
                  onDrawEnd={addDrawingPath}
                  onLaserMove={updateLaser}
                />
              </motion.div>
            </div>

            {/* Slide Navigation & Canvas Toolbar */}
            <div
              role="toolbar"
              aria-label={lang === 'th' ? 'การนำทางและเครื่องมือวาด' : 'Slide navigation and drawing tools'}
              className="flex h-14 shrink-0 items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-3 sm:px-4"
            >
              {/* Prev / Next Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  disabled={slide <= 1}
                  onClick={() => goToSlide(slide - 1)}
                  aria-label={lang === 'th' ? 'สไลด์ก่อนหน้า' : 'Previous slide'}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white transition-all active:scale-95 disabled:opacity-30 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <span className="text-xs sm:text-sm font-black text-slate-200 px-1 sm:px-2 font-mono" aria-live="polite">
                  {slide} / {total}
                </span>
                <button
                  disabled={slide >= total}
                  onClick={() => goToSlide(slide + 1)}
                  aria-label={lang === 'th' ? 'สไลด์ถัดไป' : 'Next slide'}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition-all active:scale-95 disabled:opacity-30 hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>

                <button
                  onClick={() => setShowGrid(!showGrid)}
                  aria-label={lang === 'th' ? 'เปิดผังเลือกสไลด์' : 'Toggle slide grid picker'}
                  aria-expanded={showGrid}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    showGrid
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Slide Grid Picker (G)"
                >
                  <Grid size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Drawing Tools */}
              <div
                role="group"
                aria-label={lang === 'th' ? 'เครื่องมือคำอธิบายภาพ' : 'Annotation tools'}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 p-1 border border-slate-700"
              >
                <button
                  onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
                  aria-label={lang === 'th' ? 'เครื่องมือปากกา' : 'Pen tool'}
                  aria-pressed={activeTool === 'pen'}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeTool === 'pen' ? 'bg-primary text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title="Pen Tool"
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>

                {/* Pen Color Palette */}
                {activeTool === 'pen' && (
                  <div className="flex items-center gap-1 px-1 border-l border-slate-700">
                    {[
                      { color: '#ef4444', label: 'Red' },
                      { color: '#f59e0b', label: 'Amber' },
                      { color: '#10b981', label: 'Green' },
                      { color: '#38bdf8', label: 'Sky' },
                      { color: '#ffffff', label: 'White' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setPenColor(c.color)}
                        aria-label={`Pen color ${c.label}`}
                        className={`h-4 w-4 rounded-full transition-transform ${
                          penColor === c.color ? 'scale-125 ring-2 ring-white/80' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.color }}
                      />
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setActiveTool(activeTool === 'laser' ? null : 'laser')}
                  aria-label={lang === 'th' ? 'เครื่องมือเลเซอร์ชี้' : 'Laser pointer'}
                  aria-pressed={activeTool === 'laser'}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeTool === 'laser' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                  title="Laser Pointer"
                >
                  <Zap size={16} aria-hidden="true" />
                </button>

                <button
                  onClick={clearDrawings}
                  aria-label={lang === 'th' ? 'ล้างภาพวาดทั้งหมด' : 'Clear all drawings'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-700/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title="Clear Drawings"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Next Slide Preview + Speaker Notes (Adaptive Collapsible) */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex w-80 lg:w-96 flex-col gap-3 shrink-0 h-full overflow-hidden"
            >
              {/* NEXT SLIDE PREVIEW BOX */}
              <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-3.5 shadow-xl shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    {lang === 'th' ? 'สไลด์ถัดไป' : 'Next Slide'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {slide < total ? `Slide ${slide + 1}` : 'End'}
                  </span>
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center">
                  {nextSlideImageUrl ? (
                    <img
                      src={nextSlideImageUrl}
                      alt={lang === 'th' ? `สไลด์ถัดไปที่ ${slide + 1}` : `Preview of next slide ${slide + 1}`}
                      className="max-h-full max-w-full object-contain pointer-events-none select-none opacity-90"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-xs font-bold text-slate-400">
                        {lang === 'th' ? 'สิ้นสุดสไลด์บทเรียน' : 'Final Slide Reached'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SPEAKER NOTES AREA (Teleprompter Scalable) */}
              <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-3.5 shadow-xl min-h-0 overflow-hidden">
                <div className="flex items-center justify-between text-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-primary" aria-hidden="true" />
                    <label htmlFor="speaker-notes-textarea" className="text-xs font-black uppercase tracking-wider cursor-pointer">
                      {lang === 'th' ? 'โน้ตผู้สอน' : 'Notes'}
                    </label>
                  </div>

                  {/* Teleprompter Font Size Controls */}
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 text-[10px] font-mono font-bold">
                    <button
                      onClick={() => {
                        if (noteFontSize === 'xl') setNoteFontSize('lg');
                        else if (noteFontSize === 'lg') setNoteFontSize('base');
                        else if (noteFontSize === 'base') setNoteFontSize('sm');
                      }}
                      disabled={noteFontSize === 'sm'}
                      aria-label="Decrease note font size"
                      className="px-1.5 py-0.5 hover:text-primary disabled:opacity-30 transition-colors"
                      title="Smaller text"
                    >
                      A-
                    </button>
                    <span className="text-slate-500 font-normal">|</span>
                    <button
                      onClick={() => {
                        if (noteFontSize === 'sm') setNoteFontSize('base');
                        else if (noteFontSize === 'base') setNoteFontSize('lg');
                        else if (noteFontSize === 'lg') setNoteFontSize('xl');
                      }}
                      disabled={noteFontSize === 'xl'}
                      aria-label="Increase note font size"
                      className="px-1.5 py-0.5 hover:text-primary disabled:opacity-30 transition-colors"
                      title="Larger text (Podium)"
                    >
                      A+
                    </button>
                  </div>
                </div>

                <textarea
                  id="speaker-notes-textarea"
                  value={currentNote}
                  onChange={(e) => handleNoteChange(e.target.value)}
                  aria-label={lang === 'th' ? `โน้ตผู้สอนสำหรับสไลด์ที่ ${slide}` : `Presenter notes for slide ${slide}`}
                  placeholder={
                    lang === 'th'
                      ? `พิมพ์บันทึกย่อสำหรับสไลด์ที่ ${slide} ที่นี่...`
                      : `Add presenter notes for slide ${slide} here...`
                  }
                  className={`flex-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none ${getNoteFontClass()}`}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* VISUAL SLIDE GRID MATRIX MODAL */}
        <AnimatePresence>
          {showGrid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="slide-grid-title"
              className="absolute inset-x-4 top-16 bottom-4 z-50 rounded-3xl border border-slate-800 bg-slate-950/95 p-6 backdrop-blur-xl shadow-2xl overflow-y-auto flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 id="slide-grid-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Grid size={18} className="text-primary" />
                    <span>{lang === 'th' ? 'เลือกสไลด์ที่ต้องการ (Visual Slide Matrix)' : 'Jump to Slide (Visual Matrix)'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'th' ? `ทั้งหมด ${total} สไลด์ · กดที่ภาพเพื่อข้ามไปยังสไลด์ทันที` : `Total ${total} slides · Click any thumbnail to jump`}
                  </p>
                </div>
                <button
                  onClick={() => setShowGrid(false)}
                  aria-label={lang === 'th' ? 'ปิดผังเลือกสไลด์' : 'Close slide grid'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-2">
                {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
                  const pres = module.presentations[lang];
                  const thumbUrl = pres.slideUrls && pres.slideUrls[n - 1]
                    ? pres.slideUrls[n - 1]
                    : `/api/slide?page=${n}`;

                  return (
                    <button
                      key={n}
                      onClick={() => {
                        goToSlide(n);
                        setShowGrid(false);
                      }}
                      aria-label={lang === 'th' ? `ไปยังสไลด์ที่ ${n}` : `Jump to slide ${n}`}
                      aria-current={n === slide ? 'true' : undefined}
                      className={`group relative flex flex-col items-center gap-1.5 rounded-xl p-1.5 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        n === slide
                          ? 'border-primary bg-primary/20 ring-2 ring-primary/40 shadow-lg'
                          : 'border-slate-800 bg-slate-900 hover:border-primary/50 hover:bg-slate-850'
                      }`}
                    >
                      <div className="relative aspect-video w-full rounded-lg bg-black overflow-hidden flex items-center justify-center">
                        <img
                          src={thumbUrl}
                          alt={`Slide ${n}`}
                          className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-1 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-white z-10 backdrop-blur-xs">
                          #{n}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold ${n === slide ? 'text-primary font-black' : 'text-slate-300'}`}>
                        {lang === 'th' ? `สไลด์ ${n}` : `Slide ${n}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
