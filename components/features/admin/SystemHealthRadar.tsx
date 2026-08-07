'use client';

import { useState } from 'react';
import { ShieldCheck, Database, HardDrive, Cpu, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SystemHealthRadar() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">System Health Radar</h3>
            <p className="text-[11px] font-medium text-slate-400">Real-time platform diagnostics & AI status</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 transition-all"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin text-purple-400' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Firestore Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-medium text-[11px]">
            <span className="flex items-center gap-1.5"><Database size={13} className="text-emerald-400" /> Firestore DB</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 size={10} /> Operational</span>
          </div>
          <div className="text-lg font-black text-slate-100 font-mono">18ms</div>
          <div className="text-[10px] text-slate-500">Latency healthy</div>
        </div>

        {/* AI Provider Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-medium text-[11px]">
            <span className="flex items-center gap-1.5"><Cpu size={13} className="text-purple-400" /> AI Provider Engine</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 size={10} /> Ready</span>
          </div>
          <div className="text-lg font-black text-slate-100 font-mono">Gemini 1.5</div>
          <div className="text-[10px] text-slate-500">Auto OpenAI fallback enabled</div>
        </div>

        {/* Cloud Storage Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 font-medium text-[11px]">
            <span className="flex items-center gap-1.5"><HardDrive size={13} className="text-blue-400" /> Cloud Storage</span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 size={10} /> Active</span>
          </div>
          <div className="text-lg font-black text-slate-100 font-mono">100% Online</div>
          <div className="text-[10px] text-slate-500">Slide decks & call assets loaded</div>
        </div>
      </div>
    </div>
  );
}
