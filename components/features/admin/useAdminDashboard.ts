'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Users, FileSpreadsheet,
  ShieldCheck, ClipboardCheck, GraduationCap, Zap, Edit3, Clock
} from 'lucide-react';

export type Tab = 'overview' | 'hranalytics' | 'agents' | 'reports' | 'staff' | 'evaluations' | 'training' | 'adjustments' | 'approvals' | 'aiscenarios';

export interface TabItem {
  id: Tab;
  labelKey: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  hideForTrainer?: boolean;
  hideForIT?: boolean;
  group?: string;
}

interface UseAdminDashboardProps {
  role: 'admin' | 'manager' | 'it' | 'trainer' | 'hr';
  uid: string;
  name: string;
  interactiveAccessUntil?: string;
}

export function useAdminDashboard({ role, uid, name, interactiveAccessUntil }: UseAdminDashboardProps) {
  const t = useTranslations('admin');
  
  const [tab, setTab] = useState<Tab>(
    role === 'trainer' ? 'training' : 
    role === 'hr' ? 'hranalytics' :
    role === 'it' ? 'staff' : 
    'overview'
  );
  
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReadOnlyRole = useMemo(() => 
    role === 'it' || role === 'manager' || role === 'hr'
  , [role]);

  const isInteractive = useMemo(() => 
    !!(role === 'admin' || role === 'trainer' || (
      isReadOnlyRole && interactiveAccessUntil && new Date(interactiveAccessUntil) > new Date()
    ))
  , [role, isReadOnlyRole, interactiveAccessUntil]);

  const TABS: TabItem[] = useMemo(() => [
    { id: 'overview',    labelKey: 'overview',       icon: LayoutDashboard,  group: 'main' },
    { id: 'hranalytics', labelKey: 'hranalytics',    icon: Users,            group: 'main' },
    { id: 'agents',      labelKey: 'agents',         icon: Users,            group: 'main' },
    { id: 'training',    labelKey: 'training',       icon: GraduationCap,    group: 'main' },
    { id: 'evaluations', labelKey: 'evaluations',    icon: ClipboardCheck,   hideForTrainer: true, group: 'main' },
    { id: 'reports',     labelKey: 'reports',        icon: FileSpreadsheet,  hideForTrainer: true, group: 'main' },
    { id: 'approvals',   labelKey: isReadOnlyRole ? 'requestStatus' : 'approvals', icon: Clock, adminOnly: true, group: 'admin' },
    { id: 'staff',       labelKey: 'staff',          icon: ShieldCheck,      adminOnly: true, group: 'admin' },
    { id: 'aiscenarios', labelKey: 'aiscenarios',    icon: Zap,              adminOnly: true, hideForIT: true, group: 'admin' },
    { id: 'adjustments', labelKey: 'adjustments',    icon: Edit3,            adminOnly: true, hideForIT: true, group: 'admin' },
  ], [isReadOnlyRole]);

  const visibleTabs = useMemo(() => TABS.filter(t => {
    if (t.hideForIT && role === 'it') return false;
    if (role === 'hr' && t.id !== 'hranalytics' && t.id !== 'overview' && t.id !== 'reports') return false;
    if (isReadOnlyRole) return true;
    if (t.adminOnly && role !== 'admin') return false;
    if (t.hideForTrainer && role === 'trainer') return false;
    return true;
  }), [TABS, role, isReadOnlyRole]);

  const mainTabs  = useMemo(() => visibleTabs.filter(t => t.group === 'main'), [visibleTabs]);
  const adminTabs = useMemo(() => visibleTabs.filter(t => t.group === 'admin'), [visibleTabs]);

  const activeTab = useMemo(() => visibleTabs.find(t => t.id === tab), [visibleTabs, tab]);

  async function requestInteractiveAccess() {
    setRequestingAccess(true);
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'request_interactive_access',
          data: {},
        }),
      });
      if (res.ok) {
        alert(t('it.requestSent'));
      } else {
        alert(t('it.requestFailed'));
      }
    } catch {
      alert('Network error');
    } finally {
      setRequestingAccess(false);
    }
  }

  const logout = () => {
    fetch('/api/auth/session', { method: 'DELETE' });
    window.location.replace('/login');
  };

  return {
    state: {
      tab,
      isPwModalOpen,
      sidebarCollapsed,
      profileOpen,
      requestingAccess,
      mounted,
      isReadOnlyRole,
      isInteractive,
    },
    actions: {
      setTab,
      setIsPwModalOpen,
      setSidebarCollapsed,
      setProfileOpen,
      requestInteractiveAccess,
      logout,
    },
    navigation: {
      mainTabs,
      adminTabs,
      activeTab,
      visibleTabs,
    },
    t,
  };
}
