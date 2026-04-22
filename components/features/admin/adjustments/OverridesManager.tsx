'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShieldCheck, RefreshCw, Loader2, Plus, Search, User, 
  CheckCircle2, Layers, Zap, Database, Trash2, AlertCircle,
  GraduationCap, Archive
} from 'lucide-react';
import { FormField } from './SharedUI';
import { COURSE_MODULES } from '@/lib/courses';

export default function OverridesManager({ readOnly }: { readOnly?: boolean }) {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reverting, setReverting] = useState<string | null>(null);

  // Form State
  const [agentId, setAgentId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [type, setType] = useState<'quiz' | 'ai-eval' | 'bulk-pass'>('quiz');
  const [score, setScore] = useState(100);
  const [isBypassed, setIsBypassed] = useState(false);
  const [bypassReason, setBypassReason] = useState('');
  const [agentSearch, setAgentSearch] = useState('');

  // Batch Finalization State
  const [activePeriods, setActivePeriods] = useState<any[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [finalizing, setFinalizing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, agentRes, periodRes] = await Promise.all([
        fetch('/api/admin/agents/override'), 
        fetch('/api/admin/agents'),
        fetch('/api/trainer/training-periods')
      ]);
      if (ovRes.ok) setOverrides((await ovRes.json()).overrides || []);
      if (agentRes.ok) setAgents((await agentRes.json()).agents || []);
      if (periodRes.ok) {
        const pData = await periodRes.json();
        setActivePeriods(pData.periods?.filter((p: any) => p.active) || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const [isSearching, setIsSearching] = useState(false);

  const filteredAgents = useMemo(() => {
    const search = agentSearch.toLowerCase().trim();
    const exactMatch = agents.find(a => a.agent.name === agentSearch && a.agent.id === agentId);
    
    return agents.filter(a => {
      if (!search || (exactMatch && isSearching)) return true;
      return (a.agent.name?.toLowerCase()?.includes(search)) || 
             (a.agent.id?.toLowerCase()?.includes(search));
    }).slice(0, 50);
  }, [agents, agentSearch, agentId, isSearching]);

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type !== 'bulk-pass' && (!agentId || !moduleId || !bypassReason)) return alert('Fill all fields');
    if (type === 'bulk-pass' && (!agentId || !bypassReason)) return alert('Select agent and provide reason');
    
    const agent = agents.find(a => a.agent.id === agentId);
    if (!agent) return;

    const confirmMsg = type === 'bulk-pass' 
      ? `CRITICAL: Are you sure you want to BULK PASS ${agent.agent.name}? This will mark ALL quizzes and AI Eval levels as passed.`
      : `Apply override for ${agent.agent.name}?`;

    if (!window.confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/agents/override', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, agentName: agent.agent.name, moduleId, type, score, isBypassed, bypassReason })
      });
      if (res.ok) {
        setAgentId(''); setModuleId(''); setBypassReason(''); setAgentSearch('');
        const logRes = await fetch('/api/admin/agents/override');
        if (logRes.ok) setOverrides((await logRes.json()).overrides || []);
      } else alert('Failed to apply');
    } finally { setSubmitting(false); }
  };

  const handleRevert = async (ov: any) => {
    if (!window.confirm(`Revert override for ${ov.agentName}?`)) return;
    setReverting(ov.id);
    try {
      const res = await fetch(`/api/admin/agents/override?id=${ov.id}&agentId=${ov.agentId}&type=${ov.type}&moduleId=${ov.moduleId}`, { method: 'DELETE' });
      if (res.ok) setOverrides(prev => prev.filter(o => o.id !== ov.id));
    } finally { setReverting(null); }
  };

  const handleFinalizeBatch = async () => {
    if (!selectedPeriodId) return;
    const period = activePeriods.find(p => p.id === selectedPeriodId);
    if (!period) return;

    if (!window.confirm(`CRITICAL ACTION: Are you sure you want to finalize and ARCHIVE "${period.name}"?\n\nThis will:\n1. Move all ${period.agentIds.length} agents to History.\n2. Clear the Live Dashboard.\n3. Mark agents as graduated.\n\nThis cannot be easily undone.`)) return;

    setFinalizing(true);
    try {
      const res = await fetch('/api/admin/training/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId: selectedPeriodId })
      });
      if (res.ok) {
        alert('Batch archived successfully. Live dashboard is now fresh.');
        loadData();
        setSelectedPeriodId('');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('System error during finalization');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <div className="p-12 flex flex-col items-center justify-center gap-3"><Loader2 className="animate-spin text-primary" /><p className="text-xs font-bold opacity-50">Loading Hub...</p></div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-black flex items-center gap-2 text-primary"><ShieldCheck size={24} /> Override Console</h3><p className="text-[10px] font-black opacity-50 uppercase mt-1">Manual Pass & Technical Bypass</p></div>
        <button onClick={loadData} className="p-2 rounded-xl bg-secondary/50 hover:bg-secondary"><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      {!readOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-primary/[0.03] border border-primary/10 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-foreground/70"><Plus size={14} /> New Override</h4>
            <form onSubmit={handleApplyOverride} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative">
                <FormField id="ov-agent" label="Select Agent" icon={User}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 opacity-50" />
                    <input 
                      id="ov-agent" 
                      value={agentSearch} 
                      onFocus={() => setIsSearching(true)}
                      onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                      onChange={e => { 
                        setAgentSearch(e.target.value); 
                        if(agentId) setAgentId(''); 
                      }} 
                      placeholder="Search or select agent..." 
                      className="w-full bg-background border pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 ring-primary/20" 
                    />
                  </div>
                </FormField>
                {isSearching && (
                  <div className="absolute z-20 mt-1 w-full bg-card border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[250px]">
                    <div className="overflow-y-auto custom-scrollbar">
                      {filteredAgents.length > 0 ? (
                        filteredAgents.map(a => (
                          <button 
                            key={a.agent.id} 
                            type="button" 
                            onClick={() => { 
                              setAgentId(a.agent.id); 
                              setAgentSearch(a.agent.name); 
                              setIsSearching(false);
                            }} 
                            className={`w-full text-left px-4 py-2 hover:bg-primary/10 text-xs font-bold border-b last:border-0 flex flex-col ${agentId === a.agent.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                          >
                            <span>{a.agent.name}</span>
                            <span className="text-[9px] opacity-40 block font-medium">{a.agent.id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-[10px] font-bold opacity-40 uppercase">No agents found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <FormField id="ov-type" label="Override Type" icon={Layers}>
                  <div className="flex p-1 bg-background border rounded-xl">
                    {['quiz', 'ai-eval', 'bulk-pass'].map(t => (
                      <button 
                        key={t} 
                        type="button" 
                        onClick={() => { 
                          setType(t as any); 
                          setModuleId(''); 
                          if (t === 'bulk-pass') {
                            setScore(100);
                            setIsBypassed(true);
                          }
                        }} 
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase ${type === t ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}
                      >
                        {t === 'quiz' ? 'Quiz' : t === 'ai-eval' ? 'AI Eval' : 'Bulk Pass'}
                      </button>
                    ))}
                  </div>
                </FormField>
                {type !== 'bulk-pass' ? (
                  <FormField id="ov-target" label={`Select ${type === 'quiz' ? 'Module' : 'Level'}`}>
                    <select id="ov-target" value={moduleId} onChange={e => setModuleId(e.target.value)} className="w-full bg-background border p-2.5 rounded-xl text-sm outline-none">
                      <option value="">-- Choose Target --</option>
                      {type === 'quiz' ? Object.values(COURSE_MODULES).map(m => (<option key={m.id} value={m.id}>{m.title}</option>)) : [1, 2, 3, 4].map(lv => (<option key={lv} value={lv.toString()}>Level {lv}</option>))}
                    </select>
                  </FormField>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-2">
                      <Zap size={14} /> Full Training Bypass
                    </p>
                    <p className="text-[9px] text-amber-700/70 mt-1 font-bold">
                      This will automatically pass all required quizzes and AI Evaluation levels (1-4) for this agent.
                    </p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField id="ov-reason" label="Reason"><textarea id="ov-reason" value={bypassReason} onChange={e => setBypassReason(e.target.value)} className="w-full bg-background border p-2.5 rounded-xl text-xs h-20 outline-none resize-none" placeholder="..." /></FormField>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><input type="checkbox" id="ov-bypass" checked={isBypassed} onChange={e => setIsBypassed(e.target.checked)} disabled={type === 'bulk-pass'} /><label htmlFor="ov-bypass" className="text-[10px] font-black uppercase text-amber-600">Bypass</label></div>
                    <div className="flex-1 flex items-center gap-2">
                      <label htmlFor="ov-score" className="text-[9px] font-black opacity-40 uppercase">Score</label>
                      <input id="ov-score" type="number" min="0" max="100" value={score} onChange={e => setScore(parseInt(e.target.value))} disabled={type === 'bulk-pass'} className="w-16 bg-background border p-1.5 rounded-lg text-xs font-bold text-center" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting || !agentId || (type !== 'bulk-pass' && !moduleId)} className="w-full bg-primary text-white py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} {type === 'bulk-pass' ? 'Apply Bulk Pass' : 'Apply Now'}</button>
                </div>
              </div>
            </form>
          </div>

          <div className="bg-amber-500/[0.03] border border-amber-500/20 rounded-2xl p-6 shadow-sm flex flex-col">
            <h4 className="text-xs font-black uppercase mb-4 flex items-center gap-2 text-amber-600"><GraduationCap size={16} /> Archive & Finalize Batch</h4>
            <div className="flex-1 space-y-4">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Use this to close an active training wave. All agents in the batch will be marked as graduated and moved to the <b>Training History</b> tab.
              </p>
              
              <FormField id="finalize-batch" label="Select Active Batch" icon={Archive}>
                <select 
                  id="finalize-batch" 
                  value={selectedPeriodId} 
                  onChange={e => setSelectedPeriodId(e.target.value)}
                  className="w-full bg-background border p-2.5 rounded-xl text-sm outline-none focus:ring-2 ring-amber-500/20"
                >
                  <option value="">-- Select Active Batch --</option>
                  {activePeriods.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.agentIds.length} agents)</option>
                  ))}
                </select>
              </FormField>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex gap-2">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-amber-800 uppercase leading-tight">
                    This will clear the live dashboard and move data to historical reports.
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleFinalizeBatch}
              disabled={finalizing || !selectedPeriodId}
              className="mt-6 w-full bg-amber-600 text-white py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-amber-700 transition-colors"
            >
              {finalizing ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />} Archive & Finalize
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase flex items-center gap-2"><Database size={16} className="opacity-50" /> Audit Log</h4>
        <div className="border rounded-2xl overflow-hidden bg-card overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="bg-secondary/40 text-[10px] font-black uppercase text-muted-foreground border-b"><tr className="divide-x divide-border"><th className="px-4 py-4">Agent</th><th className="px-4 py-4">Target</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Reason</th><th className="px-4 py-4">Auth</th><th className="px-4 py-4">Time</th>{!readOnly && <th className="px-4 py-4">Action</th>}</tr></thead>
            <tbody className="divide-y divide-border">
              {overrides.map((ov) => (
                <tr key={ov.id} className="hover:bg-primary/[0.02] transition-colors divide-x divide-border">
                  <td className="px-4 py-4"><div className="font-bold text-xs">{ov.agentName}</div><div className="text-[9px] opacity-40">{ov.agentId}</div></td>
                  <td className="px-4 py-4"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase">{ov.moduleId}</span></td>
                  <td className="px-4 py-4"><div className={`text-[10px] font-black uppercase flex items-center gap-1.5 ${ov.isBypassed ? 'text-amber-500' : 'text-emerald-500'}`}>{ov.isBypassed ? <><Zap size={12} /> Bypass</> : <><CheckCircle2 size={12} /> Pass</>}</div></td>
                  <td className="px-4 py-4"><div className="text-[11px] italic max-w-[200px] truncate" title={ov.bypassReason}>{ov.bypassReason}</div></td>
                  <td className="px-4 py-4 font-bold text-[11px]">{ov.adminName}</td>
                  <td className="px-4 py-4 text-[10px] opacity-60">{new Date(ov.timestamp).toLocaleString()}</td>
                  {!readOnly && <td className="px-4 py-4 text-center"><button onClick={() => handleRevert(ov)} disabled={reverting === ov.id} className="text-red-500 p-2">{reverting === ov.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
