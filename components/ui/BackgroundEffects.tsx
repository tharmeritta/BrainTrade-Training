'use client';

import { motion } from 'framer-motion';

/**
 * BackgroundEffects: A premium, shared background for login and entry pages.
 * Features:
 * - Fractal noise texture overlay
 * - Layered, animated ambient orbs (Cyan/Purple)
 * - Drifting SVG grid
 */
export const BackgroundEffects = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
    {/* Noise Texture Overlay */}
    <div 
      className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] contrast-150 brightness-100 mix-blend-overlay" 
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
    />

    {/* Top-left cyan orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 900, height: 900, top: -300, left: -250,
        background: `radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%)` }}
      animate={{ x: [0, 40, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    />
    
    {/* Secondary soft cyan orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 600, height: 600, top: '10%', left: '30%',
        background: `radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 60%)` }}
      animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />

    {/* Bottom-right purple orb */}
    <motion.div className="absolute rounded-full"
      style={{ width: 800, height: 800, bottom: -200, right: -150,
        background: `radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)` }}
      animate={{ x: [0, -60, 0], y: [0, -40, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Center accent orb */}
    <motion.div className="absolute rounded-full hidden lg:block"
      style={{ width: 450, height: 450, top: '45%', left: '50%', transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, rgba(0,180,216,0.04) 0%, rgba(124,58,237,0.03) 50%, transparent 75%)` }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Subtle animated grid */}
    <motion.div 
      className="absolute inset-0 opacity-[0.025]" 
      style={{
        backgroundImage: `linear-gradient(var(--hub-grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--hub-grid-color) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }}
      animate={{ backgroundPosition: ['0px 0px', '64px 64px'] }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);
