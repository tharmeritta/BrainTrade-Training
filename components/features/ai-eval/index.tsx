'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Trophy, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getAgentSession } from '@/lib/agent-session';
import { TRANSITION } from '@/lib/animations';
import { IntroView } from './IntroView';
import { ScenarioPicker } from './ScenarioPicker';
import { AuditFlow } from './AuditFlow';
import { CoachingCard } from './CoachingCard';
import type { EvalStep, CoachingData, EvalScenario } from './types';

const DEFAULT_CRITERIA = ['rapport', 'objectionHandling', 'credibility', 'closing', 'naturalness'];

export default function AiEvaluation() {
  const t = useTranslations('aiEval');
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

  // ── Audit session ──
  const [selectedScenario, setSelectedScenario] = useState<EvalScenario | null>(null);
  const [auditResult,      setAuditResult]      = useState<CoachingData | null>(null);
  const [loading,          setLoading]          = useState(false);
  const [configLoading,    setConfigLoading]    = useState(false);
  const [passed,           setPassed]           = useState(false);
  const [failed,           setFailed]           = useState(false);
  const [error,            setError]            = useState<string | null>(null);

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──

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

  // ── Handlers ──

  const selectScenario = useCallback((scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      setSelectedScenario(scenario);
      setStep('audit');
    }
  }, [scenarios]);

  const handleAuditSubmit = useCallback(async (link: string) => {
    if (!selectedScenario || loading) return;
    
    const effectiveId = agentId || 'staff-test-user';
    const effectiveName = agentName || 'Staff Tester';

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: effectiveId, 
          agentName: effectiveName, 
          scenarioId: selectedScenario.id,
          link 
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Audit failed');
      }

      const data = await res.json();
      setAuditResult(data.auditResult);
      setPassed(data.passed);
      setFailed(data.failed);
      setStep('result');
      
      if (data.passed && agentId) {
        fetchConfig(agentId);
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedScenario, loading, agentId, agentName, showError, fetchConfig]);

  const handleReset = useCallback(() => {
    setStep('scenarios');
    setSelectedScenario(null);
    setAuditResult(null);
    setPassed(false);
    setFailed(false);
  }, []);

  // ── Init ──

  useEffect(() => {
    const session = getAgentSession();
    if (session) {
      setAgentId(session.id);
      setAgentName(session.name);
      fetchConfig(session.id);
    } else {
      fetchConfig(null);
    }
  }, [fetchConfig]);

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
            onSelect={selectScenario}
            onBack={() => setStep('intro')}
            agentName={agentName}
            error={error}
            loading={loading}
            configLoading={configLoading}
            onClearError={() => setError(null)}
          />
        </motion.div>
      )}

      {step === 'audit' && selectedScenario && (
        <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base}>
          <AuditFlow
            scenario={selectedScenario}
            onBack={() => setStep('scenarios')}
            onSubmit={handleAuditSubmit}
            loading={loading}
            error={error}
          />
        </motion.div>
      )}

      {step === 'result' && auditResult && (
        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION.base} className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-card rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden">
            <div className="p-8 border-b border-black/5 dark:border-white/10 flex flex-col items-center text-center">
              {passed ? (
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 mb-6">
                  <Trophy size={40} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-6">
                  <XCircle size={40} />
                </div>
              )}
              <h2 className="text-3xl font-black tracking-tight mb-2">
                {passed ? 'Audit Passed!' : 'Audit Not Passed'}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto font-medium">
                {auditResult.verdictReason}
              </p>
            </div>

            <div className="p-8 bg-slate-50/50 dark:bg-black/20">
              <CoachingCard
                coaching={auditResult}
                autoExpand={true}
                criteriaKeys={criteriaKeys}
              />
            </div>

            <div className="p-6 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2.5 bg-white dark:bg-white/5 text-foreground hover:bg-secondary transition-all px-6 py-4 rounded-2xl font-bold text-sm border border-black/5 shadow-md"
              >
                <RotateCcw size={16} /> Try Another Practice
              </button>
              {passed ? (
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20"
                >
                  <ArrowRight size={16} /> Back to Scenarios
                </button>
              ) : (
                <button
                  onClick={() => setStep('audit')}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-foreground text-background px-6 py-4 rounded-2xl font-bold text-sm shadow-xl"
                >
                  <ArrowRight size={16} /> Re-submit Link
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
