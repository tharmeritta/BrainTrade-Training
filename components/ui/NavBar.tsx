'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, GraduationCap, ClipboardList, Mic, PlayCircle, Lock, ClipboardCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { label: 'Dashboard', href: '/dashboard',     icon: LayoutDashboard },
  { label: 'เรียนรู้',  href: '/learn/product', icon: GraduationCap   },
  { label: 'Quiz',      href: '/quiz/product',  icon: ClipboardList   },
  { label: 'AI Eval',   href: '/ai-eval',       icon: Mic             },
  { label: 'Pitch',     href: '/pitch',         icon: PlayCircle      },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const locale   = pathname.split('/')[1] ?? 'th';

  return (
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

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
          {navLinks.map(l => {
            const Icon = l.icon;
            const isActive = pathname.includes(l.href);
            return (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-white/8'
                }`}
              >
                <Icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Evaluator */}
          <Link
            href="/login"
            className="p-2 text-muted-foreground hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10"
            title="Evaluator Login"
          >
            <ClipboardCheck size={17} />
          </Link>

          {/* Admin */}
          <Link
            href={`/${locale}/admin`}
            className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
            title="Admin"
          >
            <Lock size={17} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
