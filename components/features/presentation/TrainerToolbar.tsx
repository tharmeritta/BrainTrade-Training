'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil,
  Zap,
  Trash2,
  Play,
  Square,
  Monitor,
  Settings,
  Radio,
  X,
  CheckCircle2,
  Cast,
} from 'lucide-react';
import type { CourseLang } from '@/lib/courses';

interface TrainerToolbarProps {
  isLive: boolean;
  activeTool: 'pen' | 'laser' | null;
  setActiveTool: (tool: 'pen' | 'laser' | null) => void;
  clearDrawings: () => void;
  startLive: (slide: number, lang: CourseLang) => void;
  stopLive: () => void;
  slide: number;
  lang: CourseLang;
  onOpenPresenterMode?: () => void;
}

export function TrainerToolbar({
  isLive,
  activeTool,
  setActiveTool,
  clearDrawings,
  startLive,
  stopLive,
  slide,
  lang,
  onOpenPresenterMode,
}: TrainerToolbarProps) {
  const [showPreflightDesk, setShowPreflightDesk] = useState(false);
  const [lastRemoteKey, setLastRemoteKey] = useState<string | null>(null);

  // Monitor key presses for remote clicker test inside Pre-Flight Desk & support Escape key
  useEffect(() => {
    if (!showPreflightDesk) return;

    const handleKeyTest = (e: KeyboardEvent) => {
      if (['PageDown', 'PageUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.key)) {
        setLastRemoteKey(e.key);
        setTimeout(() => setLastRemoteKey(null), 2000);
      } else if (e.key === 'Escape') {
        setShowPreflightDesk(false);
      }
    };

    window.addEventListener('keydown', handleKeyTest);
    return () => window.removeEventListener('keydown', handleKeyTest);
  }, [showPreflightDesk]);

  return (
    <div
      role="toolbar"
      aria-label={lang === 'th' ? 'แถบเครื่องมือผู้สอน' : 'Trainer controls toolbar'}
      className="absolute bottom-6 right-6 z-50 flex flex-col gap-2"
    >
      {/* Active Drawing Tools Bar */}
      <AnimatePresence>
        {isLive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="group"
            aria-label={lang === 'th' ? 'เครื่องมือคำอธิบายภาพ' : 'Annotation tools'}
            className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={() => setActiveTool(activeTool === 'pen' ? null : 'pen')}
              aria-label={lang === 'th' ? 'เครื่องมือปากกา' : 'Pen tool'}
              aria-pressed={activeTool === 'pen'}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeTool === 'pen' ? 'bg-primary text-white' : 'text-white hover:bg-white/10'
              }`}
              title="Pen Tool"
            >
              <Pencil size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'laser' ? null : 'laser')}
              aria-label={lang === 'th' ? 'เครื่องมือเลเซอร์ชี้' : 'Laser pointer'}
              aria-pressed={activeTool === 'laser'}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeTool === 'laser' ? 'bg-red-500 text-white' : 'text-white hover:bg-white/10'
              }`}
              title="Laser Pointer"
            >
              <Zap size={18} aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                clearDrawings();
                setActiveTool(null);
              }}
              aria-label={lang === 'th' ? 'ล้างภาพวาดทั้งหมด' : 'Clear all drawings'}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Clear All"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Launch Pre-Flight Desk Button */}
      <button
        onClick={() => setShowPreflightDesk(true)}
        aria-label={lang === 'th' ? 'เปิดศูนย์ควบคุมการสอน' : 'Open Trainer Pre-Flight Desk'}
        aria-expanded={showPreflightDesk}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 shadow-xl transition-all active:scale-95 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title="Trainer Pre-Flight Desk & Controls"
      >
        <Settings size={20} aria-hidden="true" />
      </button>

      {/* Main Go Live Toggle */}
      <button
        onClick={() => {
          if (isLive) {
            stopLive();
            setActiveTool(null);
          } else {
            startLive(slide, lang);
          }
        }}
        aria-label={
          isLive
            ? lang === 'th'
              ? 'จบการถ่ายทอดสด'
              : 'Stop live stream'
            : lang === 'th'
              ? 'เริ่มถ่ายทอดสด'
              : 'Start live stream'
        }
        aria-pressed={isLive}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isLive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-primary/90'
        }`}
        title={isLive ? 'Stop Live' : 'Go Live'}
      >
        {isLive ? <Square size={20} aria-hidden="true" /> : <Play size={20} aria-hidden="true" />}
      </button>

      {/* PRE-FLIGHT TRAINING MANAGEMENT DESK MODAL */}
      <AnimatePresence>
        {showPreflightDesk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preflight-desk-title"
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-white space-y-6 overflow-hidden relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                    <Cast size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="preflight-desk-title" className="text-base font-black text-slate-100">
                      {lang === 'th' ? 'ศูนย์ควบคุมการสอน (Trainer Pre-Flight Desk)' : 'Trainer Pre-Flight Desk'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {lang === 'th' ? 'เตรียมความพร้อมอุปกรณ์และการถ่ายทอดสด' : 'Presentation & Hardware Setup'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreflightDesk(false)}
                  aria-label={lang === 'th' ? 'ปิดศูนย์ควบคุมการสอน' : 'Close pre-flight desk'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Step 1: Presentation Mode */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  1. {lang === 'th' ? 'รูปแบบการนำเสนอ (Display Mode)' : 'Display Mode'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {onOpenPresenterMode && (
                    <button
                      onClick={() => {
                        setShowPreflightDesk(false);
                        onOpenPresenterMode();
                      }}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center hover:bg-primary/20 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <Monitor size={24} className="text-primary group-hover:scale-110 transition-transform" aria-hidden="true" />
                      <span className="text-xs font-bold text-slate-100">
                        {lang === 'th' ? 'โหมด 2 จอ (macOS Presenter)' : 'macOS Presenter View'}
                      </span>
                      <span className="text-[10px] text-slate-300">
                        {lang === 'th' ? 'โน้ต + จอผู้เรียนแยก' : 'Speaker Notes & Dual Screen'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (!isLive) startLive(slide, lang);
                      setShowPreflightDesk(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isLive
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <Radio size={24} className={isLive ? 'text-emerald-400' : 'text-slate-400'} aria-hidden="true" />
                    <span className="text-xs font-bold text-slate-100">
                      {isLive
                        ? (lang === 'th' ? 'กำลังถ่ายทอดสด' : 'Live Broadcast Active')
                        : (lang === 'th' ? 'เริ่มถ่ายทอดสด (Go Live)' : 'Start Live Broadcast')}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {lang === 'th' ? 'ส่งสัญญาณให้ผู้เรียนทุกเครื่อง' : 'Sync slide to trainees'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 2: Wireless Remote Clicker Status */}
              <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                    2. {lang === 'th' ? 'ทดสอบรีโมทไร้สาย (Wireless Remote)' : 'Wireless Clicker Test'}
                  </span>
                  {lastRemoteKey ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                      <CheckCircle2 size={12} aria-hidden="true" /> Key Detected: {lastRemoteKey}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      {lang === 'th' ? 'กดปุ่มบนรีโมทเพื่อทดสอบ' : 'Press clicker button to test'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {lang === 'th'
                    ? 'รองรับรีโมทนำเสนอทุกรุ่น (Logitech, Kensington, USB/Bluetooth) ใช้ปุ่ม PageUp / PageDown เปลี่ยนสไลด์ได้ทันที'
                    : 'Fully supports Logitech, Kensington & generic USB/Bluetooth clickers via PageUp / PageDown.'}
                </p>
              </div>

              {/* Step 3: Launch Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowPreflightDesk(false)}
                  className="w-full py-3.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider shadow-lg hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {lang === 'th' ? 'พร้อมเริ่มการสอน' : 'Start Presentation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
