'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAgentSession } from '@/lib/session/agent';
import { hasStaffSession } from '@/lib/session/client';

/**
 * Client-side guard that redirects unauthenticated agents back to the
 * dashboard (AgentEntry) before they can access course, quiz, or ai-eval
 * pages. Renders nothing until the session check resolves.
 */
export default function AgentAuthGuard({ 
  children,
  allowStaff = true
}: { 
  children: React.ReactNode,
  allowStaff?: boolean
}) {
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (allowStaff || hasStaffSession()) {
      return;
    }

    const session = getAgentSession();

    if (!session) {
      const locale = pathname.split('/')[1] ?? 'th';
      router.replace(`/${locale}/login/agent`);
    }
  }, [pathname, router, allowStaff]);

  return <>{children}</>;
}
