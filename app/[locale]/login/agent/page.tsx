'use client';

import { useRouter, useParams } from 'next/navigation';
import AgentEntry from '@/components/features/AgentEntry';

export default function AgentLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  function handleAgentSelected() {
    // Session is already set inside AgentEntry
    router.push(`/${locale}/dashboard`);
  }

  return <AgentEntry onAgentSelected={handleAgentSelected} />;
}
