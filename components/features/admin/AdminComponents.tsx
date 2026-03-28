'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { AgentStats } from '@/types';
import { BADGE_CONFIG, scoreColor, scoreBg } from './AdminHelpers';
import { TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle2, ShieldCheck, ChevronRight, Activity, Users as UsersIcon } from 'lucide-react';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';
import { useAgentPresence } from '@/lib/presence';

export function KpiCard({ label, value, sub, icon: Icon, themeColor, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; themeColor: 'blue' | 'purple' | 'orange' | 'amber';
  trend?: { value: number; isUp: boolean };
}) {
  const gradients = {
    blue: 'from-blue-400 to-blue-600 shadow-blue-500/20',
    purple: 'from-purple-400 to-purple-600 shadow-purple-500/20',
    orange: 'from-orange-400 to-orange-600 shadow-orange-500/20',
    amber: 'from-amber-400 to-amber-600 shadow-amber-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 p-6 flex items-start gap-4 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[themeColor]} shadow-lg relative z-10`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground/70 font-medium truncate">{label}</p>
          {trend && (
            <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${trend.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-3xl font-black text-foreground mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1 font-medium truncate opacity-60">{sub}</p>}
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${gradients[themeColor]} opacity-[0.03] rounded-full blur-2xl`} />
    </motion.div>
  );
}

export function LivePulse({ agentIds, agentNames }: { agentIds: string[], agentNames: Record<string, string> }) {
  const t = useTranslations('admin');
  const presence = useAgentPresence(agentIds);
  
  const activeCount = Object.values(presence).filter(s => s === 'focused').length;
  const awayCount   = Object.values(presence).filter(s => s === 'away').length;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-widest text-foreground/80">
          <Activity size={16} className="text-emerald-400 animate-pulse" /> {t('overview.livePulse')}
        </h3>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> {activeCount}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {awayCount}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[200px] max-h-[300px]">
        {agentIds.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-2">
            <UsersIcon size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest">{t('overview.noActiveAgents')}</p>
          </div>
        ) : (
          agentIds.map(id => {
            const status = presence[id] || 'offline';
            if (status === 'offline') return null;

            return (
              <motion.div 
                key={id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${status === 'focused' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400'}`} />
                  <span className="text-xs font-bold text-foreground truncate">{agentNames[id] || id}</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md ${status === 'focused' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-400'}`}>
                  {status}
                </span>
              </motion.div>
            );
          })
        )}
        {Object.values(presence).every(s => s === 'offline') && agentIds.length > 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-30 gap-2">
            <Clock size={24} />
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">{t('overview.allAgentsOffline')}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/40 flex justify-between items-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
        <span>Total Tracked</span>
        <span>{agentIds.length}</span>
      </div>
    </div>
  );
}

export function DonutChart({ passed, failed }: { passed: number; failed: number }) {
  const t = useTranslations('admin');
  const total = passed + failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const r = 40; const c = 2 * Math.PI * r;
  const dash = (c * pct) / 100;
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={14} />
        <circle cx={55} cy={55} r={r} fill="none" stroke="#3B82F6" strokeWidth={14}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" />
        <text x={55} y={59} textAnchor="middle" fontSize={18} fontWeight={800} fill="hsl(var(--foreground))">{pct}%</text>
      </svg>
      <div className="flex gap-4 mt-2 text-xs font-medium">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />{t('agents.table.pass')} ({passed})</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40 inline-block" />{t('agents.table.fail')} ({failed})</span>
      </div>
    </div>
  );
}

export function ModuleBar({ label, avgScore, passCount, totalAttempts }: {
  label: string; avgScore: number; passCount: number; totalAttempts: number;
}) {
  const t = useTranslations('admin');
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        {label && <span className="font-semibold text-foreground">{label}</span>}
        <span className={`font-bold ${scoreColor(avgScore)}`}>{avgScore}%</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${avgScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${scoreBg(avgScore)}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">{t('overview.agentsCount', { done: passCount, total: totalAttempts })}</p>
    </div>
  );
}

export function BadgePill({ badge }: { badge: AgentStats['badge'] }) {
  const t = useTranslations('admin');
  const c = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {t(`badges.${badge}`)}
    </span>
  );
}

export function StatusPipeline({ stats, totalCount }: { stats: AgentStats[]; totalCount?: number }) {
  const t = useTranslations('admin');
  const total = totalCount ?? stats.length;
  
  const STATUS_CFG: Record<CompletionStatus, { bg: string; border: string; color: string; icon: any }> = {
    'not-started': { bg: 'bg-secondary/20',     border: 'border-border/50',  color: 'text-muted-foreground', icon: AlertCircle },
    'in-progress': { bg: 'bg-blue-500/5',       border: 'border-blue-500/20', color: 'text-blue-500',         icon: Clock },
    'needs-eval':  { bg: 'bg-amber-500/5',      border: 'border-amber-500/20',color: 'text-amber-500',        icon: CheckCircle2 },
    'cleared':     { bg: 'bg-emerald-500/10',    border: 'border-emerald-500/20', color: 'text-emerald-500',  icon: ShieldCheck },
  };

  const statusItems = [
    { status: 'not-started', labelKey: 'statusNotStarted' },
    { status: 'in-progress', labelKey: 'statusInProgress' },
    { status: 'needs-eval',  labelKey: 'statusNeedsEval'  },
    { status: 'cleared',     labelKey: 'statusCleared'    },
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
      {statusItems.map(({ status, labelKey }, idx) => {
        const cfg = STATUS_CFG[status as CompletionStatus];
        const Icon = cfg.icon;
        const count = stats.filter(s => getCompletionStatus(s).status === status).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return (
          <React.Fragment key={status}>
            <div className={`relative rounded-2xl border p-5 transition-all hover:shadow-md ${cfg.bg} ${cfg.border} group`}>
              <Icon size={18} className={`mb-3 ${cfg.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-baseline gap-1">
                <p className={`text-3xl font-black tracking-tight ${cfg.color}`}>{count}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${cfg.color}`}>Agents</p>
              </div>
              <p className={`text-xs font-bold mt-1 ${cfg.color} opacity-80`}>{t(`overview.${labelKey}`)}</p>
              <p className="text-[10px] text-muted-foreground mt-1 opacity-60">
                {pct}% {t('overview.ofAgents')}
              </p>
            </div>
            
            {/* Arrow between items (only on desktop) */}
            {idx < statusItems.length - 1 && (
              <div className="hidden sm:flex absolute items-center justify-center z-10" 
                style={{ 
                  left: `${(idx + 1) * 25}%`, 
                  top: '50%', 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                <div className="bg-background border border-border rounded-full p-1.5 shadow-sm text-muted-foreground/40 shrink-0">
                  <ChevronRight size={14} />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

