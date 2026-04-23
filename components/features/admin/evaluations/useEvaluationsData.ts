'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TrainingPeriod } from '@/types';

export interface AdminEval {
  id: string;
  agentId: string;
  agentName: string;
  evaluatorId: string;
  evaluatorName: string;
  criteria?: any;
  totalScore: number;
  comments: string;
  evaluatedAt: string;
}

export type EvalTab = 'current' | 'history';

export function useEvaluationsData() {
  const [evals,   setEvals]   = useState<AdminEval[]>([]);
  const [periods, setPeriods] = useState<TrainingPeriod[]>([]);
  const [activeTab, setActiveTab] = useState<EvalTab>('current');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingEvals, setLoadingEvals] = useState(false);
  const [filterEv, setFilterEv] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadPeriods = useCallback(async () => {
    try {
      const res = await fetch('/api/trainer/training-periods');
      if (res.ok) {
        const data = await res.json();
        const allPeriods = data.periods || [];
        setPeriods(allPeriods);
        
        // Auto-select first active period if in 'current' tab
        const activePeriod = allPeriods.find((p: TrainingPeriod) => p.active);
        if (activePeriod && activeTab === 'current') {
          setSelectedPeriodId(activePeriod.id);
        }
      }
    } catch (err) {
      console.error('Fetch periods error:', err);
    }
  }, [activeTab]);

  const loadEvals = useCallback(async (periodId: string, isHistoryView: boolean) => {
    // If we are in history view but no period is selected, don't fetch evals
    if (isHistoryView && !periodId) {
      setEvals([]);
      setLoading(false);
      return;
    }

    // If we are in current view and no active periods exist, don't fetch all evals
    if (!isHistoryView && !periodId) {
      setEvals([]);
      setLoading(false);
      return;
    }

    setLoadingEvals(true);
    try {
      const url = `/api/admin/evaluations?periodId=${periodId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEvals(data.evaluations ?? []);
      }
    } catch (err) {
      console.error('Fetch evaluations error:', err);
    } finally {
      setLoadingEvals(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  useEffect(() => {
    loadEvals(selectedPeriodId, activeTab === 'history');
  }, [selectedPeriodId, activeTab, loadEvals]);

  // When switching tabs, reset selection based on context
  useEffect(() => {
    if (activeTab === 'current') {
      const active = periods.find(p => p.active);
      setSelectedPeriodId(active?.id || '');
    } else {
      setSelectedPeriodId(''); // Reset for archive view grid
    }
    setFilterEv('');
    setSearchTerm('');
  }, [activeTab, periods]);

  // Memoized evaluator performance and global stats
  const { evaluatorSummaries, globalAvg, evMap } = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalScore: number; last: string }>();
    let totalScoreSum = 0;

    for (const e of evals) {
      totalScoreSum += e.totalScore;
      const ex = map.get(e.evaluatorId) ?? { name: e.evaluatorName, count: 0, totalScore: 0, last: '' };
      ex.count++;
      ex.totalScore += e.totalScore;
      if (!ex.last || e.evaluatedAt > ex.last) ex.last = e.evaluatedAt;
      map.set(e.evaluatorId, ex);
    }

    const summaries = Array.from(map.entries()).map(([id, v]) => ({
      id, name: v.name, count: v.count,
      avgScore: Math.round(v.totalScore / v.count),
      lastActive: v.last,
    })).sort((a, b) => b.count - a.count);

    const avg = evals.length > 0 ? Math.round(totalScoreSum / evals.length) : 0;

    return { 
      evaluatorSummaries: summaries, 
      globalAvg: avg,
      evMap: map
    };
  }, [evals]);

  const filteredEvals = useMemo(() => {
    return filterEv ? evals.filter(e => e.evaluatorId === filterEv) : evals;
  }, [evals, filterEv]);

  const activePeriods = useMemo(() => periods.filter(p => p.active), [periods]);
  
  const inactivePeriods = useMemo(() => {
    return periods.filter(p => !p.active).filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.trainerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [periods, searchTerm]);

  const selectedPeriod = useMemo(() => periods.find(p => p.id === selectedPeriodId), [periods, selectedPeriodId]);

  return {
    evals,
    evaluatorSummaries,
    globalAvg,
    evMap,
    filteredEvals,
    periods,
    activePeriods,
    inactivePeriods,
    selectedPeriod,
    activeTab,
    setActiveTab,
    selectedPeriodId,
    setSelectedPeriodId,
    loading,
    loadingEvals,
    filterEv,
    setFilterEv,
    searchTerm,
    setSearchTerm
  };
}
