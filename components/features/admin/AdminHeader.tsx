'use client';

import Link from 'next/link';
import { UserCheck, Zap, ExternalLink } from 'lucide-react';
import LangToggle  from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { TabItem, UserRole } from './dashboard-policy';

interface AdminHeaderProps {
  activeTab?: TabItem;
  mounted: boolean;
  role?: string;
  activeRoleView?: UserRole;
  onRoleViewChange?: (r: UserRole) => void;
  t: any;
}

export default function AdminHeader({ 
  activeTab, 
  mounted, 
  role = 'admin', 
  activeRoleView = 'admin', 
  onRoleViewChange, 
  t 
}: AdminHeaderProps) {
  const isAdmin = role === 'admin';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-background/60 backdrop-blur-2xl border-b border-border/40 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {activeTab && (
          <>
            <activeTab.icon size={18} className="text-primary shrink-0" />
            <div>
              <h1 className="text-sm font-black text-foreground tracking-tight leading-tight">
                {t(`tabs.${activeTab.labelKey}`)}
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {mounted && new Date().toLocaleDateString(
                  t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB',
                  { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
                )}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Admin Role Switcher & Bypass Bar */}
      <div className="flex items-center gap-3">
        {isAdmin && onRoleViewChange && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-2xl">
            <Zap size={14} className="text-primary animate-pulse shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-primary hidden sm:inline">
              Admin Bypass View:
            </span>
            <select
              value={activeRoleView}
              onChange={(e) => onRoleViewChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold text-foreground border-none focus:outline-none cursor-pointer pr-1"
            >
              <option value="admin" className="bg-card text-foreground font-bold">🛡️ Full Admin</option>
              <option value="manager" className="bg-card text-foreground font-bold">👔 Manager View</option>
              <option value="trainer" className="bg-card text-foreground font-bold">🎓 Trainer Workspace</option>
              <option value="evaluator" className="bg-card text-foreground font-bold">📋 Evaluator View</option>
              <option value="hr" className="bg-card text-foreground font-bold">📊 HR Analytics</option>
              <option value="it" className="bg-card text-foreground font-bold">💻 IT Operations</option>
            </select>
          </div>
        )}

        {isAdmin && (
          <Link
            href="/learn"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Preview Live Agent Training Platform without logging out"
          >
            <UserCheck size={14} />
            <span>Agent Hub Preview</span>
            <ExternalLink size={12} className="opacity-70" />
          </Link>
        )}

        <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full shrink-0">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
