'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SkillGapItem {
  key: string;
  label: string;
  avgScore: number; // 0-10
  status: 'critical' | 'warning' | 'strong';
  recommendation: string;
}

const CRITERIA_MAP: Record<string, { label: string; recommendation: string }> = {
  rapport: {
    label: 'Rapport & Trust Building',
    recommendation: 'Train agents on empathy phrases, active listening, and open-ended rapport questions.'
  },
  objectionHandling: {
    label: 'Objection Handling',
    recommendation: 'Conduct roleplay drills on handling pricing, competitor comparisons, and hesitancy.'
  },
  credibility: {
    label: 'Product Knowledge & Credibility',
    recommendation: 'Review Module 02 Product Specs and regulatory compliance details.'
  },
  closing: {
    label: 'Closing & Call-to-Action',
    recommendation: 'Coach agents on direct trial closing and setting clear next-step commitments.'
  },
  naturalness: {
    label: 'Conversational Flow & Tone',
    recommendation: 'Encourage natural tone variations rather than strictly reading script templates.'
  }
};

export function AiSkillGapReport({ 
  logs = [],
  title = "AI Skill Gap Analysis" 
}: { 
  logs?: any[]; 
  title?: string 
}) {
  // Aggregate criteria scores across all AI eval logs
  const aggregated = React.useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {
      rapport: { sum: 0, count: 0 },
      objectionHandling: { sum: 0, count: 0 },
      credibility: { sum: 0, count: 0 },
      closing: { sum: 0, count: 0 },
      naturalness: { sum: 0, count: 0 }
    };

    logs.forEach(log => {
      const criteria = log.criteria || log.result?.criteria;
      if (criteria) {
        Object.keys(totals).forEach(key => {
          if (typeof criteria[key] === 'number') {
            totals[key].sum += criteria[key];
            totals[key].count += 1;
          }
        });
      }
    });

    const items: SkillGapItem[] = Object.keys(totals).map(key => {
      const data = totals[key];
      const avg = data.count > 0 ? Number((data.sum / data.count).toFixed(1)) : 7.0; // default baseline if empty
      const meta = CRITERIA_MAP[key] || { label: key, recommendation: 'Review agent roleplay scripts.' };
      
      let status: 'critical' | 'warning' | 'strong' = 'strong';
      if (avg < 5.5) status = 'critical';
      else if (avg < 7.5) status = 'warning';

      return {
        key,
        label: meta.label,
        avgScore: avg,
        status,
        recommendation: meta.recommendation
      };
    });

    // Sort weakest criteria first so trainers see urgent gaps at top
    return items.sort((a, b) => a.avgScore - b.avgScore);
  }, [logs]);

  const weakest = aggregated[0];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">{title}</h3>
            <p className="text-xs text-muted-foreground">Aggregated AI audit performance across sales agents</p>
          </div>
        </div>
        
        {weakest && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <AlertTriangle size={14} />
            <span>Priority Focus: {weakest.label} ({weakest.avgScore * 10}%)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aggregated.map((item, idx) => {
          const pct = Math.round(item.avgScore * 10);
          const badgeClass = item.status === 'critical' 
            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
            : item.status === 'warning'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

          const barClass = item.status === 'critical'
            ? 'bg-red-500'
            : item.status === 'warning'
            ? 'bg-amber-500'
            : 'bg-emerald-500';

          return (
            <motion.div 
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-2xl bg-secondary/30 border border-border/50 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground">{item.label}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeClass}`}>
                  {pct}% ({item.avgScore}/10)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full rounded-full ${barClass}`}
                />
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                💡 <span className="font-semibold text-foreground/90">Trainer Tip:</span> {item.recommendation}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
