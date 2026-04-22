'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Target, Zap, ClipboardCheck, Loader2, ShieldCheck } from 'lucide-react';
import type { AgentStats } from '@/types';
import { scoreColor } from '../AdminHelpers';
import DetailedEvaluation from '../DetailedEvaluation';
import BypassModal from './BypassModal';

// --- Helpers ---

const ActionBtn = ({ onClick, loading, icon: Icon, label, color, title }: any) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-${color}-500/10 text-${color}-600 hover:bg-${color}-500/20 transition-all border border-${color}-500/20 disabled:opacity-50`}
    title={title}
  >
    {loading ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
    <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
  </button>
);

const requestOverride = async (t: any, label: string, agentName: string, callback: (score: number) => Promise<void>) => {
  const scoreStr = prompt(t('agentDetail.overridePrompt', { mod: label, name: agentName }) || `Enter manual score (0-100) for "${label}" for ${agentName}:`, "100");
  if (scoreStr === null) return;
  const score = parseInt(scoreStr);
  if (isNaN(score) || score < 0 || score > 100) return alert("Invalid score (0-100).");
  if (confirm(t('agentDetail.overrideConfirm', { mod: label, score, name: agentName }) || `Confirm manual override?`)) {
    await callback(score);
  }
};

// --- History Components ---

export function DetailedQuizHistory({ stats, onOverride, readOnly }: { stats: AgentStats, onOverride: (mod: string, type: 'quiz', score?: number) => Promise<void>, readOnly?: boolean }) {
  const t = useTranslations('admin');
  const [loading, setLoading] = useState<string | null>(null);

  const handleOverride = (mod: string) => requestOverride(t, t(`modules.${mod}`), stats.agent.name, async (score) => {
    setLoading(mod);
    await onOverride(mod, 'quiz', score);
    setLoading(null);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-amber-500" />
        <h4 className="font-bold text-base">{t('agentDetail.quizHistory')}</h4>
      </div>
      {(['foundation', 'product', 'process', 'payment'] as const).map(topic => {
        const q = stats.quiz[topic];
        const history = q?.history || [];
        const isPassed = q?.passed || history.some(h => h.passed);

        return (
          <div key={topic} className="bg-secondary/20 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold capitalize text-foreground">{t(`modules.${topic}`)}</span>
                {(!isPassed && !readOnly) && (
                  <ActionBtn 
                    onClick={() => handleOverride(topic)}
                    loading={loading === topic}
                    icon={ShieldCheck}
                    label="Override"
                    color="amber"
                    title="Manual Pass Override"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${scoreColor(q?.bestScore)}`}>{t('agentDetail.best')}: {q?.bestScore ?? 0}%</span>
                <span className="text-[10px] text-muted-foreground uppercase">{t('agentDetail.attempts', { count: q?.attempts ?? 0 })}</span>
              </div>
            </div>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">{t('agentDetail.noAttempts')}</p>
              ) : history.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-card/40 px-3 py-2 rounded-xl text-[11px] border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${h.passed ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className="font-medium text-foreground">{h.score}/{h.total}</span>
                    <span className="text-muted-foreground">({Math.round(h.score/h.total*100)}%)</span>
                    {h.manualOverride && <span className="text-[8px] font-black uppercase bg-blue-500/10 text-blue-500 px-1 rounded ml-1">Manual Override</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold uppercase text-[9px] ${h.passed ? 'text-blue-500' : 'text-red-500'}`}>
                      {h.passed ? t('agentDetail.pass') : t('agentDetail.fail')}
                    </span>
                    <span className="text-muted-foreground/60">{new Date(h.timestamp).toLocaleDateString(t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DetailedAiEvalHistory({ 
  stats, 
  onOverride,
  onBypass,
  readOnly
}: { 
  stats: AgentStats, 
  onOverride: (mod: string, type: 'ai-eval', score?: number) => Promise<void>,
  onBypass: (lv: number, reason: string) => Promise<void>,
  readOnly?: boolean
}) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [loading, setLoading] = useState<number | null>(null);
  const [bypassingLevel, setBypassingLevel] = useState<number | null>(null);
  const history = stats.aiEval?.history || [];

  const handleOverride = (lv: number) => requestOverride(t, `Level ${lv}`, stats.agent.name, async (score) => {
    setLoading(lv);
    await onOverride(lv.toString(), 'ai-eval', score);
    setLoading(null);
  });

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {bypassingLevel && (
          <BypassModal 
            level={bypassingLevel}
            agentName={stats.agent.name}
            onClose={() => setBypassingLevel(null)}
            onConfirm={(reason) => onBypass(bypassingLevel, reason)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-purple-500" />
        <h4 className="font-bold text-base">{t('agentDetail.aiEvalLogs')}</h4>
      </div>

      {history.length === 0 && !stats.aiEval?.levels && (
        <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground text-xs">{t('agentDetail.noAiSessions')}</div>
      )}

      <div className="space-y-3">
        {([1, 2, 3, 4] as const).map(lv => {
          const lvData = stats.aiEval?.levels?.[lv];
          const lvHistory = history.filter(h => h.level === lv);
          const isPassed = lvData?.passed;

          return (
            <div key={lv} className={`bg-secondary/20 rounded-2xl border border-border/50 overflow-hidden group relative transition-all ${!lvData ? 'opacity-40 border-dashed' : ''}`}>
              {/* Floating Action Buttons */}
              {(!isPassed && !readOnly) && (
                <div className={`absolute right-4 flex items-center gap-2 z-10 transition-all ${!lvData ? 'top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100' : 'top-4'}`}>
                  <ActionBtn onClick={() => setBypassingLevel(lv)} icon={Zap} label="Bypass" color="emerald" title="AI Eval Bypass" />
                  <ActionBtn onClick={() => handleOverride(lv)} loading={loading === lv} icon={ShieldCheck} label="Override" color="purple" title="Manual Pass Override" />
                </div>
              )}

              <div className="flex items-center gap-4 p-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border shrink-0 ${isPassed ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{t('agentDetail.lvl')}</span>
                  <span className="text-lg font-black leading-none">{lv}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {lvData ? (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${scoreColor(lvData.avgScore)}`}>{lvData.avgScore}/100</span>
                          <span className="text-[10px] text-muted-foreground">avg · best {lvData.bestScore}/100</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{t('agentDetail.attempts', { count: lvData.attempts })}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPassed ? 'bg-purple-500/10 text-purple-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {isPassed ? t('agentDetail.passed') : t('agentDetail.inProgress')}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${lvData.avgScore}%`, background: lvData.avgScore >= 70 ? '#60A5FA' : lvData.avgScore >= 50 ? '#FBBF24' : '#F87171' }} />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">{t('agentDetail.noAttempts')}</span>
                  )}
                </div>
              </div>

              {lvHistory.length > 0 && (
                <div className="border-t border-border/30 px-4 pb-3 pt-2 space-y-1.5">
                  {lvHistory.map((h, i) => (
                    <div key={i} className="flex flex-col gap-1.5 bg-card/40 px-3 py-2 rounded-xl text-[11px] border border-border/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${h.passed ? 'bg-purple-400' : 'bg-amber-400'}`} />
                          <span className={`font-bold ${scoreColor(h.score)}`}>{h.score}/100</span>
                          {h.manualOverride && (
                            <span className={`text-[8px] font-black uppercase px-1 rounded ml-1 ${h.isBypassed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {h.isBypassed ? 'Bypassed' : 'Manual Override'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold uppercase text-[9px] ${h.passed ? 'text-purple-400' : 'text-amber-400'}`}>
                            {h.passed ? t('agentDetail.pass') : t('agentDetail.fail')}
                          </span>
                          <span className="text-muted-foreground/60">{new Date(h.timestamp).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {h.isBypassed && h.bypassReason && (
                        <div className="mt-1 pl-3 border-l border-emerald-500/30">
                           <p className="text-[9px] text-muted-foreground italic leading-tight">{h.bypassReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DetailedHumanEvaluations({ stats }: { stats: AgentStats }) {
  const t = useTranslations('admin');
  const evals = stats.humanEvaluations || [];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck size={18} className="text-blue-500" />
        <h4 className="font-bold text-base">{t('agentDetail.humanQa')}</h4>
      </div>
      <div className="space-y-6">
        {evals.length === 0 ? (
          <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border text-muted-foreground text-xs">{t('agentDetail.noHumanEvals')}</div>
        ) : evals.map((ev, i) => (
          <DetailedEvaluation key={i} ev={ev} />
        ))}
      </div>
    </div>
  );
}
