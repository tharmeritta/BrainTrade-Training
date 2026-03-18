'use client';

import { useState, useEffect } from 'react';

interface StatCounterProps {
  target: number;
  suffix: string;
  delay: number;
}

export function StatCounter({ target, suffix, delay }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const duration = 1400;
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        setCount(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);

  return <>{count}{suffix}</>;
}
