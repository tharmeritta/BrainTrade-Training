'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, set, remove, serverTimestamp } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SummonMessage {
  trainerId: string;
  trainerName: string;
  moduleId: string;
  moduleTitle: string;
  timestamp: number;
}

interface SummonContextType {
  summon: (agentIds: string[], moduleId: string, moduleTitle: string, trainerId: string, trainerName: string) => Promise<void>;
}

const SummonContext = createContext<SummonContextType | undefined>(undefined);

export const SummonProvider: React.FC<{ children: React.ReactNode; agentId?: string; locale: string }> = ({ children, agentId, locale }) => {
  const [activeSummon, setActiveSummon] = useState<SummonMessage | null>(null);
  const router = useRouter();

  // 1. Listen for summons (Agent Side)
  useEffect(() => {
    if (!agentId) return;

    const summonRef = ref(rtdb, `summons/${agentId}`);
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
  }, [agentId]);

  // 2. Send summon (Trainer Side)
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

  const handleJoin = () => {
    if (activeSummon) {
      router.push(`/${locale}/learn/${activeSummon.moduleId}`);
      remove(ref(rtdb, `summons/${agentId}`));
      setActiveSummon(null);
    }
  };

  return (
    <SummonContext.Provider value={{ summon }}>
      {children}
      
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
              onClick={handleJoin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-black text-white transition-all active:scale-95 hover:bg-primary/90"
            >
              JOIN SESSION <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SummonContext.Provider>
  );
};

export const useSummon = () => {
  const context = useContext(SummonContext);
  if (!context) throw new Error('useSummon must be used within a SummonProvider');
  return context;
};
