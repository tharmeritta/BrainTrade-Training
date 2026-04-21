'use client';

/**
 * Dashboard page — The Training Hub for Agents.
 * Protected by AgentAuthGuard.
 * Fetches /api/agent/progress?agentId={id} for stats.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AgentTrainingHub from '@/components/features/AgentTrainingHub';
import AgentAuthGuard from '@/components/features/AgentAuthGuard';
import type { AgentStats } from '@/types';
import { saveProgress, getProgress } from '@/lib/localCache';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/components/features/SessionProvider';

export default function DashboardPage() {
  const { agent, logoutAgent } = useSession();
  const [stats, setStats] = useState<AgentStats | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const fetchStats = useCallback(() => {
    if (!agent) return;
    const ts = Date.now();
    fetch(`/api/agent/progress?agentId=${agent.id}&agentName=${encodeURIComponent(agent.name ?? '')}&t=${ts}`, {
      cache: 'no-store'
    })
      .then(r => r.json())
      .then(d => {
        const serverStats = d.stats ?? null;
        setStats(serverStats);
        // Mirror progress to localStorage so the browser has a copy
        if (serverStats && agent.id) {
          saveProgress(agent.id, {
            agentId: agent.id,
            agentName: agent.name ?? '',
            evalCompletedLevels: serverStats.evalCompletedLevels ?? [],
            learnedModules: serverStats.learnedModules ?? [],
            updatedAt: new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        // Server unreachable — load from localStorage backup
        const cached = agent.id ? getProgress(agent.id) : null;
        if (cached) {
          setStats({
            agent: { id: agent.id, name: agent.name ?? '', active: true, createdAt: new Date() },
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
  }, [agent]);

  // Fetch agent progress whenever agent changes.
  useEffect(() => {
    if (!agent) return;
    fetchStats();

    // Listen for custom event to refresh when mockup simulation toggles
    const handleRefresh = () => fetchStats();
    window.addEventListener('agent-stats-refresh', handleRefresh);
    return () => window.removeEventListener('agent-stats-refresh', handleRefresh);
  }, [agent, fetchStats]);

  return (
    <AgentAuthGuard>
      <motion.div
        key="hub"
        className="h-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {agent && (
          <AgentTrainingHub
            agentId={agent.id}
            agentName={agent.name}
            agentStageName={agent.stageName}
            stats={stats}
            onLogout={logoutAgent}
            refresh={fetchStats}
          />
        )}
      </motion.div>
    </AgentAuthGuard>
  );
}
