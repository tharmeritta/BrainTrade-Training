'use client';

import Link from 'next/link';
import { UserCheck, Zap, ExternalLink, Presentation } from 'lucide-react';
import LangToggle  from '@/components/ui/LangToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { setAgentSession } from '@/lib/session/agent';
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

  const handlePreviewAgent = () => {
    setAgentSession({
      id: 'admin-preview-agent',
      name: 'Admin Preview Agent',
      stageName: 'Admin Sandbox',
      email: 'admin@braintrade.com'
    });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card/30 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          {t('title')}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Live QA Mode
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t('subtitle')}</p>
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && onRoleViewChange && mounted && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 border border-border/60 rounded-xl">
            <span className="text-xs text-muted-foreground font-semibold">View as:</span>
            <select
              value={activeRoleView}
              onChange={(e) => onRoleViewChange(e.target.value as UserRole)}
              aria-label="View platform as role"
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="admin" className="bg-card text-foreground font-bold">🛡️ Full Admin</option>
              <option value="manager" className="bg-card text-foreground font-bold">👔 Manager View</option>
              <option value="trainer" className="bg-card text-foreground font-bold">🎓 Trainer View</option>
              <option value="evaluator" className="bg-card text-foreground font-bold">📋 Evaluator View</option>
              <option value="hr" className="bg-card text-foreground font-bold">📊 HR Analytics</option>
              <option value="it" className="bg-card text-foreground font-bold">💻 IT Operations</option>
            </select>
          </div>
        )}

        {isAdmin && (
          <>
            <Link
              href="/demo"
              target="_blank"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Open Standalone Client Showcase & Sales Presentation Hub"
            >
              <Presentation size={14} />
              <span>Client Showcase Hub</span>
              <ExternalLink size={12} className="opacity-70" />
            </Link>

            <Link
              href="/dashboard"
              target="_blank"
              onClick={handlePreviewAgent}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Preview Live Agent AI Scenarios & Quiz Platform without logging out"
            >
              <UserCheck size={14} />
              <span>Preview Agent Hub</span>
              <ExternalLink size={12} className="opacity-70" />
            </Link>
          </>
        )}

        <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full shrink-0">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
