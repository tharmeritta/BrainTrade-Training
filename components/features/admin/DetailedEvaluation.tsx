'use client';

import { useTranslations } from 'next-intl';
import { 
  ClipboardCheck, X, Clock, AlertCircle, AlertTriangle, 
  Flag, ShieldAlert, CheckCircle2, Zap, Circle
} from 'lucide-react';
import { scoreColor, timeAgo } from './AdminHelpers';

interface DetailedEvaluationProps {
  ev: {
    totalScore: number;
    evaluatorName: string;
    evaluatedAt: string;
    comments: string;
    criteria?: any;
  };
}

export default function DetailedEvaluation({ ev }: DetailedEvaluationProps) {
  const t = useTranslations('admin');
  const evT = useTranslations('evaluator');
  const c = ev.criteria;
  const redFlagCount = c?.redFlags ? Object.values(c.redFlags).filter(Boolean).length : 0;
  
  return (
    <div className="bg-secondary/20 p-5 md:p-7 rounded-[2rem] border border-border/50 space-y-7 shadow-sm">
      {/* Header: Score and Evaluator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-2xl border-2 ${ev.totalScore >= 70 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
            {ev.totalScore}
            <div className="text-[9px] uppercase font-bold tracking-[0.2em] mt-[-2px]">Score</div>
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="text-base font-black text-foreground">{ev.evaluatorName}</div>
              <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${c?.finalResult === 'failed' ? 'bg-red-500/15 text-red-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                {c?.finalResult === 'failed' ? evT('finalResultFailed') : evT('finalResultPassed')}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2.5 font-medium">
              <div className="flex items-center gap-1.5"><Clock size={14} className="opacity-50" /> {new Date(ev.evaluatedAt).toLocaleDateString(t('tabs.overview') === 'ภาพรวม' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="px-2 py-0.5 rounded-md bg-secondary/50">{timeAgo(ev.evaluatedAt, t)}</div>
            </div>
          </div>
        </div>
        
        {redFlagCount > 0 && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
            <Flag size={14} strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-[0.1em]">{evT('redFlagsTitle')}: {redFlagCount}</span>
            <span className="text-[10px] font-bold opacity-60">−{redFlagCount * 25} pts</span>
          </div>
        )}
      </div>

      {/* 1. Performance Items */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
          <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{evT('agentPerfHeader')}</h5>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['agentStruggle', 'unhandledQuestions', 'toneOfVoice', 'chemistryFriendliness'].map(key => {
            const p = (c?.performance as any)?.[key];
            if (!p) return null;
            const isNA = p.agentInvolve === null;
            const isY  = p.agentInvolve === true;
            const isN  = p.agentInvolve === false;

            return (
              <div key={key} className={`bg-card/40 border rounded-2xl p-4 flex gap-4 transition-all ${isY ? 'border-blue-500/30 bg-blue-500/[0.02]' : isNA ? 'border-border/20 opacity-60' : 'border-border/40'}`}>
                <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${isY ? 'bg-blue-500 text-white border-blue-400' : isNA ? 'bg-secondary/50 text-muted-foreground/20 border-border/30' : 'bg-secondary text-muted-foreground/30 border-border/50'}`}>
                  {isY ? <CheckCircle2 size={16} strokeWidth={3} /> : isNA ? <Circle size={14} className="opacity-40" /> : <X size={16} strokeWidth={3} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-tight">{evT(`performanceItems.${key}`)}</div>
                    <span className={`text-[9px] font-black uppercase ${isY ? 'text-blue-500' : isNA ? 'text-muted-foreground/30' : 'text-muted-foreground/40'}`}>
                      {isY ? evT('yLabel') : isN ? evT('nLabel') : evT('naLabel')}
                    </span>
                  </div>
                  {p.comment ? (
                    <p className="text-sm text-foreground font-medium leading-relaxed mb-2">{p.comment}</p>
                  ) : isNA && (
                    <p className="text-[11px] text-muted-foreground/40 font-bold italic mb-2 uppercase tracking-widest">{evT('notEvaluated')}</p>
                  )}
                  {p.remark && (
                    <div className="mt-2 pt-2 border-t border-border/30 text-[11px] text-muted-foreground italic">
                      {p.remark}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. QA Thoughts & Impact */}
      {(c?.qaThoughts || (c?.qaImpact && c.qaImpact !== 'none')) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
            <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{evT('qaHeader')}</h5>
          </div>
          <div className="bg-purple-500/[0.03] border border-purple-500/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldAlert size={80} />
            </div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="text-xs font-bold text-purple-600/70 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} /> {evT('qaSection')}
              </div>
              {c?.qaImpact && c.qaImpact !== 'none' && (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${c.qaImpact === 'immediate_fail' ? 'bg-red-500 text-white' : 'bg-purple-500 text-white'}`}>
                  {c.qaImpact === 'immediate_fail' ? <AlertTriangle size={12} /> : <Zap size={12} />}
                  {evT(c.qaImpact === 'notify_improve' ? 'qaImpactNotifyImprove' : 'qaImpactImmediateFail')}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap relative z-10">{c?.qaThoughts || '—'}</p>
          </div>
        </div>
      )}

      {/* 3. Red Flags */}
      {c?.redFlags && Object.values(c.redFlags).some(Boolean) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-red-500 rounded-full" />
            <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{evT('redFlagsTitle')}</h5>
          </div>
          <div className="bg-red-500/[0.03] border border-red-500/10 rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(c.redFlags).filter(k => (c.redFlags as any)[k]).map(key => (
                <div key={key} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <X size={14} className="text-red-500 shrink-0" strokeWidth={3} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-red-700 truncate">{evT(`redFlagItems.${key}.label`)}</div>
                    <div className="text-[10px] text-red-600/60 font-medium truncate">{evT(`redFlagItems.${key}.guideline`)}</div>
                  </div>
                  <span className="text-[10px] font-black text-red-500 shrink-0">−25</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Final Verdict & Remark */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
          <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{evT('finalResultHeader')}</h5>
        </div>
        
        <div className="space-y-4">
          {c?.finalResult === 'failed' && c?.failReason && (
            <div className="bg-red-500/[0.03] border border-red-500/20 rounded-3xl p-6 shadow-sm">
              <div className="text-xs font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertCircle size={16} /> {evT('reasonForFailure')}
              </div>
              <p className="text-sm text-foreground font-bold leading-relaxed">{c.failReason}</p>
            </div>
          )}

          {c?.generalRemark && (
            <div className="bg-secondary/30 border border-border/40 rounded-3xl p-6 italic shadow-inner">
              <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-3">{evT('generalRemarkLabel')}</div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">&quot;{c.generalRemark}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
