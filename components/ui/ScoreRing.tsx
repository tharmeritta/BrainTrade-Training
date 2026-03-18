'use client';

import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  color: string;
  size: number;
}

export function ScoreRing({ score, color, size }: ScoreRingProps) {
  const sw   = Math.max(4, Math.round(size * 0.043));
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.15}
        strokeWidth={sw}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}
