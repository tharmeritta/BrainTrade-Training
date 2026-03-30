'use client';

import { useState, useEffect } from 'react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { rtdb } from './firebase';

export type AgentPresenceStatus = 'focused' | 'away' | 'offline';

export interface PresenceMap {
  [agentId: string]: {
    status: AgentPresenceStatus;
    lastSeen: number;
    name?: string;
  };
}

/**
 * useAgentPresence: Returns a map of agents and their presence status.
 * (Real-time sync enabled)
 */
export function useAgentPresence(agentIds: string[]) {
  const [presence, setPresence] = useState<PresenceMap>({});

  useEffect(() => {
    if (!agentIds || agentIds.length === 0) return;

    const presenceRef = ref(rtdb, 'presence');
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() || {};
      const filtered: PresenceMap = {};
      
      agentIds.forEach(id => {
        if (data[id]) {
          // If last seen is more than 2 minutes ago, consider offline
          const isStale = Date.now() - data[id].lastSeen > 120000;
          filtered[id] = {
            ...data[id],
            status: isStale ? 'offline' : data[id].status
          };
        } else {
          filtered[id] = { status: 'offline', lastSeen: 0 };
        }
      });
      
      setPresence(filtered);
    });

    return () => unsubscribe();
  }, [agentIds]);

  return presence;
}

/**
 * useTrackPresence: Hook for agents to report their presence
 */
export function useTrackPresence(agentId?: string, agentName?: string) {
  useEffect(() => {
    if (!agentId) return;

    const userPresenceRef = ref(rtdb, `presence/${agentId}`);
    
    const updateStatus = (status: AgentPresenceStatus) => {
      set(userPresenceRef, {
        status,
        name: agentName,
        lastSeen: serverTimestamp()
      });
    };

    // Initial status
    updateStatus('focused');

    // Handle focus/blur
    const handleFocus = () => updateStatus('focused');
    const handleBlur = () => updateStatus('away');

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Handle disconnect
    onDisconnect(userPresenceRef).update({
      status: 'offline',
      lastSeen: serverTimestamp()
    });

    // Heartbeat every 30s to keep lastSeen fresh
    const interval = setInterval(() => {
      if (document.hasFocus()) updateStatus('focused');
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(interval);
      updateStatus('offline');
    };
  }, [agentId, agentName]);
}
