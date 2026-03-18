'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Client-side guard that redirects unauthenticated agents back to the
 * dashboard (AgentEntry) before they can access course, quiz, ai-eval,
 * or pitch pages.  Renders nothing until the localStorage check resolves.
 */
export default function AgentAuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const agentId   = localStorage.getItem('brainstrade_agent_id');
    const agentName = localStorage.getItem('brainstrade_agent_name');

    if (!agentId || !agentName) {
      // Extract locale from path (e.g. /th/quiz → th)
      const locale = pathname.split('/')[1] ?? 'th';
      router.replace(`/${locale}/dashboard`);
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
