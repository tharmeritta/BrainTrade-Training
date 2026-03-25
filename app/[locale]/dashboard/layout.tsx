'use client';

import NavBar from '@/components/ui/NavBar';
import { getAgentSession } from '@/lib/agent-session';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [hasSession, setHasSession] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasSession(!!getAgentSession());

    // Listen for storage changes (e.g., from other tabs or local state updates)
    const handleStorage = () => setHasSession(!!getAgentSession());
    window.addEventListener('storage', handleStorage);
    // Custom event to force update when session is set in same tab
    window.addEventListener('agent-session-changed', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('agent-session-changed', handleStorage);
    };
  }, []);

  // Hydration guard
  if (!mounted) return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {hasSession && <NavBar />}
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
