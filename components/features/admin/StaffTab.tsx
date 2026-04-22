'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Users } from 'lucide-react';
import StaffSection from './staff/StaffSection';
import AgentSection from './staff/AgentSection';
import AccessNotes from './staff/AccessNotes';

export default function StaffTab({ role }: { role: string }) {
  const t = useTranslations('admin');
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'agents'>('staff');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-secondary/30 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('staff')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'staff' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldCheck size={16} /> {t('staff.title')}
        </button>
        <button
          onClick={() => setActiveSubTab('agents')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'agents' 
              ? 'bg-background shadow-sm text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users size={16} /> {t('agents.addAgent')}
        </button>
      </div>

      {activeSubTab === 'staff' ? (
        <StaffSection role={role} />
      ) : (
        <AgentSection role={role} />
      )}

      <AccessNotes />
    </div>
  );
}
