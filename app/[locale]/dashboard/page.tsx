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
import { saveProgress, getProgress } from '@/lib/localCache';
import { getAgentSession, clearAgentSession } from '@/lib/agent-session';

export default function DashboardPage() {
  const [mounted, setMounted]         = useState(false);
  const [agentId, setAgentId]         = useState<string | null>(null);
  const [agentName, setAgentName]     = useState<string | null>(null);
  const [agentStageName, setAgentStageName] = useState<string>('');
  const [stats, setStats]             = useState<AgentStats | null>(null);

  // Hydration guard — read session only after mount
  useEffect(() => {
    setMounted(true);
    const session = getAgentSession();
    if (session) {
      setAgentId(session.id);
      setAgentName(session.name);
      setAgentStageName(session.stageName);
    }
  }, []);

  // Fetch agent progress whenever agentId changes.
  // Falls back to localStorage cache if the server is unreachable.
  useEffect(() => {
    if (!agentId) return;
    
    const fetchStats = () => {
      const simulate = localStorage.getItem('brainstrade_simulate_completion') === 'true';
      fetch(`/api/agent/progress?agentId=${agentId}&agentName=${encodeURIComponent(agentName ?? '')}&simulate=${simulate}`)
        .then(r => r.json())
        .then(d => {
          const serverStats = d.stats ?? null;
          setStats(serverStats);
          // Mirror progress to localStorage so the browser has a copy
          if (serverStats && agentId) {
            saveProgress(agentId, {
              agentId,
              agentName: agentName ?? '',
              evalCompletedLevels: serverStats.evalCompletedLevels ?? [],
              learnedModules: serverStats.learnedModules ?? [],
              updatedAt: new Date().toISOString(),
            });
          }
        })
        .catch(() => {
          // Server unreachable — load from localStorage backup
          const cached = agentId ? getProgress(agentId) : null;
          if (cached) {
            setStats({
              agent: { id: agentId, name: agentName ?? '', active: true, createdAt: new Date() },
              quiz: {},
              aiEval: null,
              lastActive: cached.updatedAt ?? null,
              evalCompletedLevels: cached.evalCompletedLevels ?? [],
              learnedModules: cached.learnedModules ?? [],
              overallScore: 0,
              badge: 'needs-work',
            } as AgentStats);
          } else {
            setStats(null);
          }
        });
    };

    fetchStats();

    // Listen for custom event to refresh when mockup simulation toggles
    const handleRefresh = () => fetchStats();
    window.addEventListener('agent-stats-refresh', handleRefresh);
    return () => window.removeEventListener('agent-stats-refresh', handleRefresh);
  }, [agentId, agentName]);

  function handleAgentSelected(id: string, name: string, stageName: string) {
    setAgentId(id);
    setAgentName(name);
    setAgentStageName(stageName);
  }
  function handleLogout() {
    clearAgentSession();
    setAgentId(null);
    setAgentName(null);
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
