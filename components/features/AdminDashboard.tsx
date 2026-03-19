'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Users, FileSpreadsheet, LogOut,
  ShieldCheck, ClipboardCheck, GraduationCap, Zap, Edit3
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
import ChangePasswordModal from './admin/ChangePasswordModal';

type Tab = 'overview' | 'agents' | 'reports' | 'staff' | 'evaluations' | 'training' | 'adjustments';

function logout() {
  fetch('/api/auth/session', { method: 'DELETE' });
  window.location.replace('/login');
}

export default function AdminDashboard({ role, uid, name, passwordChanged }: { role: 'admin' | 'manager' | 'trainer'; uid: string; name: string; passwordChanged: boolean }) {
  const t = useTranslations('admin');
  const [tab, setTab] = useState<Tab>(role === 'trainer' ? 'training' : 'overview');
  const [isPwModalOpen, setIsPwModalOpen] = useState(!passwordChanged);

  useEffect(() => {
    if (!passwordChanged) setIsPwModalOpen(true);
  }, [passwordChanged]);

  const TABS: { id: Tab; labelKey: string; icon: React.ElementType; adminOnly?: boolean; hideForTrainer?: boolean }[] = [
    { id: 'overview',    labelKey: 'overview',       icon: LayoutDashboard,  hideForTrainer: false },
    { id: 'agents',      labelKey: 'agents',         icon: Users },
    { id: 'training',    labelKey: 'training',       icon: GraduationCap },
    { id: 'evaluations', labelKey: 'evaluations',    icon: ClipboardCheck,   hideForTrainer: true },
    { id: 'reports',     labelKey: 'reports',        icon: FileSpreadsheet,  hideForTrainer: true },
    { id: 'staff',       labelKey: 'staff',          icon: ShieldCheck,      adminOnly: true },
    { id: 'adjustments', labelKey: 'adjustments',    icon: Edit3,            adminOnly: true },
  ];

  const visibleTabs = TABS.filter(t => {
    if (t.adminOnly && role !== 'admin') return false;
    if (t.hideForTrainer && role === 'trainer') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={isPwModalOpen} onClose={() => setIsPwModalOpen(false)} />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top header */}
        <div className="bg-background/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">{t('title')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('controlPanel', { role: t(`roles.${role}`) })} · {new Date().toLocaleDateString(t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-secondary/50 border border-border/50">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                role === 'admin' ? 'bg-purple-500/15 text-purple-400' :
                role === 'trainer' ? 'bg-amber-500/15 text-amber-400' :
                'bg-blue-500/15 text-blue-400'
              }`}>
                {t(`roles.${role}`)}
              </span>
              <span className="text-xs font-bold text-foreground pr-1">{name}</span>
              <button 
                onClick={() => setIsPwModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                title={t('changePw')}
              >
                <Zap size={14} />
              </button>
            </div>

            <button onClick={logout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors border border-border px-3 py-2 rounded-xl hover:border-destructive/30"
            >
              <LogOut size={16} /> {t('signOut')}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-6 mt-6 w-full max-w-7xl mx-auto">
          <div className="inline-flex max-w-full overflow-x-auto gap-1 p-1.5 bg-secondary/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm scrollbar-hide">
            {visibleTabs.map(t_item => {
              const Icon = t_item.icon;
              const active = tab === t_item.id;
              return (
                <button
                  key={t_item.id}
                  onClick={() => setTab(t_item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                    active
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon size={16} className={active ? "text-primary" : ""} /> {t(`tabs.${t_item.labelKey}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
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
              {tab === 'training'    && <TrainerPanel role={role} />}
              {tab === 'evaluations' && <EvaluationsTab />}
              {tab === 'reports'     && <ReportsTab />}
              {tab === 'staff'       && role === 'admin' && <StaffTab />}
              {tab === 'adjustments' && role === 'admin' && <AdjustmentsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
