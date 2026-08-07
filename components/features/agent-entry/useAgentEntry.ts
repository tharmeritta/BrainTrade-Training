'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getAgentSession, MOCKUP_AGENT_ID } from '@/lib/session/agent';
import { useSession } from '@/components/providers/SessionProvider';

/**
 * Normalizes a name by trimming and collapsing multiple spaces.
 */
function normalizeName(n: string) {
  return n.trim().replace(/\s+/g, ' ');
}

export function useAgentEntry(onAgentSelected: (id: string, name: string, stageName: string) => void) {
  const t = useTranslations('agentEntry');
  const { setAgent, logoutAgent } = useSession();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [returning, setReturning] = useState<{ id: string; name: string; stageName: string } | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [features, setFeatures] = useState<{ allowMockupMode: boolean }>({ allowMockupMode: true });

  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = pathname?.split('/')[1] || 'th';

  useEffect(() => {
    // Detect redirect from guarded nav
    if (searchParams.get('loginRequired') === '1') {
      setLoginPrompt(true);
      router.replace(`/${locale}/login/agent`, { scroll: false });
      setTimeout(() => inputRef.current?.focus(), 400);
    }

    // Load session
    const session = getAgentSession();
    if (session) setReturning(session);

    // Fetch public features config
    fetch('/api/config/public')
      .then(r => r.json())
      .then(d => {
        if (d.features) setFeatures(d.features);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    setTimeout(() => inputRef.current?.focus(), 500);
  }, [searchParams, locale, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = normalizeName(name);
    if (!cleanName || submitting) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/agent-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error === 'Agent not found' ? t('matchError') : (data.error || 'Login failed'));
        setSubmitting(false);
        return;
      }

      setAgent({ id: data.id, name: data.name, stageName: data.stageName });
      onAgentSelected(data.id, data.name, data.stageName);
    } catch (err) {
      setError('Connection error');
      setSubmitting(false);
    }
  };

  const handleMockupLogin = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const mockName = t('mockupName');
    setAgent({ id: MOCKUP_AGENT_ID, name: mockName, stageName: 'Demo Agent' });
    onAgentSelected(MOCKUP_AGENT_ID, mockName, 'Demo Agent');
  };

  const handleClearReturning = useCallback(() => {
    logoutAgent();
    setReturning(null);
  }, [logoutAgent]);

  const closeLoginPrompt = useCallback(() => setLoginPrompt(false), []);

  return {
    name, setName,
    loading, submitting,
    error, setError,
    returning, handleClearReturning,
    inputFocused, setInputFocused,
    loginPrompt, closeLoginPrompt,
    features,
    inputRef,
    handleSubmit,
    handleMockupLogin,
    locale
  };
}
