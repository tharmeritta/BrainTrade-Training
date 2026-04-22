'use client';

import { useState } from 'react';
import { Settings, Eye } from 'lucide-react';
import { EditorHeader } from './SharedUI';

interface FeaturesConfig {
  allowMockupMode: boolean;
  [key: string]: any;
}

export default function SystemEditor({ data, onSave, onChange, saving }: { data: FeaturesConfig | undefined, onSave: (d: FeaturesConfig) => void, onChange: () => void, saving: boolean, readOnly?: boolean }) {
  const [config, setConfig] = useState<FeaturesConfig>(data || { allowMockupMode: true });

  const handleToggle = (key: keyof FeaturesConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    onChange();
  };

  return (
    <div className="p-6 space-y-8">
      <EditorHeader 
        title="Global Features" 
        icon={Settings} 
        onSave={() => onSave(config)} 
        saving={saving} 
        saveLabel="Save System Settings"
      >
        <p className="hidden md:block text-[10px] font-black text-muted-foreground uppercase tracking-wider">Enable or disable core platform functionalities.</p>
      </EditorHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-secondary/5 flex items-center justify-between group hover:border-primary/30 transition-all">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${config.allowMockupMode ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-secondary text-muted-foreground border border-border'}`}>
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm font-bold">Mockup Agent Mode</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight max-w-[200px] leading-tight mt-0.5">Allows guests to try the agent dashboard via "Demo" button</p>
            </div>
          </div>
          <button 
            onClick={() => handleToggle('allowMockupMode')}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 outline-none ${config.allowMockupMode ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${config.allowMockupMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
