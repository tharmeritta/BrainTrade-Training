'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, Activity, Clock, History, 
  Sparkles 
} from 'lucide-react';

import OverviewTab from '../OverviewTab';
import ApprovalsTab from '../ApprovalsTab';
import HistoryTab from '../HistoryTab';

export type OperationsSubTab = 'overview' | 'approvals' | 'history';

interface OperationsHubProps {
  role: string;
  uid: string;
  name: string;
  readOnly?: boolean;
  initialSubTab?: string;
}

export default function OperationsHub({ role, uid, readOnly, initialSubTab = 'overview' }: OperationsHubProps) {
  const t = useTranslations('admin');
  const [activeSubTab, setActiveSubTab] = useState<OperationsSubTab>((initialSubTab as OperationsSubTab) || 'overview');

  const SUB_TABS = useMemo(() => [
    { id: 'overview',  label: t('workspaces.subTabs.overview'),  icon: LayoutDashboard, desc: 'Realtime KPIs & Pipeline' },
    { id: 'approvals', label: t('workspaces.subTabs.approvals'), icon: Clock,           desc: 'Pending Access Requests', adminOnly: true },
    { id: 'history',   label: t('workspaces.subTabs.history'),   icon: History,         desc: 'System Audit Logs' },
  ], [t]);

  const visibleSubTabs = useMemo(() => {
    if (role === 'admin') return SUB_TABS;
    return SUB_TABS.filter(st => !st.adminOnly);
  }, [role, SUB_TABS]);

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Operations Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border/70 p-3 sm:p-4 rounded-2xl shadow-sm">
        {/* Left: Operations Subtabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {visibleSubTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as OperationsSubTab)}
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

        {/* Right: Live Operations Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold shrink-0 self-end sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Real-time Stream Active</span>
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
          className="w-full flex-1 flex flex-col"
        >
          {activeSubTab === 'overview' && (
            <OverviewTab readOnly={readOnly} />
          )}

          {activeSubTab === 'approvals' && (
            <ApprovalsTab 
              role={role} 
              currentUserId={uid} 
            />
          )}

          {activeSubTab === 'history' && (
            <HistoryTab />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
