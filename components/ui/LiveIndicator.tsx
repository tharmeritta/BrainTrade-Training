'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LiveIndicatorProps {
  status: 'focused' | 'away' | 'offline';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
}

export function LiveIndicator({ status, size = 'sm', showLabel = false, label }: LiveIndicatorProps) {
  const colors = {
    focused: '#34D399', // Emerald 400
    away:    '#FBBF24', // Amber 400
    offline: '#9CA3AF', // Gray 400
  };

  const bgColors = {
    focused: 'rgba(52,211,153,0.2)',
    away:    'rgba(251,191,36,0.2)',
    offline: 'rgba(156,163,175,0.2)',
  };

  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {status !== 'offline' && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} rounded-full`}
            style={{ backgroundColor: colors[status] }}
          />
        )}
        <div 
          className={`${dotSize} rounded-full relative z-10 shadow-sm`}
          style={{ backgroundColor: colors[status] }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors[status] }}>
          {label || status}
        </span>
      )}
    </div>
  );
}
