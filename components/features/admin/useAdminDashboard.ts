'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Tab, TabItem, UserRole, Workspace, 
  getVisibleWorkspaces, resolveWorkspaceAndSubTab, 
  getDefaultTab, getVisibleTabs 
} from './dashboard-policy';

export type { Tab, TabItem, Workspace };

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

  const rawTab = (searchParams.get('tab') as string) || getDefaultTab(effectiveRole);
  const rawSub = searchParams.get('sub');

  // Resolve into 4 Workspaces + SubTabs
  const { workspace: activeWorkspace, subTab: activeSubTab } = useMemo(() => 
    resolveWorkspaceAndSubTab(rawTab, rawSub)
  , [rawTab, rawSub]);
  
  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'essentials' | 'power'>('essentials');

  // Persistence for sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) setSidebarCollapsed(saved === 'true');
    const savedMode = localStorage.getItem('admin_view_mode') as 'essentials' | 'power' | null;
    if (savedMode) setViewMode(savedMode);
  }, []);

  const toggleSidebar = (v: boolean) => {
    setSidebarCollapsed(v);
    localStorage.setItem('admin_sidebar_collapsed', v.toString());
  };

  const handleSetViewMode = (mode: 'essentials' | 'power') => {
    setViewMode(mode);
    localStorage.setItem('admin_view_mode', mode);
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

  // Workspaces list filtered by user role
  const visibleWorkspaces = useMemo(() => 
    getVisibleWorkspaces(effectiveRole, isReadOnlyRole)
  , [effectiveRole, isReadOnlyRole]);

  const visibleTabs = useMemo(() => {
    return role === 'admin' && activeRoleView === 'admin'
      ? getVisibleTabs('admin', false)
      : getVisibleTabs(effectiveRole, isReadOnlyRole);
  }, [role, activeRoleView, effectiveRole, isReadOnlyRole]);

  const monitoringTabs = useMemo(() => visibleTabs.filter(t => t.group === 'monitoring'), [visibleTabs]);
  const academyTabs    = useMemo(() => visibleTabs.filter(t => t.group === 'academy'), [visibleTabs]);
  const analyticsTabs  = useMemo(() => visibleTabs.filter(t => t.group === 'analytics'), [visibleTabs]);
  const governanceTabs = useMemo(() => visibleTabs.filter(t => t.group === 'governance'), [visibleTabs]);

  const setWorkspace = (ws: Workspace, sub?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', ws);
    if (sub) {
      params.set('sub', sub);
    } else {
      params.delete('sub');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const setTab = (newTab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    params.delete('sub');
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
      tab: activeWorkspace as Tab,
      rawTab,
      activeWorkspace,
      activeSubTab,
      isPwModalOpen,
      sidebarCollapsed,
      profileOpen,
      requestingAccess,
      mounted,
      isReadOnlyRole,
      isInteractive,
      activeRoleView,
      viewMode,
    },
    actions: {
      setTab,
      setWorkspace,
      setViewMode: handleSetViewMode,
      setIsPwModalOpen,
      setSidebarCollapsed: toggleSidebar,
      setProfileOpen,
      requestInteractiveAccess,
      logout,
      setActiveRoleView,
    },
    navigation: {
      visibleWorkspaces,
      activeWorkspace,
      activeSubTab,
      monitoringTabs,
      academyTabs,
      analyticsTabs,
      governanceTabs,
      activeTab: visibleTabs.find(t => t.id === activeWorkspace) || visibleTabs[0],
      visibleTabs,
    },
    t,
  };
}
