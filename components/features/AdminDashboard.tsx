'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Users, FileSpreadsheet, LogOut,
  ShieldCheck, ClipboardCheck, GraduationCap, Zap, Edit3, ChevronRight, Clock
} from 'lucide-react';

import TrainerPanel from '@/components/features/TrainerPanel';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LangToggle  from '@/components/ui/LangToggle';

import OverviewTab from './admin/OverviewTab';
import AgentsTab from './admin/AgentsTab';
import ReportsTab from './admin/ReportsTab';
import StaffTab from './admin/StaffTab';
import EvaluationsTab from './admin/EvaluationsTab';
import AdjustmentsTab from './admin/AdjustmentsTab';
import ApprovalsTab from './admin/ApprovalsTab';
import ChangePasswordModal from './admin/ChangePasswordModal';

type Tab = 'overview' | 'agents' | 'reports' | 'staff' | 'evaluations' | 'training' | 'adjustments' | 'approvals';

function logout() {
  fetch('/api/auth/session', { method: 'DELETE' });
  window.location.replace('/login');
}

export default function AdminDashboard({ role, uid, name, passwordChanged }: { role: 'admin' | 'manager' | 'it' | 'trainer'; uid: string; name: string; passwordChanged: boolean }) {
  const t = useTranslations('admin');
  const [tab, setTab] = useState<Tab>(role === 'trainer' ? 'training' : 'overview');
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const TABS: { id: Tab; labelKey: string; icon: React.ElementType; adminOnly?: boolean; hideForTrainer?: boolean; group?: string }[] = [
    { id: 'overview',    labelKey: 'overview',       icon: LayoutDashboard,  group: 'main' },
    { id: 'agents',      labelKey: 'agents',         icon: Users,            group: 'main' },
    { id: 'training',    labelKey: 'training',       icon: GraduationCap,    group: 'main' },
    { id: 'evaluations', labelKey: 'evaluations',    icon: ClipboardCheck,   hideForTrainer: true, group: 'main' },
    { id: 'reports',     labelKey: 'reports',        icon: FileSpreadsheet,  hideForTrainer: true, group: 'main' },
    { id: 'approvals',   labelKey: role === 'it' ? 'requestStatus' : 'approvals', icon: Clock, adminOnly: true, group: 'admin' },
    { id: 'staff',       labelKey: 'staff',          icon: ShieldCheck,      adminOnly: true, group: 'admin' },
    { id: 'adjustments', labelKey: 'adjustments',    icon: Edit3,            adminOnly: true, group: 'admin' },
  ];

  const visibleTabs = TABS.filter(t => {
    if (t.adminOnly && role !== 'admin' && role !== 'it') return false;
    if (t.hideForTrainer && role === 'trainer') return false;
    return true;
  });

  const mainTabs  = visibleTabs.filter(t => t.group === 'main');
  const adminTabs = visibleTabs.filter(t => t.group === 'admin');

  const activeTab = visibleTabs.find(t => t.id === tab);

  const roleBadgeClass =
    role === 'admin'   ? 'bg-purple-500/15 text-purple-400 border-purple-500/20' :
    role === 'it'      ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' :
    role === 'trainer' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                         'bg-slate-500/15 text-slate-400 border-slate-500/20';

  function NavGroup({ label, items }: { label?: string; items: typeof visibleTabs }) {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        {label && !sidebarCollapsed && (
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-3 mb-1.5 mt-3">
            {label}
          </p>
        )}
        {label && sidebarCollapsed && <div className="my-2 border-t border-border/30" />}
        <div className="flex flex-col gap-0.5">
          {items.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                title={sidebarCollapsed ? t(`tabs.${item.labelKey}`) : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                  ${active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }
                  ${sidebarCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon size={16} className={`shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left">{t(`tabs.${item.labelKey}`)}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className={`flex flex-col shrink-0 bg-background/70 backdrop-blur-2xl border-r border-border/40 sticky top-0 h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'}`}>

          {/* Logo */}
          <div className={`flex items-center h-16 border-b border-border/40 px-4 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-orange-400" />
              <span className="relative z-10 flex items-center justify-center w-full h-full text-[10px] font-black text-white tracking-tight">
                BT
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground tracking-tight truncate">{t('title')}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t('controlPanel', { role: t(`roles.${role}`) })}</p>
              </div>
            )}
          </div>

          {/* User badge — clickable to open profile popover */}
          <div className={`px-3 pt-4 pb-2 relative`}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              className={`w-full flex items-center gap-2.5 rounded-xl border transition-all hover:opacity-80 active:scale-[0.98]
                ${roleBadgeClass}
                ${sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2.5'}
              `}
              title={sidebarCollapsed ? name : undefined}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${roleBadgeClass}`}>
                {name.charAt(0)}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-foreground truncate">{name}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider">{t(`roles.${role}`)}</p>
                </div>
              )}
            </button>

            {/* Profile popover */}
            <AnimatePresence>
              {profileOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute z-50 top-full mt-2 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden
                      ${sidebarCollapsed ? 'left-full ml-2 top-0 mt-0 w-[220px]' : 'left-3 right-3'}
                    `}
                  >
                    {/* Header */}
                    <div className={`px-4 py-3 border-b border-border/50 flex items-center gap-3`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black uppercase border shrink-0 ${roleBadgeClass}`}>
                        {name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider`}>{t(`roles.${role}`)}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={() => { setIsPwModalOpen(true); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                      >
                        <Zap size={14} className="shrink-0" />
                        {t('changePw')}
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-hide">
            <NavGroup items={mainTabs} />
            {adminTabs.length > 0 && <NavGroup label="Admin" items={adminTabs} />}
          </nav>

          {/* Bottom: collapse + logout */}
          <div className={`border-t border-border/40 p-2 flex flex-col gap-1`}>
            <button
              onClick={logout}
              title={t('signOut')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut size={15} className="shrink-0" />
              {!sidebarCollapsed && <span>{t('signOut')}</span>}
            </button>
            <button
              onClick={() => setSidebarCollapsed(v => !v)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-secondary/40 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <ChevronRight size={13} className={`shrink-0 transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
              {!sidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* ── Main area ─────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-background/60 backdrop-blur-2xl border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              {activeTab && (
                <>
                  <activeTab.icon size={18} className="text-primary shrink-0" />
                  <div>
                    <h1 className="text-sm font-black text-foreground tracking-tight leading-tight">
                      {t(`tabs.${activeTab.labelKey}`)}
                    </h1>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {new Date().toLocaleDateString(
                        t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB',
                        { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 p-1 bg-muted/50 border border-border/50 rounded-full">
                <LangToggle />
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-6 py-8 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'overview'    && <OverviewTab />}
                {tab === 'agents'      && <AgentsTab role={role} />}
                {tab === 'training'    && <TrainerPanel role={role} uid={uid} name={name} />}
                {tab === 'evaluations' && <EvaluationsTab />}
                {tab === 'reports'     && <ReportsTab />}
                {tab === 'approvals'   && <ApprovalsTab currentUserId={uid} role={role} />}
                {tab === 'staff'       && (role === 'admin' || role === 'it') && <StaffTab role={role} />}
                {tab === 'adjustments' && (role === 'admin' || role === 'it') && <AdjustmentsTab role={role} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
