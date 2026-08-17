'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Zap, ChevronRight, Sparkles, Activity, 
  Users, BarChart3, Search, Command
} from 'lucide-react';
import { Tab, TabItem, UserRole, Workspace, WorkspaceItem } from './dashboard-policy';

interface AdminSidebarProps {
  role: string;
  name: string;
  interactiveAccessUntil?: string;
  state: {
    tab: Tab;
    rawTab: string;
    activeWorkspace: Workspace;
    activeSubTab: string;
    sidebarCollapsed: boolean;
    profileOpen: boolean;
    requestingAccess: boolean;
    isReadOnlyRole: boolean;
    isInteractive: boolean;
  };
  actions: {
    setTab: (tab: Tab) => void;
    setWorkspace: (ws: Workspace, sub?: string) => void;
    setSidebarCollapsed: (v: boolean) => void;
    setProfileOpen: (v: boolean | ((v: boolean) => boolean)) => void;
    setIsPwModalOpen: (v: boolean) => void;
    requestInteractiveAccess: () => void;
    logout: () => void;
  };
  navigation: {
    visibleWorkspaces: WorkspaceItem[];
    activeWorkspace: Workspace;
    activeSubTab: string;
    monitoringTabs: TabItem[];
    academyTabs: TabItem[];
    analyticsTabs: TabItem[];
    governanceTabs: TabItem[];
  };
  t: any;
}

export default function AdminSidebar({
  role,
  name,
  interactiveAccessUntil,
  state,
  actions,
  navigation,
  t
}: AdminSidebarProps) {
  const roleBadgeClass =
    role === 'admin'   ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20' :
    role === 'it'      ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20' :
    role === 'trainer' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/20' :
                         'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20';

  return (
    <aside className={`flex flex-col shrink-0 bg-background/80 backdrop-blur-2xl border-r border-border/60 sticky top-0 h-dvh pt-safe pb-safe transition-all duration-300 ${state.sidebarCollapsed ? 'w-[68px]' : 'w-[250px]'}`}>
      
      {/* Logo & Header */}
      <div className={`flex items-center h-16 border-b border-border/50 px-4 ${state.sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-md shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan via-primary to-brand-purple" />
            <span className="relative z-10 flex items-center justify-center w-full h-full text-xs font-black text-white tracking-tight">
              B
            </span>
          </div>
          {!state.sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground tracking-tight truncate">{t('title')}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t('controlPanel', { role: t(`roles.${role}`) })}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {!state.sidebarCollapsed && (
          <button
            onClick={() => actions.setSidebarCollapsed(true)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 text-xs"
            title="Collapse sidebar"
          >
            ←
          </button>
        )}
      </div>

      {/* User profile & Role */}
      <div className={`px-3 pt-3 pb-2 relative`}>
        <button
          type="button"
          onClick={() => actions.setProfileOpen(v => !v)}
          aria-label={`User menu for ${name}`}
          className={`w-full flex items-center gap-2.5 min-h-[44px] rounded-xl border transition-all hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${roleBadgeClass}
            ${state.sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2'}
          `}
          title={state.sidebarCollapsed ? name : undefined}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black uppercase shrink-0 ${roleBadgeClass}`}>
            {name.charAt(0)}
          </div>
          {!state.sidebarCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-foreground truncate">{name}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">{t(`roles.${role}`)}</p>
            </div>
          )}
        </button>

        {/* Profile popover */}
        <AnimatePresence>
          {state.profileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => actions.setProfileOpen(false)} 
                onKeyDown={(e) => { if (e.key === 'Escape') actions.setProfileOpen(false); }}
                role="button"
                tabIndex={-1}
                aria-label="Close profile popover"
              />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute z-50 top-full mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden
                  ${state.sidebarCollapsed ? 'left-full ml-2 top-0 mt-0 w-[220px]' : 'left-3 right-3'}
                `}
                role="menu"
              >
                <div className={`px-4 py-3 border-b border-border/50 flex items-center gap-3`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black uppercase border shrink-0 ${roleBadgeClass}`}>
                    {name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{name}</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider`}>{t(`roles.${role}`)}</p>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => { actions.setIsPwModalOpen(true); actions.setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 min-h-[40px] rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                  >
                    <Zap size={14} className="shrink-0" />
                    {t('changePw')}
                  </button>
                  <button
                    type="button"
                    onClick={actions.logout}
                    className="w-full flex items-center gap-2.5 px-3 min-h-[40px] rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut size={14} className="shrink-0" />
                    {t('signOut')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 4 Core Workspaces Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-hide">
        {!state.sidebarCollapsed && (
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 pt-1">
            Workspaces
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          {navigation.visibleWorkspaces.map(ws => {
            const Icon = ws.icon;
            const active = state.activeWorkspace === ws.id;
            return (
              <div key={ws.id} className="space-y-1">
                {/* Workspace Main Button */}
                <button
                  type="button"
                  onClick={() => actions.setWorkspace(ws.id, ws.defaultSubTab)}
                  title={state.sidebarCollapsed ? t(`workspaces.${ws.labelKey}`) : undefined}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${active 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-xs' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
                    }
                    ${state.sidebarCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  {active && (
                    <motion.div
                      layoutId="workspace-active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={18} className={`shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  
                  {!state.sidebarCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <p className="truncate leading-tight">{t(`workspaces.${ws.labelKey}`)}</p>
                      <p className="text-[10px] font-normal text-muted-foreground truncate">{t(`workspaces.${ws.descKey}`)}</p>
                    </div>
                  )}
                </button>

                {/* SubTabs List (shown when active and sidebar is expanded) */}
                {active && !state.sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-6 pr-1 space-y-0.5"
                  >
                    {ws.subTabs.map(sub => {
                      const SubIcon = sub.icon;
                      const subActive = state.activeSubTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => actions.setWorkspace(ws.id, sub.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all
                            ${subActive 
                              ? 'text-primary bg-primary/10 font-bold' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                            }
                          `}
                        >
                          <SubIcon size={13} className="shrink-0" />
                          <span className="truncate">{t(`workspaces.subTabs.${sub.id}`)}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer / Expand & Shortcut helper */}
      {state.sidebarCollapsed && (
        <div className="p-3 border-t border-border/40 flex justify-center">
          <button
            onClick={() => actions.setSidebarCollapsed(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 text-xs"
            title="Expand sidebar"
          >
            →
          </button>
        </div>
      )}
    </aside>
  );
}
