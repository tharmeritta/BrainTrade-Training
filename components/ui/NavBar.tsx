'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, GraduationCap, ClipboardList, Mic, PlayCircle, Lock, ClipboardCheck, Loader2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LangToggle  from './LangToggle';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Course',    href: '/learn',          icon: GraduationCap   },
  { label: 'Quiz',      href: '/quiz',           icon: ClipboardList   },
  { label: 'AI Eval',   href: '/ai-eval',       icon: Mic             },
  { label: 'Pitch',     href: '/pitch',         icon: PlayCircle      },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state once navigation completes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-50 px-4 pt-4 pb-0">
        <div className="
          flex items-center justify-between
          px-5 py-3 rounded-2xl
          bg-white/70 dark:bg-[#080F1C]/80
          backdrop-blur-md
          border border-black/10 dark:border-white/10
          shadow-sm
        ">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-dark">
              BrainTrade
            </span>
          </div>

          {/* Nav links — desktop only */}
          <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            {navLinks.map(l => {
              const Icon = l.icon;
              const isActive = pathname.includes(l.href);
              const isPending = pendingHref === l.href;
              return (
                <Link
                  key={l.href}
                  href={`/${locale}${l.href}`}
                  onClick={() => { if (!isActive) setPendingHref(l.href); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                      : isPending
                        ? 'bg-white/60 dark:bg-white/8 text-primary opacity-80'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/8'
                  }`}
                >
                  {isPending
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Icon size={16} />
                  }
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1.5">
            <LangToggle />
            <ThemeToggle />

            {/* Evaluator login */}
            <Link
              href={`/${locale}/login`}
              className="p-2 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
              title="Evaluator Login"
            >
              <ClipboardCheck size={17} />
            </Link>

            {/* Staff portal */}
            <Link
              href={`/${locale}/admin`}
              className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              title="Staff Portal"
            >
              <Lock size={17} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav — visible only on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-[#080F1C]/95 backdrop-blur-md border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-around px-2 py-1 pb-2">
          {navLinks.map(l => {
            const Icon = l.icon;
            const isActive = pathname.includes(l.href);
            const isPending = pendingHref === l.href;
            return (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                onClick={() => { if (!isActive) setPendingHref(l.href); }}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${
                  isActive ? 'text-primary' : isPending ? 'text-primary opacity-70' : 'text-muted-foreground'
                }`}
              >
                {isPending ? <Loader2 size={19} className="animate-spin" /> : <Icon size={19} />}
                <span className="text-[9px] font-medium">{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
