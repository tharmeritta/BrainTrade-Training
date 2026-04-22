'use client';

import { useAdminDashboard } from './admin/useAdminDashboard';
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import AdminTabContent from './admin/AdminTabContent';
import ChangePasswordModal from './admin/ChangePasswordModal';

interface AdminDashboardProps {
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  uid: string;
  name: string;
  passwordChanged: boolean;
  interactiveAccessUntil?: string;
}

const AmbientBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
    <div className="absolute top-[40%] right-[-10%] w-[30%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
    <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px]" />
  </div>
);

export default function AdminDashboard(props: AdminDashboardProps) {
  const { state, actions, navigation, t } = useAdminDashboard(props);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <ChangePasswordModal 
        isOpen={state.isPwModalOpen} 
        onClose={() => actions.setIsPwModalOpen(false)} 
      />

      <AmbientBackground />

      <div className="relative z-10 flex min-h-screen">
        <AdminSidebar 
          role={props.role}
          name={props.name}
          interactiveAccessUntil={props.interactiveAccessUntil}
          state={state}
          actions={actions}
          navigation={navigation}
          t={t}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <AdminHeader 
            activeTab={navigation.activeTab} 
            mounted={state.mounted}
            t={t}
          />

          <AdminTabContent 
            tab={state.tab}
            role={props.role}
            uid={props.uid}
            name={props.name}
            isInteractive={state.isInteractive}
          />
        </div>
      </div>
    </div>
  );
}
