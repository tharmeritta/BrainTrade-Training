'use client';

import React from 'react';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'active' | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
}

export function StatusBadge({ status, label, className = '', size = 'sm', pulse = false }: StatusBadgeProps) {
  const configs: Record<StatusType, { badgeClass: string, dotClass: string }> = {
    success:  { badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', dotClass: 'bg-emerald-500' },
    active:   { badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20', dotClass: 'bg-emerald-500' },
    warning:  { badgeClass: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20', dotClass: 'bg-amber-500' },
    error:    { badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20', dotClass: 'bg-rose-500' },
    info:     { badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20', dotClass: 'bg-blue-500' },
    neutral:  { badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20', dotClass: 'bg-slate-500' },
    inactive: { badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20', dotClass: 'bg-slate-500' },
  };

  const config = configs[status] || configs.neutral;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border transition-all ${config.badgeClass} ${sizeClasses[size]} ${className}`}
    >
      {pulse && (
        <div className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotClass}`} />
        </div>
      )}
      {label}
    </div>
  );
}
