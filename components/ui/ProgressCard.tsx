'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
export interface UserProgress {
  pitchLevel?: number;
  modules?: Record<string, { completed?: boolean; score?: number }>;
}
import { CheckCircle2, Circle, TrendingUp, Trophy } from 'lucide-react';

export default function ProgressCard({ userId }: { userId: string }) {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const db = getDb();
    getDoc(doc(db, 'progress', userId)).then(snap => {
      if (snap.exists()) setProgress(snap.data() as UserProgress);
    });
  }, [userId]);

  if (!progress) return (
    <div className="text-gray-400 bg-white rounded-xl shadow p-5">
      ยังไม่มีข้อมูลความคืบหน้า
    </div>
  );

  const modules = [
    { id: 'product', label: 'ผลิตภัณฑ์' },
    { id: 'process', label: 'กระบวนการ' },
    { id: 'payment', label: 'การชำระเงิน' },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {modules.map((m, i) => {
        const data = progress.modules?.[m.id as keyof typeof progress.modules];
        const isCompleted = !!data?.completed;

        return (
          <div
            key={m.id}
            className="group relative overflow-hidden bg-card rounded-3xl p-6 border border-border transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-blue-50 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>
                {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </div>
              {isCompleted && (
                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  Completed
                </div>
              )}
            </div>
            
            <h3 className="font-bold text-lg mb-1">{m.label}</h3>
            <p className="text-sm text-muted-foreground">
              {isCompleted ? `คะแนน: ${data.score}` : 'คลิกเพื่อเริ่มเรียนรู้'}
            </p>

            <div className="mt-6 h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isCompleted ? 'w-full bg-blue-500' : 'w-0 bg-primary/20'}`}
              />
            </div>
          </div>
        );
      })}

      <div className="group relative overflow-hidden bg-primary text-primary-foreground rounded-3xl p-6 shadow-lg shadow-primary/20 border border-primary/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-2xl text-white">
            <Trophy size={24} />
          </div>
          <TrendingUp size={20} className="text-white/40" />
        </div>
        
        <h3 className="font-bold text-lg mb-1">Pitch Level</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-black">{progress.pitchLevel || 0}</span>
          <span className="text-white/60 text-sm font-medium">/ 3</span>
        </div>
        
        <p className="text-xs text-white/70 mt-4 leading-relaxed">
          ความสามารถการนำเสนอ ปัจจุบันอยู่ที่เลเวล {progress.pitchLevel || 0}
        </p>
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
