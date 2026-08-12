/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [audienceWindow, setAudienceWindow] = useState<Window | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [currentNote, setCurrentNote] = useState<string>('');
  const [showGrid, setShowGrid] = useState(false);

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
    const width = 1280;
    const height = 720;
    const left = window.screen.width ? window.screen.width : 0;
    const top = 0;

    const popup = window.open(
      `/${lang}/learn/${module.id}?slide=${slide}&embedded=true&audienceView=true`,
      'BrainTradeAudienceWindow',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=yes`
    );

    if (popup) {
      setAudienceWindow(popup);
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="presenter-view-title"
        className="fixed inset-0 z-[10000] flex flex-col bg-slate-950 text-white font-sans overflow-hidden"
      >
        {/* -- Presenter Mode Top Bar -- */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <BookOpen size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 id="presenter-view-title" className="text-sm font-black tracking-tight text-slate-100">
                {title}
              </h2>
              <p className="text-[10px] font-bold text-slate-300">
                {lang === 'th' ? 'โหมดผู้สอน (macOS Presenter View)' : 'macOS Presenter View'}
              </p>
            </div>
          </div>

          {/* Timers & Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 text-xs font-mono text-slate-200 border border-slate-700">
              <Clock size={14} className="text-amber-400" aria-hidden="true" />
              <span>Elapsed: {formatElapsed(elapsedSeconds)}</span>
              <span className="text-slate-500" aria-hidden="true">|</span>
              <span className="text-slate-300">{currentTime}</span>
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
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
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
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                audienceWindow && !audienceWindow.closed
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title="Open Audience Window for Mac External Monitor / Projector"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span>
                {audienceWindow && !audienceWindow.closed
                  ? (lang === 'th' ? 'จอผู้เรียนเปิดอยู่' : 'Audience Window Active')
                  : (lang === 'th' ? 'เปิดจอผู้เรียน (Dual Screen)' : 'Launch Audience Window')}
              </span>
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

        {/* -- Main Presenter Body -- */}
        <div className="flex flex-1 overflow-hidden p-4 gap-4">
          {/* LEFT/CENTER: Current Main Slide + Toolbar */}
          <div className="flex flex-1 flex-col gap-3 min-w-0">
            <div className="relative flex-1 rounded-2xl border border-slate-800 bg-black overflow-hidden shadow-2xl flex items-center justify-center">
              <img
                src={slideImageUrl}
                alt={lang === 'th' ? `สไลด์ปัจจุบันที่ ${slide} จาก ${total}` : `Current slide ${slide} of ${total}`}
                className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none"
              />
              <DrawingCanvas
                isTrainer={true}
                isActive={true}
                mode={activeTool}
                drawings={session?.drawings || []}
                laserPos={session?.laserPos || null}
                onDrawEnd={addDrawingPath}
                onLaserMove={updateLaser}
              />
            </div>

            {/* Slide Navigation & Canvas Toolbar */}
            <div
              role="toolbar"
              aria-label={lang === 'th' ? 'การนำทางและเครื่องมือวาด' : 'Slide navigation and drawing tools'}
              className="flex h-14 items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4"
            >
              {/* Prev / Next Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={slide <= 1}
                  onClick={() => goToSlide(slide - 1)}
                  aria-label={lang === 'th' ? 'สไลด์ก่อนหน้า' : 'Previous slide'}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white transition-all active:scale-95 disabled:opacity-30 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <span className="text-sm font-black text-slate-200 px-2" aria-live="polite">
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
                  title="Slide Grid Picker"
                >
                  <Grid size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Drawing Tools */}
              <div
                role="group"
                aria-label={lang === 'th' ? 'เครื่องมือคำอธิบายภาพ' : 'Annotation tools'}
                className="flex items-center gap-2 rounded-xl bg-slate-800/80 p-1 border border-slate-700"
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

          {/* RIGHT SIDEBAR: Next Slide Preview + Speaker Notes */}
          <div className="flex w-96 flex-col gap-4 shrink-0">
            {/* NEXT SLIDE PREVIEW BOX */}
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {lang === 'th' ? 'สไลด์ถัดไป (Next Slide Preview)' : 'Next Slide Preview'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {slide < total ? `Slide ${slide + 1}` : 'End of Deck'}
                </span>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center">
                {nextSlideImageUrl ? (
                  <img
                    src={nextSlideImageUrl}
                    alt={lang === 'th' ? `สไลด์ถัดไปที่ ${slide + 1}` : `Preview of next slide ${slide + 1}`}
                    className="absolute inset-0 h-full w-full object-contain pointer-events-none select-none opacity-90"
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

            {/* SPEAKER NOTES AREA */}
            <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl min-h-0">
              <div className="flex items-center gap-2 text-slate-200">
                <FileText size={16} className="text-primary" aria-hidden="true" />
                <label htmlFor="speaker-notes-textarea" className="text-xs font-black uppercase tracking-wider cursor-pointer">
                  {lang === 'th' ? 'โน้ตสำหรับผู้สอน (Speaker Notes)' : 'Speaker Notes'}
                </label>
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
                className="flex-1 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SLIDE GRID MATRIX MODAL */}
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
              <div className="flex items-center justify-between">
                <h3 id="slide-grid-title" className="text-lg font-black text-white">
                  {lang === 'th' ? 'เลือกสไลด์ที่ต้องการ (Slide Selector)' : 'Jump to Slide'}
                </h3>
                <button
                  onClick={() => setShowGrid(false)}
                  aria-label={lang === 'th' ? 'ปิดผังเลือกสไลด์' : 'Close slide grid'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      goToSlide(n);
                      setShowGrid(false);
                    }}
                    aria-label={lang === 'th' ? `ไปยังสไลด์ที่ ${n}` : `Jump to slide ${n}`}
                    aria-current={n === slide ? 'true' : undefined}
                    className={`flex flex-col items-center gap-2 rounded-xl p-2 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      n === slide
                        ? 'border-primary bg-primary/20 ring-2 ring-primary/40'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="relative aspect-video w-full rounded-lg bg-black overflow-hidden flex items-center justify-center text-xs font-mono text-slate-400">
                      <span>Slide {n}</span>
                    </div>
                    <span className={`text-xs font-bold ${n === slide ? 'text-primary' : 'text-slate-300'}`}>
                      #{n}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
