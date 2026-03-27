'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAgentSession } from '@/lib/agent-session';
import { TRANSITION } from '@/lib/animations';
import type { PitchMessage } from '@/types';
import { IntroView } from './IntroView';
import { ScenarioPicker } from './ScenarioPicker';
import { ChatView } from './ChatView';
import type { EvalStep, CustomerProfile, CoachingData, EvalScenario } from './types';

const DEFAULT_CRITERIA = ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'];

export default function AiEvaluation() {
  // ── Step / navigation ──
  const [step, setStep] = useState<EvalStep>('intro');

  // ── Config (loaded from API) ──
  const [guideline,       setGuideline]       = useState<string | null>(null);
  const [criteriaKeys,    setCriteriaKeys]    = useState<string[]>(DEFAULT_CRITERIA);
  const [scenarios,       setScenarios]       = useState<EvalScenario[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [passedScenarios, setPassedScenarios] = useState<string[]>([]);
  const [unlockMode,      setUnlockMode]      = useState<'sequential' | 'flexible'>('sequential');

  // ── Agent identity ──
  const [agentId,            setAgentId]            = useState<string | null>(null);
  const [agentName,          setAgentName]          = useState<string | null>(null);
  // effectiveAgentId/Name track the actual ID used for the active session —
  // may differ from agentId when a staff user tests without a real agent session.
  const [effectiveAgentId,   setEffectiveAgentId]   = useState<string | null>(null);
  const [effectiveAgentName, setEffectiveAgentName] = useState<string | null>(null);

  // ── Chat session ──
  const [messages,         setMessages]         = useState<PitchMessage[]>([]);
  const [coaching,         setCoaching]         = useState<Map<number, CoachingData>>(new Map());
  const [customerProfile,  setCustomerProfile]  = useState<CustomerProfile | null>(null);
  const [input,            setInput]            = useState('');
  const [loading,          setLoading]          = useState(false);
  const [configLoading,    setConfigLoading]    = useState(false);
  const [passed,           setPassed]           = useState(false);
  const [failed,           setFailed]           = useState(false);
  const [error,            setError]            = useState<string | null>(null);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──

  // Clear the auto-dismiss timer on unmount to avoid setState on an unmounted component
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 7000);
  }, []);

  const fetchConfig = useCallback(async (id: string | null) => {
    setConfigLoading(true);
    try {
      const url = id ? `/api/ai-eval/config?agentId=${id}` : '/api/ai-eval/config';
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.guideline)       setGuideline(data.guideline);
      if (data.criteria)        setCriteriaKeys(data.criteria);
      if (data.scenarios)       setScenarios(data.scenarios);
      if (data.completedLevels) setCompletedLevels(data.completedLevels);
      if (data.passedScenarios) setPassedScenarios(data.passedScenarios);
      if (data.unlockMode)      setUnlockMode(data.unlockMode);
    } catch (err) {
      console.error('Failed to fetch AI Eval Config', err);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // ── Init: load agent session + config ──

  useEffect(() => {
    const session = getAgentSession();
    if (session) {
      setAgentId(session.id);
      setAgentName(session.name);
      fetchConfig(session.id);
    } else {
      // For staff or first-time users, still fetch scenarios
      fetchConfig(null);
    }
  }, [fetchConfig]);

  // ── Restore active session if one exists ──

  useEffect(() => {
    if (!agentId) return;
    fetch(`/api/ai-eval/active?agentId=${agentId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const s = data?.session;
        if (!s || !s.messages?.length) return;
        setMessages(s.messages);
        setCustomerProfile(s.customerProfile);
        if (s.coaching) {
          const restored = new Map<number, CoachingData>();
          Object.entries(s.coaching).forEach(([k, v]) => restored.set(parseInt(k), v as CoachingData));
          setCoaching(restored);
        }
        if (s.status === 'passed') setPassed(true);
        if (s.status === 'failed') setFailed(true);
        // Restore the effective IDs so sendMessage works on page reload.
        // s.agentName is authoritative — it was written by the server when the session started.
        setEffectiveAgentId(agentId);
        setEffectiveAgentName(s.agentName);
        setStep('chat');
      })
      .catch(err => console.error('[AiEval] Failed to restore active session:', err));
  }, [agentId]);

  // ── Auto-scroll on new messages ──

  useEffect(() => {
    if (step === 'chat') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, loading, step]);

  // ── Session handlers ──

  const startSession = useCallback(async (scenarioId: string) => {
    // If no agentId (e.g. Staff member), use a mockup ID so they can still test it
    const effectiveId = agentId || 'staff-test-user';
    const effectiveName = agentName || 'Staff Tester';
    // Persist effective identity so sendMessage and handleReset can use them
    setEffectiveAgentId(effectiveId);
    setEffectiveAgentName(effectiveName);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: effectiveId, agentName: effectiveName, isStart: true, scenarioId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Start failed');
      }
      const data = await res.json();
      setMessages(data.messages || []);
      setCustomerProfile(data.customerProfile || null);
      
      // Initialize coaching map with the first turn's data
      const newCoaching = new Map<number, CoachingData>();
      if (data.coaching && data.messages?.length > 0) {
        newCoaching.set(data.messages.length - 1, data.coaching);
      }
      setCoaching(newCoaching);
      
      setPassed(false);
      setFailed(false);
      setStep('chat');
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agentId, agentName, showError]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !effectiveAgentId || loading || passed || failed) return;
    const userMsgContent = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsgContent, timestamp: new Date().toISOString() }]);
    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: effectiveAgentId, agentName: effectiveAgentName, message: userMsgContent }),
      });
      if (!res.ok) throw new Error('Connection failure');
      const data = await res.json();
      if (data.messages)        setMessages(data.messages);
      if (data.customerProfile) setCustomerProfile(data.customerProfile);
      if (data.coaching) {
        setCoaching(prev => {
          const next = new Map(prev);
          next.set(data.messages.length - 1, data.coaching);
          return next;
        });
      }
      // Use real agentId for progress fetch (staff progress is not tracked)
      if (data.passed) { setPassed(true); fetchConfig(agentId); }
      if (data.failed) setFailed(true);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [input, effectiveAgentId, effectiveAgentName, loading, passed, failed, showError, fetchConfig, agentId]);

  const handleUseScript = useCallback((text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  }, []);

  const handleReset = useCallback((clearHistory: boolean) => {
    setStep('scenarios');
    if (clearHistory && effectiveAgentId) {
      fetch(`/api/ai-eval/active?agentId=${effectiveAgentId}`, { method: 'DELETE' });
    }
    setEffectiveAgentId(null);
    setEffectiveAgentName(null);
  }, [effectiveAgentId]);

  // ── Render ──

  return (
    <AnimatePresence mode="wait">
      {step === 'intro' && (
        <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <IntroView
            onContinue={() => setStep('scenarios')}
            guideline={guideline}
            agentName={agentName}
            loading={loading}
            criteriaKeys={criteriaKeys}
          />
        </motion.div>
      )}

      {step === 'scenarios' && (
        <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ScenarioPicker
            scenarios={scenarios}
            completedLevels={completedLevels}
            passedScenarios={passedScenarios}
            unlockMode={unlockMode}
            onSelect={startSession}
            onBack={() => setStep('intro')}
            agentName={agentName}
            error={error}
            loading={loading}
            configLoading={configLoading}
            onClearError={() => setError(null)}
          />
        </motion.div>
      )}

      {step === 'chat' && (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <ChatView
            messages={messages}
            coaching={coaching}
            customerProfile={customerProfile}
            input={input}
            setInput={setInput}
            loading={loading}
            passed={passed}
            failed={failed}
            error={error}
            onSend={sendMessage}
            onReset={handleReset}
            onClearError={() => setError(null)}
            onUseScript={handleUseScript}
            bottomRef={bottomRef}
            textareaRef={textareaRef}
            criteriaKeys={criteriaKeys}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
