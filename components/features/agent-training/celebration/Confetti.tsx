'use client';

import React, { useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

export const Confetti = memo(() => {
  const pieces = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20,
      size: 6 + Math.random() * 12,
      color: ['#818CF8', '#60A5FA', '#F472B6', '#FBBF24', '#34D399', '#A78BFA'][Math.floor(Math.random() * 6)],
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
      drift: (Math.random() - 0.5) * 150,
      rotation: Math.random() * 720,
      shape: i % 4 === 0 ? 'star' : i % 3 === 0 ? 'circle' : 'square',
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '-10%', x: `${p.x}%`, rotate: 0, opacity: 0 }}
            animate={{ 
              y: '110%', 
              x: `${p.x + (p.drift / 10)}%`,
              rotate: p.rotation,
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: p.duration, 
              delay: p.delay, 
              ease: [0.23, 1, 0.32, 1],
              repeat: Infinity 
            }}
            className="absolute flex items-center justify-center"
            style={{ width: p.size, height: p.size }}
          >
            {p.shape === 'star' ? (
              <Star size={p.size} fill={p.color} className="text-transparent" />
            ) : p.shape === 'circle' ? (
              <div className="w-full h-full rounded-full" style={{ backgroundColor: p.color }} />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: p.color, transform: `rotate(${p.id * 45}deg)` }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

Confetti.displayName = 'Confetti';
