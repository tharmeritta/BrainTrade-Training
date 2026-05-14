'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { AlertCircle, Clock, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import type { AgentStats } from '@/types';
import { getCompletionStatus, type CompletionStatus } from '@/lib/completion';

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
