'use client';

import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'md' | 'high';
  borderOpacity?: number;
  hoverEffect?: boolean;
}

export function GlassCard({ 
  children, 
  className = '', 
  intensity = 'md', 
  borderOpacity = 0.1,
  hoverEffect = false,
  style,
  ...props 
}: GlassCardProps) {
  const blurAmount = {
    low: 'blur(8px)',
    md: 'blur(16px)',
    high: 'blur(24px)',
  };

  return (
    <motion.div
      {...props}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`rounded-3xl border overflow-hidden relative bg-white/80 dark:bg-[#0B1524]/80 border-black/10 dark:border-white/10 ${className}`}
      style={{
        backdropFilter: blurAmount[intensity],
        WebkitBackdropFilter: blurAmount[intensity],
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
