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
import { getAgentSession, clearAgentSession } from '@/lib/session/agent';
import { hasStaffSession } from '@/lib/session/client';

import { useTranslations } from 'next-intl';

/* --- Nav Definition --------------------------------------- */

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

/* --- Component -------------------------------------------- */

export default function NavBar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router   = useRouter();
  const segments = pathname.split('/');
  const locale   = segments[1] === 'en' ? 'en' : 'th';
  const section  = segments[2] ? `/${segments[2]}` : '/dashboard';

  const [hasSession, setHasSession] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [activeSection, setActiveSection] = useState(section);

  useEffect(() => {
    const refresh = () => {
      setHasSession(!!getAgentSession());
      setIsStaff(hasStaffSession());
    };
    refresh();
    window.addEventListener('agent-session-changed', refresh);
    return () => window.removeEventListener('agent-session-changed', refresh);
  }, []);

  // Sync active section when Next.js pathname changes
  useEffect(() => {
    const segs = pathname.split('/');
    const sec = segs[2] ? `/${segs[2]}` : '/dashboard';
    setActiveSection(sec);
  }, [pathname]);

  // Sync active section on browser back/forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const segs = window.location.pathname.split('/');
      const sec = segs[2] ? `/${segs[2]}` : '/dashboard';
      setActiveSection(sec);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function handleNavClick(e: React.MouseEvent, href: string) {
    e.preventDefault();

    // Guard navigation logic: check session for non-dashboard routes
    if (href !== '/dashboard') {
      const activeSession = getAgentSession();
      const activeStaff = hasStaffSession();
      if (!activeSession && !activeStaff) {
        router.push(`/${locale}/dashboard?loginRequired=1`);
        return;
      }
    }

    const targetUrl = `/${locale}${href}`;

    // If already on target route, return early
    if (window.location.pathname === targetUrl) {
      return;
    }

    // 1. Instant 0ms visual active tab switch
    setActiveSection(href);

    // 2. Perform shallow window.history.pushState without full page reload
    window.history.pushState({ path: targetUrl }, '', targetUrl);

    // 3. Dispatch popstate event to notify history/route listeners
    window.dispatchEvent(new PopStateEvent('popstate', { state: { path: targetUrl } }));

    // 4. Dispatch custom event for UI feedback / progress bar
    window.dispatchEvent(new Event('nav:start'));

    // 5. Synchronize Next.js URL state without full page reload
    router.push(targetUrl, { scroll: false });
  }

  function isActive(href: string) {
    return activeSection === href;
  }

  function backToAdmin() {
    clearAgentSession();
    router.push(`/${locale}/admin`);
  }

  return (
    <header className="relative flex items-center justify-between px-3 md:px-4 min-h-[56px] pt-safe shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md z-50">

      {/* -- Logo ------------------------------------------- */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href={`/${locale}/dashboard`}
          onClick={(e) => handleNavClick(e, '/dashboard')}
          className="flex items-center gap-2.5 min-h-[44px] min-w-[44px] py-1 px-1 group"
        >
          <motion.div
            className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0"
            whileHover={{ scale: 1.12, rotate: -4 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan to-brand-purple" />
            <span className="relative z-10 flex items-center justify-center w-full h-full text-[10px] font-black text-white tracking-tight">
              B
            </span>
          </motion.div>
          <span className="text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors hidden sm:block">
            BrainTrade
          </span>
        </Link>

        {isStaff && (
          <motion.button
            type="button"
            aria-label={t('admin')}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={backToAdmin}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          >
            <ShieldCheck size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">
              {t('admin')}
            </span>
          </motion.button>
        )}
      </div>

      {/* -- Nav Pills -------------------------------------- */}
      <nav aria-label="Main Navigation" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-muted/50 border border-border/50 rounded-full p-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          const label  = t(item.key);

          return (
            <div
              key={item.href}
              className="relative"
              data-tour={`nav-${item.key === 'aiEval' ? 'ai-eval' : item.key}`}
            >
              {/* Pill Button */}
              <motion.div
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                <Link
                  href={`/${locale}${item.href}`}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm select-none group/pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200 ${
                    active ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground/80'
                  }`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {/* Sliding active capsule */}
                  {active && (
                    <motion.div
                      layoutId="nav-capsule"
                      className="absolute inset-0 rounded-full bg-background shadow-md border border-border/80"
                      transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
                    >
                      {/* Subtle gradient glow inside active pill */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
                    </motion.div>
                  )}

                  {/* Hover highlight for inactive */}
                  {!active && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-foreground/[0.04]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    />
                  )}

                  <motion.span
                    className="relative z-10 flex items-center justify-center"
                    animate={{ scale: active ? 1.08 : 1, rotate: active ? -6 : 0 }}
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Icon
                      size={16}
                      className={`transition-colors duration-200 ${
                        active ? 'text-primary' : 'text-muted-foreground group-hover/pill:text-foreground'
                      }`}
                    />
                  </motion.span>
                  <span
                    className={`relative z-10 transition-colors duration-200 hidden sm:inline ${
                      active ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover/pill:text-foreground/90'
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

      {/* -- Controls --------------------------------------- */}
      <div data-tour="lang-toggle" className="flex items-center gap-0.5 bg-muted/50 border border-border/50 rounded-full p-0.5 sm:p-1 shrink-0">
        <LangToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}

