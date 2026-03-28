'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles } from 'lucide-react';

export const TrophyHero = memo(() => (
  <div className="relative mb-10 mt-4 group">
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
       {[...Array(8)].map((_, i) => (
         <motion.div
           key={i}
           className="absolute w-1 h-[300px] origin-center opacity-20"
           style={{ 
             background: 'linear-gradient(to top, transparent, #FBBF24, transparent)',
             rotate: `${i * 45}deg`
           }}
           animate={{ 
             opacity: [0.1, 0.3, 0.1],
             scaleY: [1, 1.2, 1],
           }}
           transition={{ 
             duration: 4, 
             repeat: Infinity, 
             delay: i * 0.2,
             ease: "easeInOut" 
           }}
         />
       ))}
    </div>

    <motion.div 
      className="absolute inset-0 flex items-center justify-center opacity-30"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-[180px] h-[180px] rounded-full blur-[60px]" style={{ background: 'radial-gradient(circle, #FBBF24 0%, transparent 70%)' }} />
    </motion.div>

    <motion.div 
      className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center relative z-10 border-4 border-white/30 shadow-[0_20px_50px_-10px_rgba(245,158,11,0.5)]"
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      <Trophy size={56} className="text-white drop-shadow-lg" />
      <motion.div 
        className="absolute -top-2 -right-2 bg-white text-amber-600 rounded-full p-2 shadow-lg border-2 border-amber-100"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Sparkles size={16} fill="currentColor" />
      </motion.div>
    </motion.div>
  </div>
));

TrophyHero.displayName = 'TrophyHero';
