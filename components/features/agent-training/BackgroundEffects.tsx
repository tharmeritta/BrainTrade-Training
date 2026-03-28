'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';

export const BackgroundEffects = memo(({ badgeColor }: { badgeColor: string }) => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div 
      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] contrast-125 brightness-100 mix-blend-overlay" 
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />

    <motion.div 
      className="absolute w-[800px] h-[800px] -top-[200px] -left-[200px] rounded-full"
      style={{ background: `radial-gradient(circle, ${badgeColor}0A 0%, transparent 70%)` }}
      animate={{ x: [0, 40, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div 
      className="absolute w-[600px] h-[600px] bottom-[-100px] right-[-100px] rounded-full"
      style={{ background: `radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 75%)` }}
      animate={{ x: [0, -30, 0], y: [0, -50, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    
    <motion.div 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }}
      animate={{ backgroundPosition: ['0px 0px', '64px 64px'] }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    />
  </div>
));

BackgroundEffects.displayName = 'BackgroundEffects';
