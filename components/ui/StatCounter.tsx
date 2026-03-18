'use client';

import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  target: number;
  suffix?: string;
  delay?: number;
}

export function StatCounter({ target, suffix = '', delay = 0 }: StatCounterProps) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      }

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, delay]);

  return <>{value}{suffix}</>;
}
