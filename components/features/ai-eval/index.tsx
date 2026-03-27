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
  const [agentId,   setAgentId]   = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);

  // ── Chat session ──
  const [messages,         setMessages]         = useState<PitchMessage[]>([]);
  const [coaching,         setCoaching]         = useState<Map<number, CoachingData>>(new Map());
  const [customerProfile,  setCustomerProfile]  = useState<CustomerProfile | null>(null);
  const [input,            setInput]            = useState('');
  const [loading,          setLoading]          = useState(false);
  const [passed,           setPassed]           = useState(false);
  const [failed,           setFailed]           = useState(false);
  const [error,            setError]            = useState<string | null>(null);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──

  const showError = useCallback((msg: string) => {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 7000);
  }, []);

  const fetchConfig = useCallback(async (id: string | null) => {
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
    }
  }, []);

  // ── Init: load agent session + config ──

  useEffect(() => {
    const session = getAgentSession();
    if (session) {
      setAgentId(session.id);
      setAgentName(session.name);
      fetchConfig(session.id);
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
        setStep('chat');
      });
  }, [agentId]);

  // ── Auto-scroll on new messages ──

  useEffect(() => {
    if (step === 'chat') {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, loading, step]);

  // ── Session handlers ──

  const startSession = useCallback(async (scenarioId: string) => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName, isStart: true, scenarioId }),
      });
      if (!res.ok) throw new Error('Start failed');
      const data = await res.json();
      setMessages(data.messages || []);
      setCustomerProfile(data.customerProfile || null);
      setCoaching(new Map());
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
    if (!input.trim() || !agentId || loading || passed || failed) return;
    const userMsgContent = input;
    setInput('');
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userMsgContent, timestamp: new Date().toISOString() }]);
    try {
      const res = await fetch('/api/ai-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName, message: userMsgContent }),
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
      if (data.passed) { setPassed(true); fetchConfig(agentId); }
      if (data.failed) setFailed(true);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [input, agentId, agentName, loading, passed, failed, showError, fetchConfig]);

  const handleUseScript = useCallback((text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  }, []);

  const handleReset = useCallback((clearHistory: boolean) => {
    setStep('scenarios');
    if (clearHistory && agentId) {
      fetch(`/api/ai-eval/active?agentId=${agentId}`, { method: 'DELETE' });
    }
  }, [agentId]);

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
