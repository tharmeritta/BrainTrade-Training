'use client';

import { motion } from 'framer-motion';
import { User, Phone, ShieldAlert, Activity, Volume2 } from 'lucide-react';

interface CallSimulatorHudProps {
  customerName: string;
  scenarioTitle: string;
  mood: 'hostile' | 'skeptical' | 'hesitant' | 'interested' | string;
  turnCount: number;
  maxTurns?: number;
  talkRatio?: number; // 0 to 100 percentage
}

export default function CallSimulatorHud({
  customerName,
  scenarioTitle,
  mood,
  turnCount,
  maxTurns = 12,
  talkRatio = 45,
}: CallSimulatorHudProps) {
  const getMoodConfig = (m: string) => {
    const lower = m.toLowerCase();
    if (lower.includes('hostile') || lower.includes('angry') || lower.includes('risk')) {
      return {
        label: '🔴 Hostile / Risk-Averse',
        aura: 'from-rose-500/30 to-red-600/10 border-rose-500/40 shadow-rose-500/20',
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      };
    }
    if (lower.includes('hesitant') || lower.includes('impatient') || lower.includes('busy')) {
      return {
        label: '🟡 Hesitant / Hurried',
        aura: 'from-amber-500/30 to-yellow-600/10 border-amber-500/40 shadow-amber-500/20',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      };
    }
    return {
      label: '🟢 Interested / Receptive',
      aura: 'from-emerald-500/30 to-teal-600/10 border-emerald-500/40 shadow-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
  };

  const moodConfig = getMoodConfig(mood);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <Phone size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Live Telesales Call HUD</h3>
            <p className="text-[11px] font-medium text-slate-400">{scenarioTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-white/10 px-3 py-1 rounded-full">
            Turn {turnCount} / {maxTurns}
          </span>
        </div>
      </div>

      {/* Customer Avatar & Mood Aura */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br ${moodConfig.aura} shadow-lg`}
          >
            <User size={24} className="text-slate-200" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px]">
              🎧
            </span>
          </motion.div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm">{customerName}</h4>
            <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${moodConfig.badge}`}>
              {moodConfig.label}
            </div>
          </div>
        </div>

        {/* Live Audio Waveform Simulation */}
        <div className="hidden sm:flex items-center gap-1 h-8 px-3 rounded-xl bg-slate-900/80 border border-white/5">
          <Volume2 size={14} className="text-emerald-400 mr-1 animate-pulse" />
          {[40, 75, 30, 90, 50, 65, 35, 80, 45, 60].map((height, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`] }}
              transition={{ repeat: Infinity, duration: 0.8 + (i % 3) * 0.2, ease: 'easeInOut' }}
              className="w-1 rounded-full bg-emerald-400/80"
            />
          ))}
        </div>
      </div>

      {/* Live Call Telemetry Gauges */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <Activity size={14} className="text-blue-400" />
            <span>Talk Ratio</span>
          </div>
          <span className={`text-xs font-mono font-bold ${talkRatio > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {talkRatio}% Talk
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <ShieldAlert size={14} className="text-purple-400" />
            <span>Compliance Check</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            🟢 Active
          </span>
        </div>
      </div>
    </div>
  );
}
