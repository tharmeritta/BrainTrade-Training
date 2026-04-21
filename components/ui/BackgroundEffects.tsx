'use client';

import { motion } from 'framer-motion';
import { memo } from 'react';

/**
 * BackgroundEffects: A premium, shared background for login and entry pages.
 * Optimized for performance using GPU-accelerated transforms and memoization.
 */
export const BackgroundEffects = memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
    {/* Noise Texture Overlay - Simplified for performance */}
    <div 
      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] contrast-125 brightness-100" 
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay'
      }} 
    />

    {/* Top-left cyan orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 900, height: 900, top: -300, left: -250,
        background: `radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%)`,
        willChange: 'transform' }}
      animate={{ x: [0, 40, 0], y: [0, 50, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Secondary soft cyan orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 600, height: 600, top: '10%', left: '30%',
        background: `radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 60%)`,
        willChange: 'transform' }}
      animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />

    {/* Bottom-right purple orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 800, height: 800, bottom: -200, right: -150,
        background: `radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)`,
        willChange: 'transform' }}
      animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Center accent orb */}
    <motion.div className="absolute rounded-full hidden lg:block"
      style={{ width: 450, height: 450, top: '45%', left: '50%', transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, rgba(0,180,216,0.04) 0%, rgba(124,58,237,0.03) 50%, transparent 75%)`,
        willChange: 'transform' }}
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Optimized animated grid using transform instead of backgroundPosition */}
    <div className="absolute inset-0 opacity-[0.02] overflow-hidden">
      <motion.div 
        className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2" 
        style={{
          backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          willChange: 'transform'
        }}
        animate={{ x: [0, 64], y: [0, 64] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  </div>
));

BackgroundEffects.displayName = 'BackgroundEffects';
