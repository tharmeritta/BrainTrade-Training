'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getAuthClient, getDb } from '@/lib/firebase';
export interface AppUser {
  uid: string;
  role: 'admin' | 'manager' | 'agent' | 'evaluator';
  name?: string;
  email?: string;
}

type Mode = 'admin' | 'agent';

interface UserContextValue {
  user: AppUser | null;
  loading: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  mode: 'agent',
  setMode: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setModeState] = useState<Mode>('agent');

  useEffect(() => {
    const auth = getAuthClient();
    const db = getDb();
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data() as AppUser;
          setUser(data);
          // Restore saved mode or default based on role
          const saved = localStorage.getItem(`mode_${firebaseUser.uid}`) as Mode | null;
          setModeState(saved ?? (data.role === 'admin' ? 'admin' : 'agent'));
        }
      } else {
        setUser(null);
        setModeState('agent');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  function setMode(m: Mode) {
    setModeState(m);
    if (user) localStorage.setItem(`mode_${user.uid}`, m);
  }

  return (
    <UserContext.Provider value={{ user, loading, mode, setMode }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
