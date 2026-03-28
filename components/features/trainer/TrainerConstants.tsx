import { Loader2 } from 'lucide-react';
import React from 'react';

export const T = {
  bg:     '#070D1A',
  card:   'rgba(10,20,36,0.92)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#E8F4FF',
  sub:    '#8AAAC8',
  amber:  '#F59E0B',
  amberBg: 'rgba(245,158,11,0.10)',
  amberBorder: 'rgba(245,158,11,0.20)',
};

export function fmtDate(iso: string, locale: string = 'en-GB') {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export function Spinner({ size = 16, className = "" }: { size?: number, className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} style={{ color: T.amber }} />;
}

export function fmtElapsed(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
