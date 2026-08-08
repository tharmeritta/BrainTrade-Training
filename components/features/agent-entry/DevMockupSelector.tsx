'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Sparkles, ChevronDown, CheckCircle2, AlertTriangle, ShieldCheck, Flame, Zap } from 'lucide-react';

export interface DevMockAgent {
  id: string;
  name: string;
  stageName: string;
  status: string;
  progress: number;
}

const DEV_MOCK_AGENTS: DevMockAgent[] = [
  { id: 'mock-agent-alex-rivers', name: 'Alex Rivers', stageName: 'Alex R.', status: 'Fresh Starter (0%)', progress: 0 },
  { id: 'mock-agent-sarah-jenkins', name: 'Sarah Jenkins', stageName: 'Sarah J.', status: 'Quiz Specialist (35%)', progress: 35 },
  { id: 'mock-agent-michael-chang', name: 'Michael Chang', stageName: 'Mike C.', status: 'AI Challenger (65%)', progress: 65 },
  { id: 'mock-agent-emily-davis', name: 'Emily Davis', stageName: 'Emily D.', status: 'Pending Human QA (88%)', progress: 88 },
  { id: 'mock-agent-david-miller', name: 'David Miller', stageName: 'David M.', status: 'Certified Graduate (100%)', progress: 100 },
  { id: 'mock-agent-jordan-vance', name: 'Jordan Vance', stageName: 'Jordan V.', status: 'Needs Remediation (42%)', progress: 42 }
];

export function DevMockupSelector({
  onSelectAgent
}: {
  onSelectAgent: (agent: DevMockAgent) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 pt-6 border-t border-border/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/50 border border-primary/20 text-xs font-bold text-foreground hover:bg-secondary transition-all group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles size={14} />
          </div>
          <span className="text-primary font-black uppercase tracking-wider text-[10px]">
            ⚡ Developer Mockup Tester (6 Profiles)
          </span>
        </div>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 space-y-2"
          >
            <p className="text-[10px] text-muted-foreground font-medium px-1">
              Select any mock profile below to test agent portal states instantly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEV_MOCK_AGENTS.map(agent => {
                let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if (agent.progress === 0) badgeClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                else if (agent.progress < 50) badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                else if (agent.progress < 100) badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      onSelectAgent(agent);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:scale-[1.02] text-left transition-all group"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {agent.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{agent.stageName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${badgeClass}`}>
                      {agent.progress}%
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
