'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LangToggle() {
  const pathname = usePathname();
  const router   = useRouter();

  const segments = pathname.split('/');
  const locale   = segments[1] === 'en' ? 'en' : 'th';

  function switchLocale(targetLocale: 'th' | 'en') {
    if (targetLocale === locale) return;
    const newSegments = [...segments];
    newSegments[1] = targetLocale;
    document.cookie = `locale=${targetLocale};path=/;max-age=31536000`;
    
    const currentSubpath = newSegments.join('/');
    const searchAndHash = window.location.search + window.location.hash;
    router.push(`${currentSubpath}${searchAndHash}`);
  }

  return (
    <div className="relative flex items-center p-1 bg-secondary/50 border border-black/5 dark:border-white/10 rounded-xl shadow-inner select-none">
      {/* TH Option */}
      <button
        onClick={() => switchLocale('th')}
        aria-label="Switch to Thai"
        className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black tracking-wider transition-colors duration-200 ${
          locale === 'th' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="text-xs">🇹🇭</span>
        <span>TH</span>
      </button>

      {/* EN Option */}
      <button
        onClick={() => switchLocale('en')}
        aria-label="Switch to English"
        className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black tracking-wider transition-colors duration-200 ${
          locale === 'en' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <span className="text-xs">🇺🇸</span>
        <span>EN</span>
      </button>

      {/* Animated Sliding Active Indicator Pill */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`absolute inset-y-1 rounded-lg bg-white dark:bg-card shadow-sm border border-black/5 dark:border-white/10 ${
          locale === 'th' ? 'left-1 w-[54px]' : 'left-[57px] w-[54px]'
        }`}
      />
    </div>
  );
}
