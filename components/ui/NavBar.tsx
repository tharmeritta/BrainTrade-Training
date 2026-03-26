'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Mic,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import LangToggle from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { getAgentSession, clearAgentSession } from '@/lib/agent-session';
import { hasStaffSession } from '@/lib/session-client';

import { useTranslations } from 'next-intl';

/* ─── Nav Definition ─────────────────────────────────────── */

const NAV_ITEMS = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'learn',
    href: '/learn',
    icon: BookOpen,
  },
  {
    key: 'quiz',
    href: '/quiz',
    icon: ClipboardList,
  },
  {
    key: 'aiEval',
    href: '/ai-eval',
    icon: BarChart3,
  },
] as const;

/* ─── Component ──────────────────────────────────────────── */

export default function NavBar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router   = useRouter();
  const segments = pathname.split('/');
  const locale   = segments[1] === 'en' ? 'en' : 'th';
  const section  = segments[2] ? `/${segments[2]}` : '/dashboard';

  const [hasSession, setHasSession] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setHasSession(!!getAgentSession());
    setIsStaff(hasStaffSession());
    setPendingHref(null); // navigation completed — clear optimistic state
  }, [pathname]);

  function guardedNavigate(e: React.MouseEvent, href: string) {
    if (href === '/dashboard') return; // always allow
    if (!hasSession && !isStaff) {
      e.preventDefault();
      router.push(`/${locale}/dashboard?loginRequired=1`);
    }
  }

  function handleNavClick(e: React.MouseEvent, href: string) {
    guardedNavigate(e, href);
    setPendingHref(href);
    window.dispatchEvent(new Event('nav:start'));
  }

  function isActive(href: string) {
    // Optimistically show the clicked item as active before route resolves
    if (pendingHref) return pendingHref === href;
    return section === href;
  }

  function backToAdmin() {
    clearAgentSession();
    router.push(`/${locale}/admin`);
  }

  return (
    <header className="relative flex items-center justify-between px-4 h-14 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md z-50">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5 group">
          <motion.div
            className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0"
            whileHover={{ scale: 1.12, rotate: -4 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-orange-400" />
            <span className="relative z-10 flex items-center justify-center w-full h-full text-[10px] font-black text-white tracking-tight">
              BT
            </span>
          </motion.div>
          <span className="text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors hidden sm:block">
            BrainTrade
          </span>
        </Link>

        {isStaff && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={backToAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <ShieldCheck size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">
              {t('admin')}
            </span>
          </motion.button>
        )}
      </div>

      {/* ── Nav Pills ────────────────────────────────────── */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-muted/50 border border-border/50 rounded-full p-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          const label  = t(item.key);

          return (
            <div
              key={item.href}
              className="relative"
            >
              {/* Pill Button */}
              <motion.div
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Link
                  href={`/${locale}${item.href}`}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm select-none group/pill"
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {/* Sliding active capsule */}
                  {active && (
                    <motion.div
                      layoutId="nav-capsule"
                      className="absolute inset-0 rounded-full bg-background shadow-sm border border-border/60"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  {/* Hover highlight for inactive */}
                  {!active && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-foreground/6"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}

                  <motion.span
                    className="relative z-10"
                    whileHover={{ scale: 1.18 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <Icon
                      size={13}
                      className={`transition-colors ${
                        active ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    />
                  </motion.span>
                  <span
                    className={`relative z-10 transition-colors ${
                      active ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </motion.div>
            </div>
          );
        })}
      </nav>

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 bg-muted/50 border border-border/50 rounded-full p-1">
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
