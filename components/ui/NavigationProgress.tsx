'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavigationProgress() {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const pathname = usePathname();
  const doneTimer = useRef<ReturnType<typeof setTimeout>>();

  // When pathname actually changes → complete the bar
  useEffect(() => {
    if (!visible) return;
    setWidth(100);
    doneTimer.current = setTimeout(() => setVisible(false), 350);
    return () => clearTimeout(doneTimer.current);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for nav:start from NavBar clicks
  useEffect(() => {
    function handleStart() {
      clearTimeout(doneTimer.current);
      setVisible(true);
      setWidth(0);
      // Two rAFs ensure the width:0 paint lands before we animate to 72%
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setWidth(72))
      );
    }
    window.addEventListener('nav:start', handleStart);
    return () => window.removeEventListener('nav:start', handleStart);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-progress"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2px]"
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-blue-400 transition-[width] duration-500 ease-out"
            style={{ width: `${width}%` }}
          />
          {/* Soft glow at the leading edge */}
          <div
            className="absolute top-0 h-full w-24 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent blur-sm transition-[left] duration-500 ease-out"
            style={{ left: `calc(${width}% - 3rem)` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
