'use client';

import { motion } from 'framer-motion';
import { Award, Target } from 'lucide-react';

export const FloatingDecoration = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <motion.div 
      className="absolute top-[15%] left-[5%] p-4 rounded-2xl glass border-white/20 hidden xl:block shadow-2xl"
      animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 flex items-center justify-center">
          <Award size={16} className="text-brand-cyan" />
        </div>
        <div className="flex flex-col">
          <div className="w-16 h-1.5 bg-brand-cyan/30 rounded-full mb-1" />
          <div className="w-10 h-1.5 bg-brand-cyan/15 rounded-full" />
        </div>
      </div>
    </motion.div>

    <motion.div 
      className="absolute bottom-[20%] left-[8%] p-4 rounded-2xl glass border-white/20 hidden xl:block shadow-2xl"
      animate={{ y: [0, 20, 0], rotate: [0, -3, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Target size={16} className="text-purple-400" />
        </div>
        <div className="flex flex-col">
          <div className="w-20 h-1.5 bg-purple-400/30 rounded-full mb-1" />
          <div className="w-12 h-1.5 bg-purple-400/15 rounded-full" />
        </div>
      </div>
    </motion.div>
  </div>
);
