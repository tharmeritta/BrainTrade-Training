'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Agent, AgentEvaluation, AgentStats, SalesCallCriteria 
} from '@/types';
import { CompletionStatus, getCompletionStatus } from '@/lib/completion';
import { 
  emptyCriteria, calcScore, PERFORMANCE_KEYS, RED_FLAG_KEYS, STATUS_ORDER 
} from '@/lib/evaluator-helpers';

export function useEvaluatorDashboard(evaluatorId: string, evaluatorName: string) {
  // Data state
  const [agents, setAgents]                 = useState<Agent[]>([]);
  const [agentSearch, setAgentSearch]       = useState('');
  const [statusFilter, setStatusFilter]     = useState<CompletionStatus | ''>('');
  const [selectedAgent, setSelectedAgent]   = useState<Agent | null>(null);
  const [tab, setTab]                       = useState<'new' | 'history'>('new');
  const [agentStats, setAgentStats]         = useState<AgentStats | null>(null);
  const [loadingStats, setLoadingStats]     = useState(false);
  const [allAgentStats, setAllAgentStats]   = useState<AgentStats[]>([]);
  const [myEvals, setMyEvals]               = useState<AgentEvaluation[]>([]);
  const [agentEvals, setAgentEvals]         = useState<AgentEvaluation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [criteria, setCriteria]             = useState<SalesCallCriteria>(emptyCriteria());
  const [saving, setSaving]                 = useState(false);
  const [saveSuccess, setSaveSuccess]       = useState(false);
  const [saveError, setSaveError]           = useState(false);
  const [editingEval, setEditingEval]       = useState<AgentEvaluation | null>(null);
  const [isLive, setIsLive]                 = useState(false);

  // Load overview data
  const loadData = useCallback(async () => {
    setIsLive(true);
    try {
      const [agentsRes, evalsRes, statsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch(`/api/evaluator/evaluations?evaluatorId=${evaluatorId}`),
        fetch('/api/evaluator/all-agent-stats'),
      ]);
      if (agentsRes.ok)  { const d = await agentsRes.json();  setAgents(d.agents ?? []); }
      if (evalsRes.ok)   { const d = await evalsRes.json();   setMyEvals(d.evaluations ?? []); }
      if (statsRes.ok)   { const d = await statsRes.json();   setAllAgentStats(d.stats ?? []); }
    } catch { /* silent */ } finally {
      setIsLive(false);
    }
  }, [evaluatorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fetchAgentHistory = useCallback(async (agentId: string) => {
    setLoadingHistory(true);
    try { const d = await fetch(`/api/evaluator/evaluations?agentId=${agentId}`).then(r => r.json()); setAgentEvals(d.evaluations ?? []); }
    catch { setAgentEvals([]); } finally { setLoadingHistory(false); }
  }, []);

  const fetchAgentStats = useCallback(async (agentId: string) => {
    setLoadingStats(true);
    try { const d = await fetch(`/api/evaluator/agent-stats?agentId=${agentId}`).then(r => r.json()); setAgentStats(d.stats ?? null); }
    catch { setAgentStats(null); } finally { setLoadingStats(false); }
  }, []);

  useEffect(() => {
    if (selectedAgent && tab === 'history') fetchAgentHistory(selectedAgent.id);
  }, [selectedAgent, tab, fetchAgentHistory]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setTab('new');
    setCriteria(emptyCriteria());
    setSaveSuccess(false);
    setEditingEval(null);
    fetchAgentStats(agent.id);
    fetchAgentHistory(agent.id);
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    const totalScore = calcScore(criteria);
    try {
      let summary = criteria.generalRemark || criteria.qaThoughts;
      if (criteria.finalResult === 'failed') {
        summary = `[FAILED] ${criteria.failReason ? criteria.failReason + ' — ' : ''}${summary}`;
      } else {
        summary = `[PASSED] ${summary}`;
      }

      const body = { 
        agentId: selectedAgent.id, 
        agentName: selectedAgent.name, 
        evaluatorId, 
        evaluatorName, 
        criteria, 
        totalScore, 
        comments: summary, 
        sessionNotes: '', 
        sessionType: 'roleplay' 
      };

      if (editingEval) {
        const res = await fetch(`/api/evaluator/evaluations/${editingEval.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('PATCH failed');
      } else {
        const res  = await fetch('/api/evaluator/evaluations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('POST failed');
        const data = await res.json();
        if (data.evaluation) setMyEvals(prev => [data.evaluation, ...prev]);
      }
      setSaveSuccess(true);
      setTimeout(() => { 
        setCriteria(emptyCriteria()); 
        setSaveSuccess(false); 
        setEditingEval(null); 
        fetchAgentHistory(selectedAgent.id);
        loadData(); // Refresh all stats
      }, 1400);
    } catch {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally { setSaving(false); }
  };

  // Keyboard Handlers
  const togglePerf = useCallback((idx: number) => {
    const key = PERFORMANCE_KEYS[idx];
    if (!key) return;
    setCriteria(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        [key]: { 
          ...prev.performance[key], 
          agentInvolve: prev.performance[key].agentInvolve === true ? false : prev.performance[key].agentInvolve === false ? null : true 
        }
      }
    }));
  }, []);

  const toggleRedFlag = useCallback((idx: number) => {
    const key = RED_FLAG_KEYS[idx];
    if (!key) return;
    setCriteria(prev => ({
      ...prev,
      redFlags: { ...prev.redFlags, [key]: !prev.redFlags[key] }
    }));
  }, []);

  const toggleResult = useCallback(() => {
    setCriteria(prev => ({
      ...prev,
      finalResult: prev.finalResult === 'passed' ? 'failed' : 'passed'
    }));
  }, []);

  const handleEditEval = (ev: AgentEvaluation) => {
    setEditingEval(ev);
    setCriteria(ev.criteria);
    setTab('new');
  };

  // Sidebar agent list — filtered + sorted by priority
  const filteredAgents = agents
    .map(a => {
      const stats = allAgentStats.find(s => s.agent.id === a.id);
      const status = stats ? getCompletionStatus(stats).status : 'not-started' as CompletionStatus;
      return { agent: a, status };
    })
    .filter(({ agent, status }) => {
      const nameMatch = agent.name.toLowerCase().includes(agentSearch.toLowerCase());
      if (!nameMatch) return false;
      if (statusFilter) return status === statusFilter;
      return true;
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  const evaluatedIds = new Set(myEvals.map(e => e.agentId));

  return {
    agents, agentSearch, setAgentSearch, statusFilter, setStatusFilter,
    selectedAgent, setSelectedAgent, handleSelectAgent,
    tab, setTab,
    agentStats, loadingStats,
    allAgentStats, myEvals, agentEvals, loadingHistory,
    criteria, setCriteria,
    saving, saveSuccess, saveError,
    editingEval, handleEditEval,
    handleSave, togglePerf, toggleRedFlag, toggleResult,
    isLive, filteredAgents, evaluatedIds
  };
}
