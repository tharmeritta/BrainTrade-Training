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
  
  const tab = (searchParams.get('tab') as Tab) || getDefaultTab(role);
  
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

  const visibleTabs = useMemo(() => getVisibleTabs(role, isReadOnlyRole), [role, isReadOnlyRole]);

  const mainTabs  = useMemo(() => visibleTabs.filter(t => t.group === 'main'), [visibleTabs]);
  const adminTabs = useMemo(() => visibleTabs.filter(t => t.group === 'admin'), [visibleTabs]);

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
