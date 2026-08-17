'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, ShieldCheck, ClipboardCheck, Sparkles } from 'lucide-react';

import AgentSection from '../staff/AgentSection';
import StaffSection from '../staff/StaffSection';
import EvaluationsTab from '../EvaluationsTab';
import AccessNotes from '../staff/AccessNotes';
import StaffAiCopilot from '@/components/ui/StaffAiCopilot';

export type RosterSubTab = 'agents' | 'staff' | 'evaluations';

interface RosterHubProps {
  role: string;
  uid: string;
  name: string;
  readOnly?: boolean;
  initialSubTab?: string;
}

export default function RosterHub({ role, uid, name, readOnly, initialSubTab = 'agents' }: RosterHubProps) {
  const t = useTranslations('admin');
  const [activeSubTab, setActiveSubTab] = useState<RosterSubTab>((initialSubTab as RosterSubTab) || 'agents');

  const SUB_TABS = useMemo(() => [
    { id: 'agents',      label: t('workspaces.subTabs.agents'),      icon: Users,          desc: 'Trainee Directory & Status' },
    { id: 'staff',       label: t('workspaces.subTabs.staff'),       icon: ShieldCheck,    desc: 'Staff Accounts & Roles', adminOnly: true },
    { id: 'evaluations', label: t('workspaces.subTabs.evaluations'), icon: ClipboardCheck, desc: 'Simulation Evaluations', hideForTrainer: true },
  ], [t]);

  const visibleSubTabs = useMemo(() => {
    if (role === 'admin') return SUB_TABS;
    return SUB_TABS.filter(st => {
      if (st.adminOnly && role !== 'admin') return false;
      if (st.hideForTrainer && role === 'trainer') return false;
      return true;
    });
  }, [role, SUB_TABS]);

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Roster Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border/70 p-3 sm:p-4 rounded-2xl shadow-sm">
        {/* Left: Subtabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {visibleSubTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as RosterSubTab)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${active 
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: AI Copilot trigger badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold shrink-0 self-end sm:self-auto">
          <Sparkles size={14} className="text-primary" />
          <span>Staff Copilot Enabled</span>
        </div>
      </div>

      {/* Subtab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="w-full flex-1 flex flex-col space-y-6"
        >
          {activeSubTab === 'agents' && (
            <div className="space-y-6">
              <AgentSection role={role} />
              <AccessNotes />
            </div>
          )}

          {activeSubTab === 'staff' && (
            <div className="space-y-6">
              <StaffSection role={role} />
              <AccessNotes />
            </div>
          )}

          {activeSubTab === 'evaluations' && (
            <EvaluationsTab readOnly={readOnly} />
          )}
        </motion.div>
      </AnimatePresence>

      <StaffAiCopilot />
    </div>
  );
}
