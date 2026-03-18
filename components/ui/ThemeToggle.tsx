'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('brainstrade_theme');
    setIsDark(stored !== 'light');
  }, []);

  function toggle() {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('brainstrade_theme', next);
    setIsDark(next === 'dark');
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
