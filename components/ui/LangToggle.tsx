'use client';

import { usePathname, useRouter } from 'next/navigation';

/**
 * LangToggle — TH / EN language switcher.
 * Changes the [locale] segment in the current URL path.
 * Works in any theme (uses CSS variables via Tailwind).
 */
export default function LangToggle() {
  const pathname = usePathname();
  const router   = useRouter();
  const locale   = pathname.split('/')[1] ?? 'th';

  function switchLocale(next: 'th' | 'en') {
    if (next === locale) return;
    const segs = pathname.split('/');
    segs[1] = next;
    router.push(segs.join('/'));
  }

  return (
    <div className="flex items-center gap-0.5 bg-secondary/60 rounded-lg p-1 border border-border">
      {(['th', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
            locale === l
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
