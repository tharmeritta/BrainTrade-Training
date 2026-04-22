'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from './useAdminDashboard';

import OverviewTab from './OverviewTab';
import HRAnalyticsTab from './HRAnalyticsTab';
import AgentsTab from './AgentsTab';
import ReportsTab from './ReportsTab';
import StaffTab from './StaffTab';
import EvaluationsTab from './EvaluationsTab';
import AdjustmentsTab from './AdjustmentsTab';
import ApprovalsTab from './ApprovalsTab';
import AiScenariosTab from './AiScenariosTab';
import TrainerPanel from '@/components/features/TrainerPanel';

interface AdminTabContentProps {
  tab: Tab;
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
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
          {tab === 'agents'      && <AgentsTab role={role} readOnly={!isInteractive} />}
          {tab === 'training'    && <TrainerPanel role={role} uid={uid} name={name} readOnly={!isInteractive} />}
          {tab === 'evaluations' && <EvaluationsTab readOnly={!isInteractive} />}
          {tab === 'reports'     && <ReportsTab readOnly={!isInteractive} />}
          {tab === 'approvals'   && <ApprovalsTab currentUserId={uid} role={role} />}
          {tab === 'staff'       && (role === 'admin' || isReadOnlyRole) && <StaffTab role={role} />}
          {tab === 'aiscenarios' && (role === 'admin' || isReadOnlyRole) && <AiScenariosTab readOnly={!isInteractive} />}
          {tab === 'adjustments' && (role === 'admin' || isReadOnlyRole) && <AdjustmentsTab role={role} readOnly={!isInteractive} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
