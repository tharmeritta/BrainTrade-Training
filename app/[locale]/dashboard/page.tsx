'use client';

/**
 * Dashboard page — orchestrates the agent entry → training hub flow.
 *
 * State machine:
 *  No localStorage agent → AgentEntry (full-page username selection)
 *  Agent selected        → AgentTrainingHub (module progress, locking)
 *
 * On mount: checks localStorage for existing agent selection.
 * Fetches /api/agent/progress?agentId={id} for stats.
 *   → This endpoint needs to be created; it should return { stats: AgentStats }.
 *     It can reuse the existing lib/agents.ts computeAgentStats() logic.
 *
 * The NavBar is intentionally hidden on the entry screen so it doesn't
 * clutter the full-page onboarding experience.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentEntry from '@/components/features/AgentEntry';
import AgentTrainingHub from '@/components/features/AgentTrainingHub';
import type { AgentStats } from '@/types';

const AGENT_ID_KEY         = 'brainstrade_agent_id';
const AGENT_NAME_KEY       = 'brainstrade_agent_name';
const AGENT_STAGE_NAME_KEY = 'brainstrade_agent_stage_name';

export default function DashboardPage() {
  const [mounted, setMounted]         = useState(false);
  const [agentId, setAgentId]         = useState<string | null>(null);
  const [agentName, setAgentName]     = useState<string | null>(null);
  const [agentStageName, setAgentStageName] = useState<string>('');
  const [stats, setStats]             = useState<AgentStats | null>(null);

  // Hydration guard — read localStorage only after mount
  useEffect(() => {
    setMounted(true);
    const id        = localStorage.getItem(AGENT_ID_KEY);
    const name      = localStorage.getItem(AGENT_NAME_KEY);
    const stageName = localStorage.getItem(AGENT_STAGE_NAME_KEY) ?? '';
    if (id && name) {
      setAgentId(id);
      setAgentName(name);
      setAgentStageName(stageName);
    }
  }, []);

  // Fetch agent progress whenever agentId changes
  useEffect(() => {
    if (!agentId) return;
    fetch(`/api/agent/progress?agentId=${agentId}&agentName=${encodeURIComponent(agentName ?? '')}`)
      .then(r => r.json())
      .then(d => setStats(d.stats ?? null))
      .catch(() => setStats(null));
  }, [agentId]);

  function handleAgentSelected(id: string, name: string, stageName: string) {
    setAgentId(id);
    setAgentName(name);
    setAgentStageName(stageName);
  }

  function handleLogout() {
    localStorage.removeItem(AGENT_ID_KEY);
    localStorage.removeItem(AGENT_NAME_KEY);
    localStorage.removeItem(AGENT_STAGE_NAME_KEY);
    setAgentId(null);
    setAgentName(null);
    setAgentStageName('');
    setStats(null);
  }

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {!agentId || !agentName ? (
        <motion.div
          key="entry"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35 }}
        >
          <AgentEntry onAgentSelected={handleAgentSelected} />
        </motion.div>
      ) : (
        <motion.div
          key="hub"
          className="h-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <AgentTrainingHub
            agentId={agentId}
            agentName={agentName}
            agentStageName={agentStageName}
            stats={stats}
            onLogout={handleLogout}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
