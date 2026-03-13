'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
import { LogOut, LayoutDashboard, GraduationCap, ClipboardList, Mic, User, Settings } from 'lucide-react';

const agentLinks = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'learn', href: '/learn/product', icon: GraduationCap },
  { key: 'quiz', href: '/quiz/product', icon: ClipboardList },
  { key: 'aiEval', href: '/ai-eval', icon: Mic },
  { key: 'pitch', href: '/pitch', icon: Mic },
] as const;

const adminLinks = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'admin', href: '/admin', icon: Settings },
] as const;

export default function NavBar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'th';
  const { user, mode, setMode } = useUser();

  const links = mode === 'admin' ? adminLinks : agentLinks;

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = '/login';
  }

  return (
    <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between mx-4 mt-4 rounded-2xl border border-white/20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">B</span>
        </div>
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-brand-dark">
          BrainTrade
        </span>
      </div>

      <div className="hidden md:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl">
        {links.map(l => {
          const Icon = l.icon;
          const isActive = pathname.includes(l.href);
          return (
            <Link
              key={l.key}
              href={`/${locale}${l.href}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
            >
              <Icon size={18} />
              {t(l.key)}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'admin' && (
          <button
            onClick={() => setMode(mode === 'admin' ? 'agent' : 'admin')}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all duration-200 font-semibold ${
              mode === 'admin'
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {mode === 'admin' ? <Settings size={14} /> : <User size={14} />}
            {mode === 'admin' ? 'Admin Mode' : 'Agent Mode'}
          </button>
        )}

        <button
          onClick={handleSignOut}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors duration-200"
          title={t('signOut')}
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
