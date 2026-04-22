'use client';

import { useState } from 'react';
import { Activity, RefreshCw, AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function HealthManager({ readOnly }: { readOnly?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleRepair = async (type: 'global' | 'all_agents') => {
    if (!confirm(`Are you sure you want to trigger a ${type.replace('_', ' ')} recalculation? This is a heavy operation.`)) return;
    
    setLoading(type);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/config/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Operation completed successfully' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Operation failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Network error occurred' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="text-xl font-black flex items-center gap-2 text-primary">
          <Activity size={24} /> System Health & Data Integrity
        </h3>
        <p className="text-[10px] font-black opacity-50 uppercase mt-1 tracking-widest">Projection Maintenance & Repair</p>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <p className="text-xs font-bold">{status.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <RefreshCw size={24} className={loading === 'global' ? 'animate-spin' : ''} />
            </div>
            <ShieldAlert size={20} className="text-amber-500/30" />
          </div>
          <h4 className="font-bold text-base mb-1">Global Stats Sync</h4>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Recalculate the entire <strong>stats/global</strong> document by scanning all agent logs. 
            Fixes discrepancies in the Overview KPIs and completion counters.
          </p>
          <button
            onClick={() => handleRepair('global')}
            disabled={!!loading || readOnly}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === 'global' ? <Loader2 size={14} className="animate-spin" /> : 'Run Global Repair'}
          </button>
        </GlassCard>

        <GlassCard className="p-6 border-purple-500/20 bg-purple-500/5">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
              <Activity size={24} className={loading === 'all_agents' ? 'animate-spin' : ''} />
            </div>
            <ShieldAlert size={20} className="text-purple-500/30" />
          </div>
          <h4 className="font-bold text-base mb-1">Agent Projection Rebuild</h4>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Refreshes the <strong>overallScore</strong> and cached stats for ALL active agents. 
            Ensures the Leaderboard and Status Pipeline reflect true progress.
          </p>
          <button
            onClick={() => handleRepair('all_agents')}
            disabled={!!loading || readOnly}
            className="w-full bg-purple-500 text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === 'all_agents' ? <Loader2 size={14} className="animate-spin" /> : 'Rebuild All Projections'}
          </button>
        </GlassCard>
      </div>

      <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-500" /> Architectural Warning
        </h5>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          These operations are computationally expensive and involve multiple database reads. 
          Use only when data drift is detected (e.g., scores in Overview don't match Agent details).
          Normal synchronization occurs automatically during training sessions and manual overrides.
        </p>
      </div>
    </div>
  );
}
