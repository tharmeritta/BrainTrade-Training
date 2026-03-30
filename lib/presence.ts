'use client';

import { useState, useEffect } from 'react';

export type AgentPresenceStatus = 'focused' | 'away' | 'offline';

export interface PresenceMap {
  [agentId: string]: AgentPresenceStatus;
}

/**
 * useAgentPresence: Returns a map of agents and their presence status.
 * (Real-time sync disabled)
 */
export function useAgentPresence(agentIds: string[]) {
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => {
    if (!agentIds || agentIds.length === 0) return;

    // Default all to offline
    const initial: PresenceMap = {};
    agentIds.forEach(id => initial[id] = 'offline');
    setPresence(initial);
  }, [agentIds]);

  return presence;
}
