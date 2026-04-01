'use client';

import { useEffect, useState } from 'react';
import { getAgentSession } from '@/lib/agent-session';
import { useTrackPresence } from '@/lib/presence';
import { SummonProvider } from '@/components/features/SummonProvider';

export default function AgentPresenceWrapper({ children, locale }: { children: React.ReactNode; locale: string }) {
  const [session, setSession] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const refresh = () => setSession(getAgentSession());
    refresh();
    window.addEventListener('agent-session-changed', refresh);
    return () => window.removeEventListener('agent-session-changed', refresh);
  }, []);

  useTrackPresence(session?.id, session?.name);

  return (
    <SummonProvider agentId={session?.id} locale={locale}>
      {children}
    </SummonProvider>
  );
}
