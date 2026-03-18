export const EASE = {
  spring: { type: 'spring' as const, stiffness: 300, damping: 20 },
  smooth: [0.22, 1, 0.36, 1] as const, // Custom cubic-bezier for buttery smooth entry
  bounce: { type: 'spring' as const, stiffness: 280, damping: 22 },
};

export const TRANSITION = {
  base: { duration: 0.45, ease: EASE.smooth },
  slow: { duration: 0.6, ease: EASE.smooth },
  fast: { duration: 0.2, ease: 'easeOut' },
  spring: EASE.spring,
};

// Orchestration utilities
export const stagger = (index: number, baseDelay: number = 0.1, increment: number = 0.08) => 
  baseDelay + index * increment;
