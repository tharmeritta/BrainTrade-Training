'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  BarChart3, FileSpreadsheet, Award, HeartPulse, 
  Activity 
} from 'lucide-react';

import HRAnalyticsTab from '../HRAnalyticsTab';
import ReportsTab from '../ReportsTab';
import { CertificateTab } from '../CertificateTab';
import SystemHealthRadar from '../SystemHealthRadar';
import HealthManager from '../adjustments/HealthManager';

export type AnalyticsSubTab = 'heatmap' | 'reports' | 'certification' | 'health';

interface AnalyticsHubProps {
  role: string;
  uid: string;
  name: string;
  readOnly?: boolean;
  initialSubTab?: string;
}

export default function AnalyticsHub({ role, readOnly, initialSubTab = 'heatmap' }: AnalyticsHubProps) {
  const t = useTranslations('admin');
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>((initialSubTab as AnalyticsSubTab) || 'heatmap');

  const SUB_TABS = useMemo(() => [
    { id: 'heatmap',       label: t('workspaces.subTabs.heatmap'),       icon: BarChart3,       desc: 'Cohort Progress Matrix' },
    { id: 'reports',       label: t('workspaces.subTabs.reports'),       icon: FileSpreadsheet, desc: 'Excel Exports & Records', hideForTrainer: true },
    { id: 'certification', label: t('workspaces.subTabs.certification'), icon: Award,           desc: 'Certificates & Graduation', adminOnly: true, hideForIT: true },
    { id: 'health',        label: t('workspaces.subTabs.health'),        icon: HeartPulse,      desc: 'System Health Radar', adminOnly: true },
  ], [t]);

  const visibleSubTabs = useMemo(() => {
    if (role === 'admin') return SUB_TABS;
    return SUB_TABS.filter(st => {
      if (st.adminOnly && role !== 'admin') return false;
      if (st.hideForTrainer && role === 'trainer') return false;
      if (st.hideForIT && role === 'it') return false;
      return true;
    });
  }, [role, SUB_TABS]);

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Analytics Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border/70 p-3 sm:p-4 rounded-2xl shadow-sm">
        {/* Left: Subtabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {visibleSubTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as AnalyticsSubTab)}
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

        {/* Right: Data Health Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold shrink-0 self-end sm:self-auto">
          <Activity size={14} />
          <span>Real-time Analytics Engine</span>
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
          {activeSubTab === 'heatmap' && (
            <HRAnalyticsTab readOnly={readOnly} />
          )}

          {activeSubTab === 'reports' && (
            <ReportsTab readOnly={readOnly} />
          )}

          {activeSubTab === 'certification' && (
            <CertificateTab />
          )}

          {activeSubTab === 'health' && (
            <div className="space-y-6">
              <SystemHealthRadar />
              <HealthManager readOnly={readOnly} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
