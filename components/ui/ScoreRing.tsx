'use client';

import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function scoreHex(n: number) {
  if (n >= 70) return '#60A5FA'; // blue-400
  if (n >= 50) return '#FBBF24'; // amber-400
  return '#F87171'; // red-400
}

export function ScoreRing({ score, size = 'md' }: ScoreRingProps) {
  const dim  = size === 'sm' ? 52 : size === 'lg' ? 84 : 68;
  const r    = size === 'sm' ? 18 : size === 'lg' ? 32 : 26;
  const sw   = size === 'sm' ? 3.5 : size === 'lg' ? 5.5 : 4.5;
  const fs   = size === 'sm' ? 12 : size === 'lg' ? 18 : 15;
  const circ = 2 * Math.PI * r;
  
  const textClass = score >= 70 ? 'text-blue-600 dark:text-blue-400' : score >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  const clr = scoreHex(score);

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
      <svg className="absolute inset-0" viewBox={`0 0 ${dim} ${dim}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle 
          cx={dim/2} cy={dim/2} r={r} 
          fill="none" 
          stroke="currentColor" 
          className="text-muted-foreground/15" 
          strokeWidth={sw} 
        />
        <motion.circle
          cx={dim/2} cy={dim/2} r={r} 
          fill="none" 
          stroke={clr} 
          strokeWidth={sw}
          strokeLinecap="round" 
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${clr}50)` }}
        />
      </svg>
      <span className={`font-black tabular-nums ${textClass}`} style={{ fontSize: fs }}>
        {score}
      </span>
    </div>
  );
}
