'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ref, onValue, set, update, onDisconnect } from 'firebase/database';
import { rtdb } from './firebase';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

export interface LiveSessionState {
  active: boolean;
  trainerId: string;
  trainerName: string;
  moduleId: string;
  slide: number;
  lang: 'en' | 'th';
  laserPos: Point | null;
  drawings: DrawingPath[];
  updatedAt: number;
}

export function useLivePresentation(moduleId: string, userId?: string, userName?: string, isTrainer: boolean = false) {
  const [session, setSession] = useState<LiveSessionState | null>(null);
  const sessionRef = useMemo(() => ref(rtdb, `live_sessions/${moduleId}`), [moduleId]);

  // 1. Listen for updates
  useEffect(() => {
    const unsubscribe = onValue(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setSession(snapshot.val());
      } else {
        setSession(null);
      }
    });
    return () => unsubscribe();
  }, [sessionRef]);

  // 2. Trainer-only: Initialize/Cleanup session
  useEffect(() => {
    if (!isTrainer || !userId) return;

    // When trainer leaves, we could optionally deactivate the session
    // For now, we'll keep it simple: just handle disconnects
    const statusRef = ref(rtdb, `live_sessions/${moduleId}/active`);
    onDisconnect(statusRef).set(false);
  }, [isTrainer, userId, moduleId]);

  // 3. Command Actions (Trainer Only)
  const startLive = useCallback(async (initialSlide: number, initialLang: 'en' | 'th') => {
    if (!isTrainer || !userId) return;
    const newState: LiveSessionState = {
      active: true,
      trainerId: userId,
      trainerName: userName || 'Trainer',
      moduleId,
      slide: initialSlide,
      lang: initialLang,
      laserPos: null,
      drawings: [],
      updatedAt: Date.now(),
    };
    await set(sessionRef, newState);
  }, [isTrainer, userId, userName, moduleId, sessionRef]);

  const stopLive = useCallback(async () => {
    if (!isTrainer) return;
    await update(sessionRef, { active: false, laserPos: null });
  }, [isTrainer, sessionRef]);

  const syncSlide = useCallback(async (slide: number, lang: 'en' | 'th') => {
    if (!isTrainer || !session?.active) return;
    await update(sessionRef, { slide, lang, updatedAt: Date.now() });
  }, [isTrainer, session?.active, sessionRef]);

  const updateLaser = useCallback((pos: Point | null) => {
    if (!isTrainer || !session?.active) return;
    // We use set for laser to avoid merging, it's a high-frequency update
    set(ref(rtdb, `live_sessions/${moduleId}/laserPos`), pos);
  }, [isTrainer, session?.active, moduleId]);

  const addDrawingPath = useCallback(async (path: DrawingPath) => {
    if (!isTrainer || !session?.active) return;
    const currentDrawings = session.drawings || [];
    await update(sessionRef, { 
      drawings: [...currentDrawings, path],
      updatedAt: Date.now() 
    });
  }, [isTrainer, session?.active, session?.drawings, sessionRef]);

  const clearDrawings = useCallback(async () => {
    if (!isTrainer || !session?.active) return;
    await update(sessionRef, { drawings: [], updatedAt: Date.now() });
  }, [isTrainer, session?.active, sessionRef]);

  return {
    session,
    startLive,
    stopLive,
    syncSlide,
    updateLaser,
    addDrawingPath,
    clearDrawings,
    isLive: !!session?.active,
    isControlledByOthers: !!session?.active && session.trainerId !== userId
  };
}
