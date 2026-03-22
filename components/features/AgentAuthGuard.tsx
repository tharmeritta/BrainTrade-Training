'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAgentSession } from '@/lib/agent-session';

/**
 * Client-side guard that redirects unauthenticated agents back to the
 * dashboard (AgentEntry) before they can access course, quiz, or ai-eval
 * pages. Renders nothing until the session check resolves.
 */
export default function AgentAuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getAgentSession();

    if (!session) {
      // Extract locale from path (e.g. /th/quiz → th)
      const locale = pathname.split('/')[1] ?? 'th';
      router.replace(`/${locale}/dashboard`);
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) return null;

  return <>{children}</>;
}
