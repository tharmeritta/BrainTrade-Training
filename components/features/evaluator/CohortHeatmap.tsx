'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, Sparkles, X, CheckCircle, ShieldAlert, BookOpen } from 'lucide-react';
import { CoachingBrief } from '@/lib/services/telesales-coaching';

interface AgentSkillRow {
  agentId: string;
  agentName: string;
  rapport: number;
  objectionHandling: number;
  valuePitch: number;
  compliance: number;
  complianceAlert?: string;
}

interface CohortHeatmapProps {
  rows?: AgentSkillRow[];
}

const DEFAULT_ROWS: AgentSkillRow[] = [
  { agentId: 'a1', agentName: 'Alex Rivera', rapport: 92, objectionHandling: 85, valuePitch: 68, compliance: 98 },
  { agentId: 'a2', agentName: 'Sarah Chen', rapport: 88, objectionHandling: 45, valuePitch: 52, compliance: 40, complianceAlert: 'Guaranteed 15% stock returns during risk pushback.' },
  { agentId: 'a3', agentName: 'Marcus Vance', rapport: 65, objectionHandling: 80, valuePitch: 90, compliance: 95 },
  { agentId: 'a4', agentName: 'Elena Rostova', rapport: 85, objectionHandling: 72, valuePitch: 78, compliance: 90 },
];

export default function CohortHeatmap({ rows = DEFAULT_ROWS }: CohortHeatmapProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentSkillRow | null>(null);
  const [coachingBrief, setCoachingBrief] = useState<CoachingBrief | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-black';
  };

  const handleGenerateBrief = async (agent: AgentSkillRow) => {
    setSelectedAgent(agent);
    setLoadingBrief(true);
    try {
      const res = await fetch('/api/evaluator/coaching-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioName: 'Telesales Practice',
          score: Math.round((agent.rapport + agent.objectionHandling + agent.valuePitch + agent.compliance) / 4),
          messages: [
            { role: 'user', content: 'You should buy our stock trading package, returns are guaranteed!' },
            { role: 'assistant', content: 'Is stock trading safe? I am worried about losing money.' }
          ]
        })
      });
      const data = await res.json();
      setCoachingBrief(data.brief);
    } catch {
      /* silent */
    } finally {
      setLoadingBrief(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Cohort Skill Heatmap</h3>
            <p className="text-xs text-slate-400">Real-time skill density across telesales reps</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-white/10 px-3 py-1 rounded-full">
          {rows.length} Trainees Active
        </span>
      </div>

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <th className="py-3 px-4">Trainee Rep</th>
              <th className="py-3 px-4 text-center">Rapport</th>
              <th className="py-3 px-4 text-center">Objection Handling</th>
              <th className="py-3 px-4 text-center">Value Pitch</th>
              <th className="py-3 px-4 text-center">Compliance</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {rows.map(r => (
              <tr key={r.agentId} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-200 flex items-center gap-2">
                  {r.agentName}
                  {r.complianceAlert && (
                    <span title={r.complianceAlert} className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${getScoreBadge(r.rapport)}`}>{r.rapport}%</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${getScoreBadge(r.objectionHandling)}`}>{r.objectionHandling}%</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${getScoreBadge(r.valuePitch)}`}>{r.valuePitch}%</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold ${getScoreBadge(r.compliance)}`}>{r.compliance}%</span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleGenerateBrief(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all"
                  >
                    <Sparkles size={12} /> AI Coaching
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-Over AI Coaching Brief Drawer */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-slate-950 border-l border-white/10 p-6 overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-purple-400" size={18} />
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-100">AI Coaching Brief: {selectedAgent.agentName}</h3>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400">
                  <X size={18} />
                </button>
              </div>

              {loadingBrief ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-purple-400">
                  <Sparkles size={28} className="animate-spin" />
                  <p className="text-xs font-medium animate-pulse">Analyzing session transcript & compliance...</p>
                </div>
              ) : (
                coachingBrief && (
                  <div className="space-y-6 text-xs">
                    {/* Compliance Alert */}
                    {selectedAgent.complianceAlert && (
                      <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 space-y-1">
                        <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-rose-400">
                          <ShieldAlert size={14} /> Financial Compliance Alert
                        </div>
                        <p>{selectedAgent.complianceAlert}</p>
                      </div>
                    )}

                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle size={12} /> Top Strengths</h4>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {coachingBrief.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                        </ul>
                      </div>
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                        <h4 className="font-bold text-amber-400 flex items-center gap-1.5"><AlertTriangle size={12} /> Coaching Gaps</h4>
                        <ul className="space-y-1 text-slate-300 text-[11px]">
                          {coachingBrief.gaps.map((g, i) => <li key={i}>• {g}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Trainer 1-on-1 Script */}
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                      <h4 className="font-bold text-purple-300 flex items-center gap-1.5 uppercase text-[11px]">
                        <BookOpen size={14} /> 1-on-1 Trainer Coaching Script
                      </h4>
                      <p className="text-slate-300 italic leading-relaxed text-[11px]">
                        "{coachingBrief.trainerScript}"
                      </p>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
