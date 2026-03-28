'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from './firebase';

export type AgentPresenceStatus = 'focused' | 'away' | 'offline';

export interface PresenceMap {
  [agentId: string]: AgentPresenceStatus;
}

/**
 * useAgentPresence: Listens to all presentation_sync modules to find active agents.
 * Since an agent could be in any module, we might need a more centralized presence if scale is high.
 * For now, we'll track common modules.
 */
export function useAgentPresence(agentIds: string[]) {
  const [presence, setPresence] = useState<PresenceMap>({});

  const agentIdsKey = JSON.stringify(agentIds);

  useEffect(() => {
    if (!agentIds || agentIds.length === 0) return;

    // Default all to offline
    const initial: PresenceMap = {};
    agentIds.forEach(id => initial[id] = 'offline');
    setPresence(initial);

    // List of modules to check for presence
    // In a production app, we'd have a single 'presence' node instead of searching modules.
    const modules = ['foundation', 'product', 'process', 'payment'];
    
    const unsubs: (() => void)[] = [];

    modules.forEach(modId => {
      const participantsRef = ref(rtdb, `presentation_sync/${modId}/participants`);
      
      const unsubscribe = onValue(participantsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        setPresence(prev => {
          const next = { ...prev };
          Object.keys(data).forEach(uid => {
            if (agentIds.includes(uid)) {
              const p = data[uid];
              // If agent is focused in ANY module, they are 'focused'
              // If away in all, they are 'away'
              if (p.isFocused) {
                next[uid] = 'focused';
              } else if (next[uid] !== 'focused') {
                next[uid] = 'away';
              }
            }
          });
          return next;
        });
      });

      unsubs.push(() => off(participantsRef, 'value', unsubscribe));
    });

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [agentIdsKey, setPresence, agentIds]);

  return presence;
}
