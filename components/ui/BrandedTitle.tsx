'use client';

import { ReactNode } from 'react';

interface BrandedTitleProps {
  children: ReactNode;
  className?: string;
  type?: 'primary' | 'gradient';
}

export function BrandedTitle({ children, className = '', type = 'primary' }: BrandedTitleProps) {
  if (type === 'gradient') {
    return (
      <span 
        className={`inline-block bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent ${className}`}
        style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        {children}
      </span>
    );
  }

  return (
    <span className={`text-primary ${className}`}>
      {children}
    </span>
  );
}
