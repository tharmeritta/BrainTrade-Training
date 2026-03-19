'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Send, User as UserIcon, Bot, ChevronLeft, Play, Sparkles,
  CheckCircle2, Trophy, ThumbsUp, TrendingUp, RotateCcw, Loader2,
  ArrowRight, LayoutDashboard, Lock, History, ChevronRight, type LucideIcon,
} from 'lucide-react';

import type { PitchMessage } from '@/types';
import { getAgentSession } from '@/lib/agent-session';
import { FADE_IN, STAGGER_CONTAINER, STAGGER_ITEM, TRANSITION, EASE } from '@/lib/animations';

// ─── Constants & Types ────────────────────────────────────────────────────────

const SESSION_KEY = 'brainstrade_pitch_active';

const LEVEL_COLORS: Record<number, { accent: string; glow: string; bg: string; border: string; label: string }> = {
  1: { accent: '#22D3EE', glow: 'rgba(34,211,238,0.18)',  bg: 'rgba(34,211,238,0.08)',  border: 'rgba(34,211,238,0.3)',  label: 'Beginner'     },
  2: { accent: '#60A5FA', glow: 'rgba(96,165,250,0.18)',  bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.3)',  label: 'Standard'     },
  3: { accent: '#F472B6', glow: 'rgba(244,114,182,0.18)', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.3)', label: 'Advanced'     },
};

const LEVEL_LABELS: Record<number, { th: string; desc: string }> = {
  1: { th: 'เริ่มต้น',  desc: 'ลูกค้าชาวเวียดนาม ปานกลาง' },
  2: { th: 'มาตรฐาน', desc: 'ลูกค้าหลากหลาย สถานการณ์ซับซ้อน' },
  3: { th: 'ท้าทาย',  desc: 'ลูกค้าจิตวิทยาขั้นสูง ยากที่สุด' },
};

type PitchLevel = 1 | 2 | 3;

interface SavedSession {
  agentId: string;
  sessionId: string;
  level: PitchLevel;
  messages: PitchMessage[];
  savedAt: number;
}

interface Evaluation {
  reason: string;
  strengths?: string[];
  weaknesses?: string[];
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface LevelCardProps {
  l: PitchLevel;
  index: number;
  locked: boolean;
  completed: boolean;
  selected: boolean;
  onSelect: (l: PitchLevel) => void;
}

interface EvaluationViewProps {
  evaluation: Evaluation;
  level: number;
  messages: PitchMessage[];
  onRetry: () => void;
  onNext: () => void;
  onDashboard: () => void;
  chatAccent: string;
  chatGlow: string;
}

interface SelectionScreenProps {
  level: PitchLevel;
  setLevel: (l: PitchLevel) => void;
  agentName: string | null;
  loading: boolean;
  completedLevels: Set<number>;
  pendingResume: SavedSession | null;
  startError: string;
  onStart: () => void;
  onResume: (s: SavedSession) => void;
  onClearSession: () => void;
  isLocked: (l: number) => boolean;
}

interface ChatScreenProps {
  level: PitchLevel;
  messages: PitchMessage[];
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  closedSale: boolean;
  evaluating: boolean;
  evaluation: Evaluation | null;
  chatError: string;
  onSend: () => void;
  onAbandon: () => void;
  onRetry: () => void;
  onNext: () => void;
  onDashboard: () => void;
  bottomRef: React.RefObject<HTMLDivElement>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * LevelCard: Individual level selection card
 */
const LevelCard = memo(({ 
  l, index, locked, completed, selected, onSelect 
}: LevelCardProps) => {
  const cfg = LEVEL_COLORS[l];
  
  return (
    <motion.button
      onClick={() => !locked && onSelect(l)}
      disabled={locked}
      variants={STAGGER_ITEM}
      custom={index}
      className="relative text-left rounded-[24px] p-6 transition-all duration-300 overflow-hidden h-full flex flex-col border-2"
      style={{
        background: locked ? 'var(--hub-locked-bg)' : selected ? cfg.bg : 'var(--hub-card)',
        borderColor: locked ? 'var(--hub-dim-border)' : selected ? cfg.accent : 'var(--hub-border)',
        opacity: locked ? 0.5 : 1,
        boxShadow: selected && !locked ? `0 12px 48px ${cfg.glow}` : 'none',
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
      whileHover={!locked ? { y: -6, boxShadow: `0 20px 60px ${cfg.glow}` } : {}}
      whileTap={!locked ? { scale: 0.97 } : {}}
    >
      <div className="absolute top-4 right-4">
        {locked ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 border border-white/10 backdrop-blur-md">
            <Lock size={18} className="text-muted-foreground/40" />
          </div>
        ) : completed ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 size={16} className="text-white" />
          </div>
        ) : selected ? (
          <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]"
            style={{ background: cfg.accent }} />
        ) : null}
      </div>

      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-inner"
        style={{
          background: locked ? 'var(--hub-locked-icon)' : `${cfg.accent}15`,
          borderColor: locked ? 'var(--hub-dim-border)' : cfg.accent + '30',
        }}>
        <Sparkles size={24} style={{ color: locked ? 'var(--hub-dim)' : cfg.accent }} />
      </div>

      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-xl font-black tracking-tight text-[color:var(--hub-text)]" style={{ color: locked ? 'var(--hub-dim)' : undefined }}>
          Level {l}
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60"
          style={{ color: locked ? 'var(--hub-dim)' : cfg.accent }}>
          {cfg.label}
        </span>
      </div>
      <p className="text-sm font-black mb-1 text-[color:var(--hub-text)]" style={{ color: locked ? 'var(--hub-dim)' : undefined }}>
        {LEVEL_LABELS[l].th}
      </p>
      <p className="text-[11px] font-medium leading-relaxed opacity-70 flex-1 text-[color:var(--hub-muted)]" style={{ color: locked ? 'var(--hub-dim)' : undefined }}>
        {locked ? `ต้องการผ่าน Level ${l - 1} ก่อนเริ่มการฝึก` : LEVEL_LABELS[l].desc}
      </p>

      {selected && !locked && (
        <motion.div
          layoutId="level-selected-bar"
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: cfg.accent }}
        />
      )}
    </motion.button>
  );
});

