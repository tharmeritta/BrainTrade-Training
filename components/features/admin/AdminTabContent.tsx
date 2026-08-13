'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab, UserRole } from './dashboard-policy';

// Tab Loader component
const TabLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    className="flex items-center justify-center min-h-[400px] w-full"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </motion.div>
);

// Tab Registry for dynamic imports
const TAB_REGISTRY: Record<Tab, any> = {
  overview:    dynamic(() => import('./OverviewTab'), { loading: TabLoader }),
  hranalytics: dynamic(() => import('./HRAnalyticsTab'), { loading: TabLoader }),
  training:    dynamic(() => import('@/components/features/trainer/TrainerPanel'), { loading: TabLoader }),
  evaluations: dynamic(() => import('./EvaluationsTab'), { loading: TabLoader }),
  reports:     dynamic(() => import('./ReportsTab'), { loading: TabLoader }),
  approvals:   dynamic(() => import('./ApprovalsTab'), { loading: TabLoader }),
  staff:       dynamic(() => import('./StaffTab'), { loading: TabLoader }),
  aiscenarios: dynamic(() => import('./AiScenariosTab'), { loading: TabLoader }),
  certification: dynamic(() => import('./CertificateTab').then(m => m.CertificateTab), { loading: TabLoader }),
  showcase:    dynamic(() => import('./ShowcaseTab'), { loading: TabLoader }),
  adjustments: dynamic(() => import('./AdjustmentsTab'), { loading: TabLoader }),
  history:     dynamic(() => import('./HistoryTab'), { loading: TabLoader }),
};

interface AdminTabContentProps {
  tab: Tab;
  role: UserRole;
  uid: string;
  name: string;
  isInteractive: boolean;
}

export default function AdminTabContent({ tab, role, uid, name, isInteractive }: AdminTabContentProps) {
  const TabComponent = TAB_REGISTRY[tab];
  const isReadOnlyRole = role === 'it' || role === 'manager' || role === 'hr';

  // Permission check for sensitive tabs
  const isSensitiveTab = ['staff', 'aiscenarios', 'adjustments'].includes(tab);
  const hasAccess = !isSensitiveTab || (role === 'admin' || isReadOnlyRole);

  if (!hasAccess) {
    return <div className="flex-1 px-6 py-8">Access Denied</div>;
  }

  return (
    <motion.main className="flex-1 px-6 py-8 overflow-auto min-h-0 w-full flex flex-col">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex-1 flex flex-col min-h-0"
        >
          {TabComponent && (
            <TabComponent 
              role={role} 
              uid={uid} 
              name={name} 
              readOnly={!isInteractive}
              currentUserId={uid} // For ApprovalsTab
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.main>
  );
}

