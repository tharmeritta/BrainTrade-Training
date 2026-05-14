'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ref, onValue, set, remove } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, ArrowRight } from 'lucide-react';
import { 
  getAgentSession, 
  setAgentSession as saveAgentSession, 
  clearAgentSession as removeAgentSession,
  AgentSession 
} from '@/lib/session/agent';
import { useTrackPresence } from '@/lib/presence';

// --- Types ---

interface SummonMessage {
  trainerId: string;
  trainerName: string;
  moduleId: string;
  moduleTitle: string;
  timestamp: number;
}

interface SessionContextType {
  // Agent Session
  agent: AgentSession | null;
  setAgent: (session: AgentSession) => void;
  logoutAgent: () => void;
  isLoading: boolean;
  
  // Summoning
  summon: (agentIds: string[], moduleId: string, moduleTitle: string, trainerId: string, trainerName: string) => Promise<void>;
}

// --- Context ---

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// --- Provider ---

export const SessionProvider: React.FC<{ children: React.ReactNode; locale: string }> = ({ children, locale }) => {
  const [agent, setAgentState] = useState<AgentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSummon, setActiveSummon] = useState<SummonMessage | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 1. Initialize Session
  useEffect(() => {
    const session = getAgentSession();
    setAgentState(session);
    setIsLoading(false);

    // Sync state if localStorage changes in another tab or via clearAgentSession
    const handleStorageChange = () => {
      setAgentState(getAgentSession());
    };
    window.addEventListener('agent-session-changed', handleStorageChange);
    return () => window.removeEventListener('agent-session-changed', handleStorageChange);
  }, []);

  // 2. Presence Tracking
  useTrackPresence(agent?.id, agent?.name);

  // 3. Summon Listening
  useEffect(() => {
    if (!agent?.id) {
      setActiveSummon(null);
      return;
    }

    const summonRef = ref(rtdb, `summons/${agent.id}`);
    const unsubscribe = onValue(summonRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as SummonMessage;
        // Only show summons from the last 5 minutes
        if (Date.now() - data.timestamp < 300000) {
          setActiveSummon(data);
        }
      } else {
        setActiveSummon(null);
      }
    });

    return () => unsubscribe();
  }, [agent?.id]);

  // 4. Session Actions
  const setAgent = useCallback((session: AgentSession) => {
    saveAgentSession(session);
    setAgentState(session);
  }, []);

  const logoutAgent = useCallback(() => {
    removeAgentSession();
    setAgentState(null);
    router.push(`/${locale}/login/agent`);
  }, [locale, router]);

  // 5. Summon Actions
  const summon = async (agentIds: string[], moduleId: string, moduleTitle: string, trainerId: string, trainerName: string) => {
    const payload: SummonMessage = {
      trainerId,
      trainerName,
      moduleId,
      moduleTitle,
      timestamp: Date.now()
    };

    const promises = agentIds.map(id => set(ref(rtdb, `summons/${id}`), payload));
    await Promise.all(promises);
    
    // Auto-clear summons after 1 minute
    setTimeout(() => {
      agentIds.forEach(id => remove(ref(rtdb, `summons/${id}`)));
    }, 60000);
  };

  const handleJoinSummon = () => {
    if (activeSummon && agent?.id) {
      router.push(`/${locale}/learn/${activeSummon.moduleId}`);
      remove(ref(rtdb, `summons/${agent.id}`));
      setActiveSummon(null);
    }
  };

  const value = {
    agent,
    setAgent,
    logoutAgent,
    isLoading,
    summon
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
      
      {/* Universal Summon UI */}
      <AnimatePresence>
        {activeSummon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 left-6 z-[9999] w-80 overflow-hidden rounded-3xl border border-white/10 bg-black/80 p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-2 py-1 text-[10px] font-black uppercase text-red-400">
                <Radio size={12} className="animate-pulse" />
                <span>Live Invitation</span>
              </div>
              <button onClick={() => setActiveSummon(null)} className="opacity-40 hover:opacity-100">
                <X size={16} />
              </button>
            </div>

            <h4 className="mb-1 text-sm font-black leading-tight">
              {activeSummon.trainerName} is presenting:
            </h4>
            <p className="mb-6 text-lg font-black text-primary leading-tight">
              {activeSummon.moduleTitle}
            </p>

            <button
              onClick={handleJoinSummon}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-black text-white transition-all active:scale-95 hover:bg-primary/90"
            >
              JOIN SESSION <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SessionContext.Provider>
  );
};

// --- Hooks ---

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};

/** Compatibility hook for legacy code expecting useSummon */
export const useSummon = () => {
  const { summon } = useSession();
  return { summon };
};
