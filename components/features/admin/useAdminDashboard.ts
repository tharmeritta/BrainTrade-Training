'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tab, TabItem, UserRole, getVisibleTabs, getDefaultTab } from './dashboard-policy';

export type { Tab, TabItem };

interface UseAdminDashboardProps {
  role: UserRole;
  uid: string;
  name: string;
  interactiveAccessUntil?: string;
}

export function useAdminDashboard({ role, uid, name, interactiveAccessUntil }: UseAdminDashboardProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeRoleView, setActiveRoleView] = useState<UserRole>(role);
  const effectiveRole = role === 'admin' ? activeRoleView : role;

  const tab = (searchParams.get('tab') as Tab) || getDefaultTab(effectiveRole);
  
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Persistence for sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) setSidebarCollapsed(saved === 'true');
  }, []);

  const toggleSidebar = (v: boolean) => {
    setSidebarCollapsed(v);
    localStorage.setItem('admin_sidebar_collapsed', v.toString());
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReadOnlyRole = useMemo(() => 
    effectiveRole === 'it' || effectiveRole === 'manager' || effectiveRole === 'hr'
  , [effectiveRole]);

  const isInteractive = useMemo(() => 
    !!(role === 'admin' || effectiveRole === 'admin' || effectiveRole === 'trainer' || (
      isReadOnlyRole && interactiveAccessUntil && new Date(interactiveAccessUntil) > new Date()
    ))
  , [role, effectiveRole, isReadOnlyRole, interactiveAccessUntil]);

  const visibleTabs = useMemo(() => {
    // If admin is active, show all tabs, otherwise show role-specific tabs
    return role === 'admin' && activeRoleView === 'admin'
      ? getVisibleTabs('admin', false)
      : getVisibleTabs(effectiveRole, isReadOnlyRole);
  }, [role, activeRoleView, effectiveRole, isReadOnlyRole]);

  const monitoringTabs = useMemo(() => visibleTabs.filter(t => t.group === 'monitoring'), [visibleTabs]);
  const academyTabs    = useMemo(() => visibleTabs.filter(t => t.group === 'academy'), [visibleTabs]);
  const analyticsTabs  = useMemo(() => visibleTabs.filter(t => t.group === 'analytics'), [visibleTabs]);
  const governanceTabs = useMemo(() => visibleTabs.filter(t => t.group === 'governance'), [visibleTabs]);

  const activeTab = useMemo(() => visibleTabs.find(t => t.id === tab) || visibleTabs[0], [visibleTabs, tab]);

  const setTab = (newTab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

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
      activeRoleView,
    },
    actions: {
      setTab,
      setIsPwModalOpen,
      setSidebarCollapsed: toggleSidebar,
      setProfileOpen,
      requestInteractiveAccess,
      logout,
      setActiveRoleView,
    },
    navigation: {
      monitoringTabs,
      academyTabs,
      analyticsTabs,
      governanceTabs,
      activeTab,
      visibleTabs,
    },
    t,
  };
}
