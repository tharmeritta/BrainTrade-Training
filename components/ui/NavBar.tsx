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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import LangToggle from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { getAgentSession } from '@/lib/agent-session';
import { hasStaffSession } from '@/lib/session';

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
    children: [
      { key: 'productKnowledge', href: '/learn/product' },
      { key: 'kycProcess',       href: '/learn/kyc'     },
      { key: 'websiteTutorial',  href: '/learn/website' },
    ],
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

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setHasSession(!!getAgentSession());
    setPendingHref(null); // navigation completed — clear optimistic state
  }, [pathname]);

  function guardedNavigate(e: React.MouseEvent, href: string) {
    if (href === '/dashboard') return; // always allow
    if (!hasSession && !hasStaffSession()) {
      e.preventDefault();
      router.push(`/${locale}/dashboard?loginRequired=1`);
    }
  }

  function handleNavClick(e: React.MouseEvent, href: string) {
    guardedNavigate(e, href);
    setPendingHref(href);
    window.dispatchEvent(new Event('nav:start'));
    setOpenMenu(null);
  }

  function isActive(href: string) {
    // Optimistically show the clicked item as active before route resolves
    if (pendingHref) return pendingHref === href;
    return section === href;
  }

  return (
    <header className="relative flex items-center justify-between px-4 h-14 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md z-50">

      {/* ── Logo ─────────────────────────────────────────── */}
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

      {/* ── Nav Pills ────────────────────────────────────── */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-muted/50 border border-border/50 rounded-full p-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          const label  = t(item.key);
          const hasChildren = 'children' in item && item.children;

          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => hasChildren ? setOpenMenu(item.href) : undefined}
              onMouseLeave={() => setOpenMenu(null)}
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
                  {hasChildren && (
                    <motion.span
                      className="relative z-10"
                      animate={{ rotate: openMenu === item.href ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown
                        size={11}
                        className={active ? 'text-foreground' : 'text-muted-foreground'}
                      />
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Dropdown */}
              {hasChildren && (
                <AnimatePresence>
                  {openMenu === item.href && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 min-w-[176px] rounded-2xl border border-border/60 bg-background/95 backdrop-blur-md shadow-xl shadow-black/10 overflow-hidden p-1"
                    >
                      {item.children.map((child, i) => {
                        const childLabel = t(child.key);
                        const childActive = pathname.includes(child.href);
                        return (
                          <motion.div
                            key={child.href}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04, duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                            whileTap={{ scale: 0.97 }}
                          >
                            <Link
                              href={`/${locale}${child.href}`}
                              onClick={(e) => handleNavClick(e, child.href)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                                childActive
                                  ? 'bg-muted text-foreground font-medium'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                              }`}
                            >
                              {childActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              )}
                              <span className={childActive ? '' : 'pl-3.5'}>{childLabel}</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
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
