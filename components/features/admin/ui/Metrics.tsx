'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { scoreColor, scoreBg } from '../AdminHelpers';

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
