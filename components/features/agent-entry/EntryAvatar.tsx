'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { STAGGER_ITEM } from '@/lib/animations';

const CYAN = '#00B4D8';
const PURPLE = '#7C3AED';

interface EntryAvatarProps {
  initials: string | null;
}

export function EntryAvatar({ initials }: EntryAvatarProps) {
  return (
    <div className="relative">
      <motion.div
        variants={STAGGER_ITEM}
        className="w-16 h-16 rounded-[24px] flex items-center justify-center text-xl font-black shrink-0 overflow-hidden z-10 relative"
        style={{
          background: initials ? `linear-gradient(135deg, ${CYAN}, ${PURPLE})` : 'rgba(0,180,216,0.05)',
          border: `1px solid ${initials ? 'transparent' : 'rgba(0,180,216,0.15)'}`,
          boxShadow: initials ? `0 12px 24px -6px ${CYAN}66` : 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {initials ? (
            <motion.span 
              key="initials" 
              style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.5, opacity: 0 }} 
              transition={{ duration: 0.12 }}
            >
              {initials}
            </motion.span>
          ) : (
            <motion.div 
              key="icon" 
              className="relative flex items-center justify-center w-full h-full" 
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.5, opacity: 0 }} 
              transition={{ duration: 0.12 }}
            >
              <User size={28} className="text-brand-cyan/80" />
              <motion.div 
                className="absolute left-0 right-0 h-[3px] bg-brand-cyan shadow-[0_0_10px_rgba(0,180,216,0.8)]"
                animate={{ top: ['-10%', '110%', '-10%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute inset-0 border-2 border-brand-cyan/20 rounded-[24px]"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
