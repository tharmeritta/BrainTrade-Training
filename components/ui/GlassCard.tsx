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
  ...props 
}: GlassCardProps) {
  const blurAmount = {
    low: 'blur(8px)',
    md: 'blur(16px)',
    high: 'blur(24px)',
  };

  const bgOpacity = {
    low: '0.03',
    md: '0.05',
    high: '0.08',
  };

  return (
    <motion.div
      {...props}
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`rounded-3xl border overflow-hidden relative ${className}`}
      style={{
        backdropFilter: blurAmount[intensity],
        WebkitBackdropFilter: blurAmount[intensity],
        background: `rgba(255, 255, 255, ${bgOpacity[intensity]})`,
        borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
        ...props.style
      }}
    >
      {children}
    </motion.div>
  );
}
