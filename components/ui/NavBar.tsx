'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart3,
  Mic,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import LangToggle from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';

/* ─── Nav Definition ─────────────────────────────────────── */

const NAV = [
  {
    label: 'Dashboard',
    labelTh: 'หน้าหลัก',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Learn',
    labelTh: 'เรียนรู้',
    href: '/learn',
    icon: BookOpen,
    children: [
      { label: 'Product Overview', labelTh: 'ภาพรวมผลิตภัณฑ์', href: '/learn/product' },
      { label: 'Sales Techniques', labelTh: 'เทคนิคการขาย',    href: '/learn/sales'   },
      { label: 'Market Knowledge', labelTh: 'ความรู้ตลาด',      href: '/learn/market'  },
    ],
  },
  {
    label: 'Quiz',
    labelTh: 'ควิซ',
    href: '/quiz',
    icon: ClipboardList,
  },
  {
    label: 'AI Eval',
    labelTh: 'AI ประเมิน',
    href: '/ai-eval',
    icon: BarChart3,
  },
  {
    label: 'Pitch',
    labelTh: 'ฝึกพิช',
    href: '/pitch',
    icon: Mic,
  },
] as const;

/* ─── Component ──────────────────────────────────────────── */

export default function NavBar() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const locale   = segments[1] === 'en' ? 'en' : 'th';
  const section  = segments[2] ? `/${segments[2]}` : '/dashboard';

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  function isActive(href: string) {
    return section === href;
  }

  return (
    <header className="relative flex items-center justify-between px-4 h-14 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md z-50">

      {/* ── Logo ─────────────────────────────────────────── */}
      <Link href={`/${locale}/dashboard`} className="flex items-center gap-2.5 group">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-orange-400" />
          <span className="relative z-10 flex items-center justify-center w-full h-full text-[10px] font-black text-white tracking-tight">
            BT
          </span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors hidden sm:block">
          BrainTrade
        </span>
      </Link>

      {/* ── Nav Pills ────────────────────────────────────── */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-muted/50 border border-border/50 rounded-full p-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon   = item.icon;
          const label  = locale === 'th' ? item.labelTh : item.label;
          const hasChildren = 'children' in item && item.children;

          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => hasChildren ? setOpenMenu(item.href) : undefined}
              onMouseLeave={() => setOpenMenu(null)}
            >
              {/* Pill Button */}
              <Link
                href={`/${locale}${item.href}`}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm select-none"
                onClick={() => setOpenMenu(null)}
              >
                {/* Sliding active capsule */}
                {active && (
                  <motion.div
                    layoutId="nav-capsule"
                    className="absolute inset-0 rounded-full bg-background shadow-sm border border-border/60"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <Icon
                  size={13}
                  className={`relative z-10 transition-colors ${
                    active ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`relative z-10 transition-colors ${
                    active ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
                {hasChildren && (
                  <ChevronDown
                    size={11}
                    className={`relative z-10 transition-all duration-200 ${
                      openMenu === item.href ? 'rotate-180' : ''
                    } ${active ? 'text-foreground' : 'text-muted-foreground'}`}
                  />
                )}
              </Link>

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
                      {item.children.map((child) => {
                        const childLabel = locale === 'th' ? child.labelTh : child.label;
                        const childActive = pathname.includes(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={`/${locale}${child.href}`}
                            onClick={() => setOpenMenu(null)}
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
