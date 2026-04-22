'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from './dashboard-policy';
import { UserRole } from './dashboard-policy';

// Lazy load all tab components to reduce initial bundle size
const OverviewTab = dynamic(() => import('./OverviewTab'), { loading: () => <TabLoader /> });
const HRAnalyticsTab = dynamic(() => import('./HRAnalyticsTab'), { loading: () => <TabLoader /> });
const ReportsTab = dynamic(() => import('./ReportsTab'), { loading: () => <TabLoader /> });
const StaffTab = dynamic(() => import('./StaffTab'), { loading: () => <TabLoader /> });
const EvaluationsTab = dynamic(() => import('./EvaluationsTab'), { loading: () => <TabLoader /> });
const AdjustmentsTab = dynamic(() => import('./AdjustmentsTab'), { loading: () => <TabLoader /> });
const ApprovalsTab = dynamic(() => import('./ApprovalsTab'), { loading: () => <TabLoader /> });
const AiScenariosTab = dynamic(() => import('./AiScenariosTab'), { loading: () => <TabLoader /> });
const HistoryTab = dynamic(() => import('./HistoryTab'), { loading: () => <TabLoader /> });
const TrainerPanel = dynamic(() => import('@/components/features/TrainerPanel'), { loading: () => <TabLoader /> });

function TabLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

interface AdminTabContentProps {
  tab: Tab;
  role: UserRole;
  uid: string;
  name: string;
  isInteractive: boolean;
}

export default function AdminTabContent({ tab, role, uid, name, isInteractive }: AdminTabContentProps) {
  const isReadOnlyRole = role === 'it' || role === 'manager' || role === 'hr';
  
  return (
    <main className="flex-1 px-6 py-8 overflow-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'overview'    && <OverviewTab readOnly={!isInteractive} />}
          {tab === 'hranalytics' && <HRAnalyticsTab readOnly={!isInteractive} />}
          {tab === 'training'    && <TrainerPanel role={role} uid={uid} name={name} readOnly={!isInteractive} />}
          {tab === 'evaluations' && <EvaluationsTab readOnly={!isInteractive} />}
          {tab === 'reports'     && <ReportsTab readOnly={!isInteractive} />}
          {tab === 'approvals'   && <ApprovalsTab currentUserId={uid} role={role} />}
          {tab === 'staff'       && (role === 'admin' || isReadOnlyRole) && <StaffTab role={role} />}
          {tab === 'aiscenarios' && (role === 'admin' || isReadOnlyRole) && <AiScenariosTab readOnly={!isInteractive} />}
          {tab === 'adjustments' && (role === 'admin' || isReadOnlyRole) && <AdjustmentsTab role={role} readOnly={!isInteractive} />}
          {tab === 'history'     && <HistoryTab />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
