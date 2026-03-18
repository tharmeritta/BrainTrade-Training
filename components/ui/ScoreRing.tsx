'use client';

import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  color: string;
  size: number;
}

export function ScoreRing({ score, color, size }: ScoreRingProps) {
  const sw = 7, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  const arc = (score / 100) * circ * 0.75;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--hub-ring-track)" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        transform={`rotate(135 ${size/2} ${size/2})`} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round"
        transform={`rotate(135 ${size/2} ${size/2})`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${arc} ${circ}` }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} />
    </svg>
  );
}