LevelCard.displayName = 'LevelCard';

/**
 * MessageBubble: Sub-component for individual messages
 */
const MessageBubble = memo(({ m, chatAccent }: { m: PitchMessage; chatAccent: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
  >
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border mb-1 shadow-sm ${
      m.role === 'user' 
        ? 'bg-primary border-primary/20 text-white' 
        : 'bg-card border-black/5 dark:border-white/10 text-muted-foreground'
    }`}>
      {m.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
    </div>
    <div className={`max-w-[80%] px-6 py-4 rounded-[24px] text-sm leading-relaxed shadow-sm font-medium border ${
      m.role === 'user' 
        ? 'rounded-br-none text-white border border-primary/10' 
        : 'rounded-bl-none bg-card border border-black/5 dark:border-white/10 text-foreground'
    }`}
    style={m.role === 'user' ? { background: chatAccent } : {}}>
      {m.content}
    </div>
  </motion.div>
));

MessageBubble.displayName = 'MessageBubble';

/**
 * EvaluationView: Detailed feedback after closing a sale
 */
const EvaluationView = memo(({ 
  evaluation, level, messages, onRetry, onNext, onDashboard, chatAccent, chatGlow 
}: EvaluationViewProps) => (
  <motion.div
    variants={FADE_IN}
    initial="initial"
    animate="animate"
    className="space-y-5"
  >
    <div className="rounded-[28px] p-6 bg-[color:var(--hub-card)] border border-[color:var(--hub-border)] shadow-xl shadow-black/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
          <Sparkles size={20} className="text-amber-600" />
        </div>
        <h3 className="font-black text-base text-[color:var(--hub-text)] uppercase tracking-tight">ทำไมลูกค้าถึงตัดสินใจซื้อ</h3>
      </div>
      <p className="text-sm leading-relaxed text-[color:var(--hub-muted)] font-medium italic">&quot;{evaluation.reason}&quot;</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="rounded-[28px] p-6 bg-white dark:bg-white/5 border border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5">
        <div className="flex items-center gap-3 mb-4 text-blue-600">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <ThumbsUp size={20} />
          </div>
          <h3 className="font-black text-base uppercase tracking-tight">จุดแข็งของคุณ</h3>
        </div>
        <ul className="space-y-3">
          {(evaluation.strengths || []).map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-bold text-[color:var(--hub-text)]">
              <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-black border border-blue-200/50">
                {i + 1}
              </span>
              <span className="mt-0.5">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[28px] p-6 bg-white dark:bg-white/5 border border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <h3 className="font-black text-base uppercase tracking-tight">สิ่งที่ควรพัฒนา</h3>
        </div>
        <ul className="space-y-3">
          {(evaluation.weaknesses || []).map((w, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-bold text-[color:var(--hub-text)]">
              <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shrink-0 text-[10px] font-black border border-amber-200/50">
                {i + 1}
              </span>
              <span className="mt-0.5">{w}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <button
        onClick={onRetry}
        className="flex-1 flex items-center justify-center gap-2 py-5 rounded-[24px] font-black text-sm transition-all bg-secondary/50 hover:bg-secondary border border-black/5 text-muted-foreground hover:text-foreground active:scale-95 shadow-lg"
      >
        <RotateCcw size={18} />
        ฝึกใหม่ที่ Level {level}
      </button>

      {level < 3 ? (
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-5 rounded-[24px] font-black text-sm transition-all text-white active:scale-95 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${LEVEL_COLORS[level + 1].accent}, ${LEVEL_COLORS[level + 1].accent}BB)`,
            boxShadow: `0 12px 32px ${LEVEL_COLORS[level + 1].glow}`,
          }}
        >
          ไปต่อ Level {level + 1} — {LEVEL_LABELS[level + 1].th}
          <ArrowRight size={20} />
        </button>
      ) : (
        <button
          onClick={onDashboard}
          className="flex-1 flex items-center justify-center gap-2 py-5 rounded-[24px] font-black text-sm transition-all text-white bg-foreground hover:bg-primary shadow-xl active:scale-95"
        >
          <LayoutDashboard size={18} />
          กลับสู่แดชบอร์ดหลัก
        </button>
      )}
    </div>

    <details className="rounded-2xl overflow-hidden mt-4 border-2 border-black/5 dark:border-white/5 transition-all">
      <summary className="px-6 py-4 cursor-pointer text-xs font-black uppercase tracking-widest select-none text-muted-foreground hover:bg-secondary/30 flex items-center justify-between">
        ดูบันทึกบทสนทนา ({messages.length} ข้อความ)
        <ChevronRight size={14} className="opacity-40" />
      </summary>
      <div className="border-t max-h-80 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/50 dark:bg-black/20"
        style={{ borderColor: 'var(--hub-border)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-xs px-4 py-3 rounded-2xl font-medium leading-relaxed whitespace-pre-wrap shadow-sm border"
              style={m.role === 'user'
                ? { background: chatAccent, color: '#fff', borderColor: 'transparent' }
                : { background: 'var(--hub-card)', borderColor: 'var(--hub-border)', color: 'var(--hub-text)' }
              }>
              {m.content}
            </div>
          </div>
        ))}
      </div>
    </details>
  </motion.div>
));

