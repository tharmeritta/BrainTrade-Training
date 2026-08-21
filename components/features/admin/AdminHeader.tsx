'use client';

import Link from 'next/link';
import { 
  UserCheck, Zap, ExternalLink, Presentation, 
  Search, Command, SlidersHorizontal, Sparkles 
} from 'lucide-react';
import LangToggle  from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { setAgentSession } from '@/lib/session/agent';
import { TabItem, UserRole, Workspace } from './dashboard-policy';

interface AdminHeaderProps {
  activeTab?: TabItem;
  activeWorkspace?: Workspace;
  activeSubTab?: string;
  mounted: boolean;
  role?: string;
  activeRoleView?: UserRole;
  viewMode?: 'essentials' | 'power';
  onRoleViewChange?: (r: UserRole) => void;
  onViewModeChange?: (m: 'essentials' | 'power') => void;
  t: any;
}

export default function AdminHeader({ 
  activeTab, 
  activeWorkspace,
  activeSubTab,
  mounted, 
  role = 'admin', 
  activeRoleView = 'admin', 
  viewMode = 'essentials',
  onRoleViewChange, 
  onViewModeChange,
  t 
}: AdminHeaderProps) {
  const isAdmin = role === 'admin';

  const handlePreviewAgent = () => {
    setAgentSession({
      id: 'admin-preview-agent',
      name: 'Admin Preview Agent',
      stageName: 'Admin Sandbox',
      email: 'admin@braintrade.com'
    });
  };

  const triggerCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border/50 bg-card/40 backdrop-blur-xl sticky top-0 z-20">
      {/* Left: Workspace Title, Breadcrumbs & Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight flex items-center gap-1.5 truncate">
              <span>{activeWorkspace ? t(`workspaces.${activeWorkspace}`) : t('title')}</span>
              {activeSubTab && (
                <>
                  <span className="text-muted-foreground/40 font-normal">/</span>
                  <span className="text-primary font-bold text-xs sm:text-sm">
                    {t(`workspaces.subTabs.${activeSubTab}`)}
                  </span>
                </>
              )}
            </h1>
            <span className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground hidden md:block">
            {activeWorkspace ? t(`workspaces.${activeWorkspace}Desc`) : t('subtitle')}
          </p>
        </div>
      </div>

      {/* Right: Quick Tools, Hubs & Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        {/* Quick Command Palette (Cmd+K) */}
        <button
          onClick={triggerCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/60 hover:bg-muted border border-border/70 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-2xs"
          title="Search workspaces, courses, tools (⌘K)"
        >
          <Search size={13} className="text-primary" />
          <span className="hidden xl:inline">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-background border border-border px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
            ⌘K
          </kbd>
        </button>

        {/* View Mode Toggle (Essentials vs Power Admin) */}
        {isAdmin && onViewModeChange && (
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60 text-xs font-bold">
            <button
              onClick={() => onViewModeChange('essentials')}
              className={`px-2.5 py-1 rounded-lg transition-all ${viewMode === 'essentials' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground'}`}
              title="Clean, streamlined view with key priorities"
            >
              {t('workspaces.essentialsMode')}
            </button>
            <button
              onClick={() => onViewModeChange('power')}
              className={`px-2.5 py-1 rounded-lg transition-all ${viewMode === 'power' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground'}`}
              title="Full power mode with granular controls and JSON debuggers"
            >
              {t('workspaces.powerMode')}
            </button>
          </div>
        )}

        {/* Role View Switcher */}
        {isAdmin && onRoleViewChange && mounted && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/60 border border-border/60 rounded-xl">
            <span className="text-xs text-muted-foreground font-semibold hidden 2xl:inline">View as:</span>
            <select
              value={activeRoleView}
              onChange={(e) => onRoleViewChange(e.target.value as UserRole)}
              aria-label="View platform as role"
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-card text-foreground font-bold">🛡️ Full Admin</option>
              <option value="manager" className="bg-card text-foreground font-bold">👔 Manager</option>
              <option value="trainer" className="bg-card text-foreground font-bold">🎓 Trainer</option>
              <option value="evaluator" className="bg-card text-foreground font-bold">📋 Evaluator</option>
              <option value="hr" className="bg-card text-foreground font-bold">📊 HR Analytics</option>
              <option value="it" className="bg-card text-foreground font-bold">💻 IT Operations</option>
            </select>
          </div>
        )}

        {/* Consolidated Launch Hubs Action Group */}
        {isAdmin && (
          <div className="hidden md:flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60 text-xs font-bold gap-0.5">
            <Link
              href="?tab=studio&sub=presentation"
              className="flex items-center gap-1.5 px-2.5 py-1 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
              title="Open Live Trainer Presentation Deck & Whiteboard"
            >
              <Presentation size={13} />
              <span>{t('workspaces.subTabs.presenterMode') || 'Presenter'}</span>
            </Link>

            <span className="w-px h-3.5 bg-border/60" />

            <Link
              href="/demo"
              target="_blank"
              className="flex items-center gap-1 px-2.5 py-1 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all"
              title="Open Standalone Client Showcase Hub"
            >
              <span>Showcase</span>
              <ExternalLink size={10} className="opacity-70" />
            </Link>

            <span className="w-px h-3.5 bg-border/60" />

            <Link
              href="/dashboard"
              target="_blank"
              onClick={handlePreviewAgent}
              className="flex items-center gap-1 px-2.5 py-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
              title="Preview Live Agent Hub without logging out"
            >
              <UserCheck size={12} />
              <span>Agent</span>
              <ExternalLink size={10} className="opacity-70" />
            </Link>
          </div>
        )}

        {/* Global Controls */}
        <div className="flex items-center gap-0.5 p-0.5 bg-muted/50 border border-border/50 rounded-full shrink-0">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
