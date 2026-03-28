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
  const configs: Record<StatusType, { bg: string, text: string, border: string, dot: string }> = {
    success:  { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.2)', dot: '#34D399' },
    active:   { bg: 'rgba(52,211,153,0.1)', text: '#34D399', border: 'rgba(52,211,153,0.2)', dot: '#34D399' },
    warning:  { bg: 'rgba(251,191,36,0.1)', text: '#FBBF24', border: 'rgba(251,191,36,0.2)', dot: '#FBBF24' },
    error:    { bg: 'rgba(248,113,113,0.1)', text: '#F87171', border: 'rgba(248,113,113,0.2)', dot: '#F87171' },
    info:     { bg: 'rgba(59,130,246,0.1)',  text: '#60A5FA', border: 'rgba(59,130,246,0.2)',  dot: '#60A5FA' },
    neutral:  { bg: 'rgba(156,163,175,0.1)', text: '#9CA3AF', border: 'rgba(156,163,175,0.2)', dot: '#9CA3AF' },
    inactive: { bg: 'rgba(156,163,175,0.1)', text: '#9CA3AF', border: 'rgba(156,163,175,0.2)', dot: '#9CA3AF' },
  };

  const config = configs[status] || configs.neutral;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border transition-all ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border
      }}
    >
      {pulse && (
        <div className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: config.dot }}></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: config.dot }}></span>
        </div>
      )}
      {label}
    </div>
  );
}