EvaluationView.displayName = 'EvaluationView';

/**
 * SelectionScreen: Wrapping the selection logic
 */
const SelectionScreen = memo(({
  level, setLevel, agentName, loading, completedLevels,
  pendingResume, startError, onStart, onResume, onClearSession, isLocked
}: SelectionScreenProps) => {
  const cfg = LEVEL_COLORS[level];

  return (
    <div className="min-h-[calc(100dvh-72px)] relative overflow-x-hidden bg-[color:var(--hub-bg)] selection:bg-primary/20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute w-[800px] h-[800px] -top-[300px] left-1/2 -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <motion.div variants={FADE_IN} initial="initial" animate="animate" className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Training Mission 04</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-[color:var(--hub-text)] mb-3 uppercase">Pitch Simulator</h1>
            <p className="text-muted-foreground text-lg max-w-lg font-medium leading-relaxed opacity-80">
              ทดสอบทักษะการนำเสนอและการปิดการขายกับลูกค้า AI ในสถานการณ์ที่สมจริงที่สุด
            </p>
          </div>
          
          {agentName && (
            <div className="flex items-center gap-4 px-6 py-3 rounded-[24px] bg-white/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xl shadow-black/5 self-start md:self-auto">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <UserIcon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Active Agent</p>
                <p className="font-black text-base">{agentName}</p>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {pendingResume && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 overflow-hidden rounded-[32px] bg-primary/5 border-2 border-primary/20 shadow-2xl shadow-primary/5 p-1"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 px-8 py-6">
                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                  <History size={28} className="text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="font-black text-xl text-foreground uppercase tracking-tight">เซสชันที่ค้างอยู่</p>
                  <p className="text-sm font-bold text-muted-foreground mt-1 opacity-80">
                    Level {pendingResume.level} ({LEVEL_LABELS[pendingResume.level].th}) {' · '} 
                    {pendingResume.messages.length} ข้อความ {' · '}
                    ล่าสุดเมื่อ {new Date(pendingResume.savedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={onClearSession}
                    className="text-xs px-6 py-3 rounded-[18px] font-black uppercase tracking-widest transition-all text-muted-foreground hover:bg-rose-50 hover:text-rose-500 border border-black/5"
                  >
                    ทิ้ง
                  </button>
                  <motion.button
                    onClick={() => onResume(pendingResume)}
                    className="text-sm px-8 py-3.5 rounded-[18px] font-black text-white bg-primary shadow-xl shadow-primary/30 uppercase tracking-widest"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    กลับมาต่อ →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {([1, 2, 3] as const).map((l, i) => (
            <LevelCard
              key={l}
              l={l}
              index={i}
              locked={isLocked(l)}
              completed={completedLevels.has(l)}
              selected={level === l}
              onSelect={setLevel}
            />
          ))}
        </motion.div>

        <motion.div variants={FADE_IN} initial="initial" animate="animate" className="flex flex-col items-center gap-6">
          <motion.button
            onClick={onStart}
            disabled={loading || isLocked(level)}
            className="group relative flex items-center gap-4 px-16 py-6 rounded-[2.5rem] font-black text-xl text-white overflow-hidden disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accent}BB)`,
              boxShadow: `0 16px 40px ${cfg.glow}`,
            }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: `0 24px 60px ${cfg.glow}` }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="relative flex items-center gap-4">
              {loading ? <Loader2 size={28} className="animate-spin" /> : <Play size={28} className="fill-current group-hover:scale-110 transition-transform" />}
              <span className="uppercase tracking-[0.1em]">{loading ? 'Connecting AI...' : `เริ่มภารกิจ Level ${level}`}</span>
            </div>
          </motion.button>
          
          {startError && (
            <p className="text-sm font-black text-rose-500 animate-pulse bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 uppercase tracking-widest">{startError}</p>
          )}
          
          {!loading && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 animate-bounce">
              Click to initiate simulated call
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
});

SelectionScreen.displayName = 'SelectionScreen';

/**
 * ChatScreen: Wrapping the chat simulation logic
 */
const ChatScreen = memo(({
  level, messages, input, setInput, loading, closedSale, evaluating, evaluation, chatError,
  onSend, onAbandon, onRetry, onNext, onDashboard, bottomRef
}: ChatScreenProps) => {
  const cfg = LEVEL_COLORS[level];
  const chatAccent = cfg.accent;
  const chatGlow   = cfg.glow;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  return (
    <div className="min-h-[calc(100dvh-72px)] relative bg-[color:var(--hub-bg)] selection:bg-primary/20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[700px] h-[700px] -top-20 -right-20 rounded-full opacity-40 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${chatGlow} 0%, transparent 70%)` }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 h-[calc(100dvh-100px)] flex flex-col">
        <motion.div
          variants={FADE_IN}
          initial="initial"
          animate="animate"
          className="flex-1 bg-[color:var(--hub-card)] rounded-[3rem] border border-[color:var(--hub-border)] shadow-2xl flex flex-col overflow-hidden"
          style={{
            borderColor: closedSale ? `${chatAccent}50` : undefined,
            boxShadow: closedSale ? `0 24px 80px ${chatGlow}` : undefined,
          }}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[color:var(--hub-border)] bg-secondary/20 backdrop-blur-md flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-2xl shadow-inner transition-all duration-500"
                style={{
                  background: closedSale ? `${chatAccent}25` : `${chatAccent}15`,
                  border: `2px solid ${chatAccent}40`,
                  color: chatAccent,
                }}>
                {closedSale ? <Trophy size={28} /> : level}
              </div>
              <div>
                <h3 className="font-black text-xl text-[color:var(--hub-text)] tracking-tight uppercase">
                  {LEVEL_LABELS[level].th}
                </h3>
                <div className="flex items-center gap-2.5 mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${closedSale ? '' : 'animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}
                    style={{ background: chatAccent }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: chatAccent }}>
                    {closedSale ? 'Sales Mission Accomplished' : 'Incoming Encrypted Signal'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onAbandon}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all border border-[color:var(--hub-border)] text-muted-foreground hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 shadow-sm"
            >
              <ChevronLeft size={16} />
              {closedSale ? 'Back to Selection' : 'Terminate Call'}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 bg-slate-50/20 dark:bg-black/10 custom-scrollbar">
            <AnimatePresence initial={false}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-sm">
                  <Sparkles size={20} className="text-primary" />
                </div>
                <div className="max-w-[85%] bg-primary/5 border border-primary/10 rounded-[24px] rounded-tl-none px-6 py-5 text-sm font-bold shadow-inner">
                  <p className="text-primary text-base mb-1 uppercase tracking-tight">Mission Briefing — Level {level}</p>
                  <p className="text-muted-foreground font-medium opacity-80 leading-relaxed italic">
                    &quot;ลูกค้ากำลังรอสายอยู่... กรุณาแนะนำตัวอย่างเป็นมืออาชีพและนำเสนอ SmartBrain AI อย่างมั่นใจ&quot;
                  </p>
                </div>
              </motion.div>

              {messages.map((m, i) => (
                <MessageBubble key={i} m={m} chatAccent={chatAccent} />
              ))}

              {closedSale && (
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="py-10 flex flex-col gap-8">
                  <div className="flex items-center gap-6 px-10 py-8 rounded-[32px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 shadow-2xl shadow-primary/10 self-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="w-16 h-16 rounded-[24px] bg-primary shadow-xl shadow-primary/30 flex items-center justify-center shrink-0 border-2 border-white/20">
                      <Trophy size={36} className="text-white drop-shadow-md" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-black text-foreground uppercase tracking-tight leading-none mb-1.5">ปิดการขายสำเร็จ!</h4>
                      <p className="text-sm font-bold text-muted-foreground opacity-80 italic">&quot;ลูกค้าตกลงซื้อและชำระเงินเรียบร้อยแล้ว&quot;</p>
                    </div>
                  </div>

                  {evaluating && (
                    <div className="flex flex-col items-center justify-center gap-4 py-10">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <span className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Analyzing Performance Data...</span>
                    </div>
                  )}

                  {evaluation && (
                    <EvaluationView
                      evaluation={evaluation}
                      level={level}
                      messages={messages}
                      onRetry={onRetry}
                      onNext={onNext}
                      onDashboard={onDashboard}
                      chatAccent={chatAccent}
                      chatGlow={chatGlow}
                    />
                  )}
                </motion.div>
              )}

              {loading && !closedSale && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-card border border-black/5 flex items-center justify-center text-muted-foreground shadow-sm">
                    <Bot size={20} />
                  </div>
                  <div className="px-6 py-4 rounded-[24px] rounded-bl-none bg-white dark:bg-white/5 border border-black/5 shadow-md flex gap-2 items-center">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div key={i}
                        className="w-2 h-2 rounded-full bg-primary/40"
                        animate={{ y: [0, -6, 0], scale: [1, 1.2, 1], backgroundColor: ['rgba(34,211,238,0.4)', 'rgba(34,211,238,0.8)', 'rgba(34,211,238,0.4)'] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} className="h-8" />
          </div>

          {/* Input Area */}
          {!closedSale && (
            <div className="px-8 py-8 bg-secondary/20 border-t border-[color:var(--hub-border)] shrink-0 shadow-[0_-12px_48px_rgba(0,0,0,0.02)]">
              {chatError && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-center font-black text-rose-500 uppercase tracking-widest mb-4">
                  {chatError}
                </motion.p>
              )}
              <div className="flex items-center gap-4 bg-[color:var(--hub-card)] border-2 border-transparent focus-within:border-primary/30 rounded-[28px] p-2.5 shadow-xl transition-all duration-300 group">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="พิมพ์ข้อความทักทายหรือตอบโต้ลูกค้า..."
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-5 py-3 text-sm font-bold placeholder:text-muted-foreground/40"
                />
                <motion.button
                  onClick={onSend}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 rounded-[20px] flex items-center justify-center text-white disabled:opacity-30 shadow-xl shadow-primary/20 group-focus-within:scale-105 active:scale-95 transition-all duration-300"
                  style={{ background: chatAccent }}
                >
                  <Send size={22} className="drop-shadow-sm" />
                </motion.button>
              </div>
              <p className="text-[9px] text-center mt-4 font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                Neural Pitch Engine v4.2 · System Active
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
});

ChatScreen.displayName = 'ChatScreen';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PitchSimulator() {
  const router   = useRouter();
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';

  const [level,      setLevel]      = useState<PitchLevel>(1);
  const [sessionId,  setSessionId]  = useState<string | null>(null);
  const [messages,   setMessages]   = useState<PitchMessage[]>([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [agentId,         setAgentId]         = useState<string | null>(null);
  const [agentName,       setAgentName]       = useState<string | null>(null);
  const [closedSale,      setClosedSale]      = useState(false);
  const [evaluation,      setEvaluation]      = useState<Evaluation | null>(null);
  const [evaluating,      setEvaluating]      = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [startError,    setStartError]    = useState('');
  const [chatError,     setChatError]     = useState('');
  const [pendingResume, setPendingResume] = useState<SavedSession | null>(null);
  
  const bottomRef    = useRef<HTMLDivElement>(null);
  const evalAbortRef = useRef(false);
  const loadingRef   = useRef(false);

  useEffect(() => {
    const session = getAgentSession();
    if (!session) return;

    const id   = session.id;
    const name = session.name;
    setAgentId(id);
    setAgentName(name);

    const local = localStorage.getItem('brainstrade_completed_levels');
    const localSet: Set<number> = local ? new Set(JSON.parse(local)) : new Set();
    if (localSet.size > 0) setCompletedLevels(localSet);

    if (id) {
      fetch(`/api/agent/progress?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data?.stats?.pitch?.completedLevels) return;
          const merged = new Set([...localSet, ...data.stats.pitch.completedLevels]);
          setCompletedLevels(merged);
          localStorage.setItem('brainstrade_completed_levels', JSON.stringify([...merged]));
        })
        .catch(() => {});
    }

    let hasLocalSession = false;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw && id) {
        const saved: SavedSession = JSON.parse(raw);
        const age = Date.now() - saved.savedAt;
        if (saved.agentId === id && saved.messages.length > 0 && age < 24 * 60 * 60 * 1000) {
          setPendingResume(saved);
          hasLocalSession = true;
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }

    if (id && !hasLocalSession) {
      fetch(`/api/pitch/active?agentId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const s = data?.session;
          if (s && s.messages?.length > 0) {
            const age = Date.now() - (s.savedAt ?? 0);
            if (age < 24 * 60 * 60 * 1000) {
              const saved: SavedSession = { 
                agentId: id, 
                sessionId: s.sessionId, 
                level: s.level as PitchLevel, 
                messages: s.messages, 
                savedAt: s.savedAt ?? Date.now() 
              };
              setPendingResume(saved);
              localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, loading, evaluating, evaluation, sessionId]);

  const clearSession = useCallback((id?: string | null) => {
    localStorage.removeItem(SESSION_KEY);
    const aid = id ?? agentId;
    if (aid) {
      fetch(`/api/pitch/active?agentId=${aid}`, { method: 'DELETE' }).catch(() => {});
    }
  }, [agentId]);

  const saveSession = useCallback((sid: string, lvl: PitchLevel, msgs: PitchMessage[], id: string | null) => {
    if (!id) return;
    const saved: SavedSession = { agentId: id, sessionId: sid, level: lvl, messages: msgs, savedAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(saved));
    fetch('/api/pitch/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: id, sessionId: sid, level: lvl, messages: msgs }),
    }).catch(() => {});
  }, []);

  const resumeSession = useCallback((saved: SavedSession) => {
    setLevel(saved.level);
    setSessionId(saved.sessionId);
    setMessages(saved.messages);
    setClosedSale(false);
    setEvaluation(null);
    setChatError('');
    setPendingResume(null);
    setEvaluating(false);
    evalAbortRef.current = false;
  }, []);

  const syncProgress = useCallback((completedSet: Set<number>, id: string | null, name: string | null) => {
    if (!id) return;
    fetch('/api/agent/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: id,
        agentName: name ?? '',
        pitchCompletedLevels: [...completedSet],
      }),
    }).catch(() => {});
  }, []);

  const markLevelCompleted = useCallback((l: number) => {
    setCompletedLevels(prev => {
      if (prev.has(l)) return prev;
      const next = new Set(prev);
      next.add(l);
      
      // Side effects in next tick to keep updater pure
      setTimeout(() => {
        localStorage.setItem('brainstrade_completed_levels', JSON.stringify([...next]));
        syncProgress(next, agentId, agentName);
      }, 0);
      
      return next;
    });
  }, [agentId, agentName, syncProgress]);

  const abandonSession = useCallback(() => {
    evalAbortRef.current = true;
    if (sessionId && messages.length > 0 && !closedSale) {
      fetch('/api/pitch/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages, agentId, agentName }),
      }).catch(() => {});
    }
    setSessionId(null);
    setMessages([]);
    setClosedSale(false);
    setEvaluation(null);
    setChatError('');
    setEvaluating(false);
  }, [sessionId, messages, closedSale, level, agentId, agentName]);

  const startSession = useCallback(async () => {
    if (loadingRef.current) return;
    setLoading(true);
    loadingRef.current = true;
    setStartError('');
    evalAbortRef.current = false;
    try {
      const res = await fetch('/api/pitch/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, agentId, agentName }),
      });
      if (!res.ok) throw new Error('Start failed');
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([]);
      setClosedSale(false);
      setEvaluation(null);
      setEvaluating(false);
    } catch {
      setStartError('ไม่สามารถเริ่มเซสชันได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [level, agentId, agentName]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !sessionId || loadingRef.current || closedSale) return;
    
    loadingRef.current = true;
    const userMsg: PitchMessage = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setChatError('');

    try {
      const res = await fetch('/api/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, level, messages: newMessages }),
      });
      if (!res.ok) throw new Error('Send failed');
      const data = await res.json();
      const aiMsg: PitchMessage = { role: 'assistant', content: data.reply, timestamp: new Date() };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      if (data.closedSale) {
        clearSession();
        setClosedSale(true);
        setLoading(false);
        loadingRef.current = false;
        markLevelCompleted(level);
        
        setTimeout(async () => {
          if (evalAbortRef.current) return;
          setEvaluating(true);
          try {
            const evalRes = await fetch('/api/pitch/evaluate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: finalMessages, level }),
            });
            const evalData = await evalRes.json();
            if (!evalAbortRef.current) setEvaluation(evalData);
          } catch (e) {
            console.error("Evaluation failed", e);
          } finally {
            if (!evalAbortRef.current) setEvaluating(false);
          }
        }, 800);
        return;
      }
      if (sessionId) saveSession(sessionId, level, finalMessages, agentId);
    } catch {
      setChatError('เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [input, sessionId, closedSale, messages, level, agentId, clearSession, markLevelCompleted, saveSession]);

  const isLocked = useCallback((l: number) => {
    if (l === 1) return false;
    return !completedLevels.has(l - 1);
  }, [completedLevels]);

  const handleNextLevel = useCallback(() => {
    evalAbortRef.current = true;
    setLevel((level + 1) as PitchLevel);
    setSessionId(null);
    setMessages([]);
    setClosedSale(false);
    setEvaluation(null);
    setChatError('');
  }, [level]);

  // ─── Render Logic ───────────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {!sessionId ? (
        <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <SelectionScreen
            level={level}
            setLevel={setLevel}
            agentName={agentName}
            loading={loading}
            completedLevels={completedLevels}
            pendingResume={pendingResume}
            startError={startError}
            onStart={startSession}
            onResume={resumeSession}
            onClearSession={() => { clearSession(); setPendingResume(null); }}
            isLocked={isLocked}
          />
        </motion.div>
      ) : (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ChatScreen
            level={level}
            messages={messages}
            input={input}
            setInput={setInput}
            loading={loading}
            closedSale={closedSale}
            evaluating={evaluating}
            evaluation={evaluation}
            chatError={chatError}
            onSend={sendMessage}
            onAbandon={abandonSession}
            onRetry={abandonSession}
            onNext={handleNextLevel}
            onDashboard={() => router.push(`/${locale}/dashboard`)}
            bottomRef={bottomRef}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
