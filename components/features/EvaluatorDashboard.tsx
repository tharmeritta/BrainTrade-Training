'use client';

/**
 * EvaluatorDashboard — Two-panel evaluation interface.
 *
 * Left sidebar  : Agent list with search
 * Main panel    : "New Evaluation" tab (criteria sliders + comments)
 *                 "History" tab      (past evaluations, inline edit)
 *
 * API endpoints required:
 *  GET  /api/agents                              → { agents: [{ id, name }] }
 *  GET  /api/evaluator/evaluations?agentId={id}  → { evaluations: AgentEvaluation[] }
 *  POST /api/evaluator/evaluations               → { evaluation: AgentEvaluation }
 *  PATCH /api/evaluator/evaluations/[id]         → { evaluation: AgentEvaluation }
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, ClipboardCheck, ChevronRight, Save, Check,
  Clock, Edit3, X, ChevronDown, Loader2, Star, BarChart3,
  Mic, PlayCircle, MessageSquare, Activity,
} from 'lucide-react';
import type { Agent, AgentEvaluation, EvaluationCriteria, EvaluationSessionType } from '@/types';

// ── Criteria config ────────────────────────────────────────────────────────

const CRITERIA: { key: keyof EvaluationCriteria; labelTh: string; icon: string }[] = [
  { key: 'productKnowledge',   labelTh: 'ความรู้ผลิตภัณฑ์',   icon: '📚' },
  { key: 'communication',      labelTh: 'ทักษะการสื่อสาร',     icon: '💬' },
  { key: 'objectionHandling',  labelTh: 'การจัดการข้อโต้แย้ง', icon: '🛡️' },
  { key: 'closingTechnique',   labelTh: 'เทคนิคการปิดการขาย',  icon: '🎯' },
  { key: 'professionalism',    labelTh: 'ความเป็นมืออาชีพ',    icon: '⭐' },
  { key: 'customerEmpathy',    labelTh: 'ความเข้าใจลูกค้า',    icon: '❤️' },
];

const SESSION_TYPES: { value: EvaluationSessionType; labelTh: string; icon: React.ElementType }[] = [
  { value: 'pitch',    labelTh: 'ฝึกพิช',      icon: PlayCircle       },
  { value: 'ai-eval',  labelTh: 'AI ประเมิน',  icon: Mic              },
  { value: 'live',     labelTh: 'สด',           icon: Activity         },
  { value: 'roleplay', labelTh: 'บทบาทสมมติ',  icon: MessageSquare    },
];

const EMPTY_CRITERIA: EvaluationCriteria = {
  productKnowledge: 5,
  communication:    5,
  objectionHandling:5,
  closingTechnique: 5,
  professionalism:  5,
  customerEmpathy:  5,
};

function calcTotal(c: EvaluationCriteria): number {
  const vals = Object.values(c) as number[];
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10);
}

function scoreColor(n: number) {
  return n >= 70 ? '#34D399' : n >= 50 ? '#FBBF24' : '#F87171';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 2)  return 'เมื่อกี้';
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  const d = Math.floor(h / 24);
  return `${d} วันที่แล้ว`;
}

// ── Score slider component ─────────────────────────────────────────────────

function CriteriaSlider({
  label,
  icon,
  value,
  onChange,
  disabled,
}: {
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const pct = (value / 10) * 100;
  const clr = scoreColor(value * 10);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
        <span
          className="text-sm font-black min-w-[2ch] text-right"
          style={{ fontFamily: "'Syne', sans-serif", color: clr }}
        >
          {value}
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${clr}80, ${clr})` }}
        />
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ zIndex: 10 }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-800">
        <span>0</span>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <span key={n} className={value === n ? 'text-slate-600' : ''}>{n}</span>
        ))}
        <span>10</span>
      </div>
    </div>
  );
}

// ── Total score ring ───────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const clr  = scoreColor(score);

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <motion.circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={clr}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <span
        className="text-lg font-black"
        style={{ fontFamily: "'Syne', sans-serif", color: clr }}
      >
        {score}
      </span>
    </div>
  );
}

// ── History evaluation card ────────────────────────────────────────────────

function EvalCard({
  eval: ev,
  onEdit,
}: {
  eval: AgentEvaluation;
  onEdit: (ev: AgentEvaluation) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sessionLabel = SESSION_TYPES.find(s => s.value === ev.sessionType)?.labelTh ?? ev.sessionType;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8,18,34,0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <ScoreRing score={ev.totalScore} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-sm font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {sessionLabel}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {ev.evaluatorName}
            </span>
          </div>
          <p className="text-xs text-slate-600 truncate">{ev.comments || 'ไม่มีความคิดเห็น'}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Clock size={10} style={{ color: '#475569' }} />
            <span className="text-[10px] text-slate-700">{timeAgo(ev.evaluatedAt)}</span>
          </div>
        </div>
        <ChevronDown
          size={14}
          className="text-slate-600 shrink-0 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 space-y-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="pt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                {CRITERIA.map(c => (
                  <div key={c.key} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-600">{c.icon} {c.labelTh}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: scoreColor(ev.criteria[c.key] * 10) }}
                    >
                      {ev.criteria[c.key]}/10
                    </span>
                  </div>
                ))}
              </div>
              {ev.sessionNotes && (
                <div
                  className="rounded-xl p-3 text-xs text-slate-500"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {ev.sessionNotes}
                </div>
              )}
              <button
                onClick={() => onEdit(ev)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Edit3 size={11} /> แก้ไข
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface EvaluatorDashboardProps {
  evaluatorId: string;
  evaluatorName: string;
}

export default function EvaluatorDashboard({ evaluatorId, evaluatorName }: EvaluatorDashboardProps) {
  // Agent list
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Tab
  const [tab, setTab] = useState<'new' | 'history'>('new');

  // New evaluation form
  const [sessionType, setSessionType] = useState<EvaluationSessionType>('pitch');
  const [criteria, setCriteria]       = useState<EvaluationCriteria>(EMPTY_CRITERIA);
  const [comments, setComments]       = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // History
  const [evaluations, setEvaluations] = useState<AgentEvaluation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editingEval, setEditingEval] = useState<AgentEvaluation | null>(null);

  // Fetch agents
  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {});
  }, []);

  // Fetch history when agent selected + tab = history
  const fetchHistory = useCallback(async (agentId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/evaluator/evaluations?agentId=${agentId}`);
      const data = await res.json();
      setEvaluations(data.evaluations ?? []);
    } catch {
      setEvaluations([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAgent && tab === 'history') {
      fetchHistory(selectedAgent.id);
    }
  }, [selectedAgent, tab, fetchHistory]);

  function handleSelectAgent(agent: Agent) {
    setSelectedAgent(agent);
    setCriteria(EMPTY_CRITERIA);
    setComments('');
    setSessionNotes('');
    setSaveSuccess(false);
    setEditingEval(null);
    setTab('new');
  }

  function handleEditEval(ev: AgentEvaluation) {
    setEditingEval(ev);
    setCriteria(ev.criteria);
    setComments(ev.comments);
    setSessionNotes(ev.sessionNotes);
    setSessionType(ev.sessionType);
    setTab('new');
  }

  function resetForm() {
    setCriteria(EMPTY_CRITERIA);
    setComments('');
    setSessionNotes('');
    setSaveSuccess(false);
    setEditingEval(null);
  }

  async function handleSave() {
    if (!selectedAgent) return;
    setSaving(true);
    try {
      const body = {
        agentId:       selectedAgent.id,
        agentName:     selectedAgent.name,
        evaluatorId,
        evaluatorName,
        criteria,
        totalScore:    calcTotal(criteria),
        comments,
        sessionNotes,
        sessionType,
      };

      if (editingEval) {
        await fetch(`/api/evaluator/evaluations/${editingEval.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/evaluator/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        resetForm();
        if (tab === 'history') fetchHistory(selectedAgent.id);
      }, 1400);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  }

  const totalScore   = calcTotal(criteria);
  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(agentSearch.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#050B14', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Page header ── */}
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <ClipboardCheck size={18} style={{ color: '#34D399' }} />
        <span
          className="font-black text-lg text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Evaluator Panel
        </span>
        <span
          className="text-xs px-2.5 py-0.5 rounded-full ml-1"
          style={{
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.25)',
            color: '#34D399',
          }}
        >
          {evaluatorName}
        </span>
      </div>

      {/* ── Two-panel layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ═══════════════════════
            LEFT: Agent sidebar
        ═══════════════════════ */}
        <div
          className="w-64 xl:w-72 shrink-0 flex flex-col"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="p-4">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />
              <input
                type="text"
                value={agentSearch}
                onChange={e => setAgentSearch(e.target.value)}
                placeholder="ค้นหาเอเจนต์..."
                className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs text-white outline-none transition-colors placeholder:text-slate-700"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-800">
                <Users size={20} />
                <span className="text-[11px]">ไม่พบเอเจนต์</span>
              </div>
            ) : (
              filteredAgents.map((agent, i) => {
                const isSelected = selectedAgent?.id === agent.id;
                const initials = agent.name.slice(0, 2).toUpperCase();
                return (
                  <motion.button
                    key={agent.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectAgent(agent)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(52,211,153,0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(52,211,153,0.25)' : 'transparent'}`,
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        background: isSelected ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#34D399' : '#475569',
                      }}
                    >
                      {initials}
                    </div>
                    <span
                      className="text-xs font-medium truncate"
                      style={{ color: isSelected ? '#A7F3D0' : '#94A3B8' }}
                    >
                      {agent.name}
                    </span>
                    {isSelected && <ChevronRight size={12} style={{ color: '#34D399' }} className="ml-auto shrink-0" />}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ═══════════════════════
            RIGHT: Evaluation area
        ═══════════════════════ */}
        <div className="flex-1 overflow-y-auto">
          {!selectedAgent ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-700">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <BarChart3 size={28} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">เลือกเอเจนต์จากรายการด้านซ้าย</p>
                <p className="text-xs text-slate-800 mt-1">เพื่อเริ่มการประเมิน</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-6 py-7">

              {/* Agent header */}
              <motion.div
                key={selectedAgent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-6"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black shrink-0"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    background: 'rgba(52,211,153,0.12)',
                    border: '1px solid rgba(52,211,153,0.25)',
                    color: '#34D399',
                  }}
                >
                  {selectedAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2
                    className="text-xl font-black text-white"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {selectedAgent.name}
                  </h2>
                  <p className="text-xs text-slate-600">กำลังประเมิน</p>
                </div>
              </motion.div>

              {/* Tabs */}
              <div
                className="flex gap-1 p-1 rounded-xl mb-7"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {(['new', 'history'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: tab === t ? '#E2E8F0' : '#475569',
                      border: tab === t ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    }}
                  >
                    {t === 'new' ? '+ การประเมินใหม่' : '📋 ประวัติ'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'new' ? (
                  /* ── NEW EVALUATION ── */
                  <motion.div
                    key="new"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-6"
                  >
                    {/* Edit mode banner */}
                    {editingEval && (
                      <div
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs"
                        style={{
                          background: 'rgba(251,191,36,0.08)',
                          border: '1px solid rgba(251,191,36,0.2)',
                          color: '#FBB024',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Edit3 size={12} />
                          กำลังแก้ไขการประเมินที่ผ่านมา
                        </div>
                        <button onClick={resetForm}>
                          <X size={13} className="opacity-60 hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    )}

                    {/* Session type */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2.5 uppercase tracking-wider">
                        ประเภทเซสชัน
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {SESSION_TYPES.map(st => {
                          const Icon = st.icon;
                          const isActive = sessionType === st.value;
                          return (
                            <button
                              key={st.value}
                              onClick={() => setSessionType(st.value)}
                              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                              style={{
                                background: isActive ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isActive ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.07)'}`,
                              }}
                            >
                              <Icon size={16} style={{ color: isActive ? '#34D399' : '#475569' }} />
                              <span
                                className="text-[10px] font-medium"
                                style={{ color: isActive ? '#A7F3D0' : '#475569' }}
                              >
                                {st.labelTh}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Criteria sliders */}
                    <div
                      className="rounded-2xl p-5 space-y-5"
                      style={{
                        background: 'rgba(8,18,34,0.85)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-bold text-white"
                          style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                          เกณฑ์การประเมิน
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">คะแนนรวม</span>
                          <span
                            className="text-base font-black"
                            style={{
                              fontFamily: "'Syne', sans-serif",
                              color: scoreColor(totalScore),
                            }}
                          >
                            {totalScore}/100
                          </span>
                        </div>
                      </div>

                      {CRITERIA.map(c => (
                        <CriteriaSlider
                          key={c.key}
                          icon={c.icon}
                          label={c.labelTh}
                          value={criteria[c.key]}
                          onChange={v => setCriteria(prev => ({ ...prev, [c.key]: v }))}
                        />
                      ))}

                      {/* Score ring summary */}
                      <div
                        className="flex items-center gap-5 pt-2"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <ScoreRing score={totalScore} />
                        <div>
                          <div
                            className="text-sm font-bold text-white mb-0.5"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {totalScore >= 70
                              ? 'ผลการประเมิน: ดีมาก'
                              : totalScore >= 50
                              ? 'ผลการประเมิน: ปานกลาง'
                              : 'ผลการประเมิน: ต้องพัฒนา'}
                          </div>
                          <p className="text-xs text-slate-600">
                            ค่าเฉลี่ยจากทั้ง {CRITERIA.length} เกณฑ์
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                        ความคิดเห็น
                      </label>
                      <textarea
                        value={comments}
                        onChange={e => setComments(e.target.value)}
                        placeholder="บันทึกความคิดเห็นเกี่ยวกับการแสดงออกของเอเจนต์..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none transition-colors placeholder:text-slate-700"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      />
                    </div>

                    {/* Session notes */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                        บันทึกเซสชัน (ส่วนตัว)
                      </label>
                      <textarea
                        value={sessionNotes}
                        onChange={e => setSessionNotes(e.target.value)}
                        placeholder="บันทึกส่วนตัว ไม่แสดงต่อเอเจนต์..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none transition-colors placeholder:text-slate-700"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      />
                    </div>

                    {/* Save button */}
                    <motion.button
                      onClick={handleSave}
                      disabled={saving || saveSuccess}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        background: saveSuccess
                          ? 'rgba(52,211,153,0.15)'
                          : 'linear-gradient(135deg, #34D399, #059669)',
                        color: saveSuccess ? '#34D399' : '#fff',
                        border: saveSuccess ? '1px solid rgba(52,211,153,0.4)' : 'none',
                        boxShadow: saveSuccess ? 'none' : '0 8px 24px rgba(52,211,153,0.2)',
                      }}
                      whileHover={!saving && !saveSuccess ? { scale: 1.01 } : {}}
                      whileTap={!saving && !saveSuccess ? { scale: 0.99 } : {}}
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : saveSuccess ? (
                        <><Check size={16} /> บันทึกแล้ว</>
                      ) : (
                        <><Save size={15} /> {editingEval ? 'อัปเดตการประเมิน' : 'บันทึกการประเมิน'}</>
                      )}
                    </motion.button>
                  </motion.div>

                ) : (
                  /* ── HISTORY ── */
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 size={22} className="animate-spin" style={{ color: 'rgba(52,211,153,0.5)' }} />
                      </div>
                    ) : evaluations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-700">
                        <ClipboardCheck size={32} className="opacity-30" />
                        <p className="text-sm">ยังไม่มีการประเมิน</p>
                        <button
                          onClick={() => setTab('new')}
                          className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
                        >
                          เริ่มการประเมินแรก
                        </button>
                      </div>
                    ) : (
                      evaluations.map(ev => (
                        <EvalCard key={ev.id} eval={ev} onEdit={handleEditEval} />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
