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
    <div className="w-full rounded-xl border border-white/10 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 shadow-md flex items-center justify-between gap-4">
      {/* Customer Avatar & Status */}
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border bg-gradient-to-br ${moodConfig.aura} shrink-0`}>
          <User size={16} className="text-slate-200" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-100 text-xs">{customerName}</h4>
            <span className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase border ${moodConfig.badge}`}>
              {moodConfig.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">{scenarioTitle}</p>
        </div>
      </div>

      {/* Right Stats & Audio Waveform */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden md:flex items-center gap-1 h-5 px-2 rounded-lg bg-slate-900 border border-white/5">
          <Volume2 size={12} className="text-emerald-400 mr-1 animate-pulse" />
          {[40, 75, 30, 90, 50, 65, 35].map((height, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`] }}
              transition={{ repeat: Infinity, duration: 0.8 + (i % 3) * 0.2, ease: 'easeInOut' }}
              className="w-0.5 rounded-full bg-emerald-400/80"
            />
          ))}
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-300 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg">
            <Activity size={12} className={turnCount >= 10 ? "text-rose-400 animate-pulse" : "text-blue-400"} />
            <span>Turn {turnCount}/{maxTurns}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
              turnCount >= 10 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {maxTurns - turnCount} left
            </span>
          </div>

          {/* Visual Turn Progress Bar */}
          <div className="w-28 sm:w-36 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((turnCount / maxTurns) * 100, 100)}%` }}
              transition={{ duration: 0.4 }}
              className={`h-full rounded-full ${
                turnCount >= 10 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                  : 'bg-gradient-to-r from-blue-500 to-emerald-400'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
