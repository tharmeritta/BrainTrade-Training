'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Language } from '@/lib/quiz-data';

export interface RankInfo {
  title: Record<Language, string>;
  icon: string;
  minXp: number;
  maxXp: number;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const RANKS: RankInfo[] = [
  {
    title: { en: 'Knowledge Novice', th: 'มือใหม่ผู้เริ่มต้น' },
    icon: '🎖️',
    minXp: 0,
    maxXp: 299,
    badgeBg: '#F3F4F6',
    badgeText: '#4B5563',
    badgeBorder: '#D1D5DB',
  },
  {
    title: { en: 'Novice Trader', th: 'นักเทรดฝึกหัด' },
    icon: '🌱',
    minXp: 300,
    maxXp: 699,
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    badgeBorder: '#BAE6FD',
  },
  {
    title: { en: 'Market Scholar', th: 'รอบรู้การตลาด' },
    icon: '⭐',
    minXp: 700,
    maxXp: 1199,
    badgeBg: '#FEF3C7',
    badgeText: '#B45309',
    badgeBorder: '#FDE68A',
  },
  {
    title: { en: 'Quiz Master', th: 'ปรมาจารย์ควิซ' },
    icon: '⚡',
    minXp: 1200,
    maxXp: 1799,
    badgeBg: '#F3E8FF',
    badgeText: '#6B21A8',
    badgeBorder: '#DDD6FE',
  },
  {
    title: { en: 'Brain Legend', th: 'ตำนานสมองเพชร' },
    icon: '👑',
    minXp: 1800,
    maxXp: Infinity,
    badgeBg: '#FCE7F3',
    badgeText: '#BE185D',
    badgeBorder: '#FBCFE8',
  },
];

export function getRankForXp(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRankProgress(xp: number): { nextRank: RankInfo | null; pct: number } {
  const currentRank = getRankForXp(xp);
  const currentIdx = RANKS.findIndex(r => r.minXp === currentRank.minXp);
  if (currentIdx === RANKS.length - 1) {
    return { nextRank: null, pct: 100 };
  }
  const nextRank = RANKS[currentIdx + 1];
  const range = nextRank.minXp - currentRank.minXp;
  const gained = xp - currentRank.minXp;
  const pct = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  return { nextRank, pct };
}

// --- Web Audio Synthesizer ----------------------------------------------------

export function playGamifiedSound(
  type:
    | 'correct'
    | 'wrong'
    | 'combo'
    | 'finish'
    | 'rankup'
    | 'heart-loss'
    | 'heart-shatter'
    | 'shield-gain'
    | 'shield-break'
) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.22);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(85, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'heart-loss' || type === 'heart-shatter') {
      // Low impact pitch drop (heart break)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'shield-gain') {
      // Ascending chime (G5 -> C6 -> E6 -> G6)
      const notes = [783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.28);
      });
    } else if (type === 'shield-break') {
      // High triangle shatter drop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'combo') {
      const notes = [659.25, 783.99, 1046.50, 1318.51]; // E5, G5, C6, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.16, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.25);
      });
    } else if (type === 'finish' || type === 'rankup') {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.35);
      });
    }
  } catch {
    // Soft fallback if Web Audio is restricted
  }
}

export function triggerHaptic(
  type: 'correct' | 'wrong' | 'combo' | 'heart-loss' | 'shield-gain' | 'shield-break'
) {
  if (typeof window === 'undefined' || !window.navigator?.vibrate) return;
  try {
    if (type === 'correct') {
      window.navigator.vibrate([40]);
    } else if (type === 'combo') {
      window.navigator.vibrate([40, 30, 60]);
    } else if (type === 'wrong') {
      window.navigator.vibrate([80, 40, 80]);
    } else if (type === 'heart-loss') {
      window.navigator.vibrate([120, 50, 150]);
    } else if (type === 'shield-gain') {
      window.navigator.vibrate([30, 40, 50]);
    } else if (type === 'shield-break') {
      window.navigator.vibrate([60, 30, 60, 30, 90]);
    }
  } catch {
    // Ignore unsupported haptic errors
  }
}

// --- Hearts & Gamification Badges -------------------------------------------

export function HeartLivesIndicator({ lives = 3, maxLives = 3 }: { lives?: number; maxLives?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-sm">
      {Array.from({ length: maxLives }).map((_, i) => {
        const active = i < lives;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={
              active
                ? { scale: [1, 1.25, 1] }
                : { scale: [1, 0.5, 0.8], opacity: [1, 0.4, 0.25], rotate: [0, -15, 0] }
            }
            transition={{ duration: 0.4 }}
            className="text-sm select-none inline-block"
            title={`Heart ${i + 1}`}
          >
            {active ? '❤️' : '💔'}
          </motion.span>
        );
      })}
    </div>
  );
}

export function StreakShieldBadge({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-black text-cyan-600 dark:text-cyan-400 tracking-wider uppercase shadow-sm animate-pulse"
    >
      <span>🛡️</span>
      <span>Shield Active</span>
    </motion.div>
  );
}

// --- Confetti & Sound Visualizers --------------------------------------------

export function ConfettiBurst({ active }: { active: boolean }) {
  const particles = useMemo(() => {
    if (!active) return [];
    const colors = ['#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#10B981'];
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 120 + (i % 5) * 25;
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius - 40,
        rotation: i * 35,
        scale: 0.6 + (i % 4) * 0.15,
        color: colors[i % colors.length],
      };
    });
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30 flex items-center justify-center">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: p.scale,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-3 h-3 rounded-sm shadow-sm"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}

export function SoundWaveIndicator({ isPlaying = true }: { isPlaying?: boolean }) {
  return (
    <div className="flex items-center gap-1 h-4 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
      {[0.4, 0.9, 0.6, 1, 0.5].map((h, i) => (
        <motion.span
          key={i}
          className="w-0.5 bg-emerald-500 rounded-full"
          animate={isPlaying ? { height: ['20%', `${h * 100}%`, '20%'] } : { height: '20%' }}
          transition={{
            duration: 0.4 + i * 0.1,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          style={{ height: '20%', minHeight: '3px' }}
        />
      ))}
    </div>
  );
}
