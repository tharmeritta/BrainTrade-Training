'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileSpreadsheet, Download, Users, ChevronDown, Zap } from 'lucide-react';
import type { AgentStats } from '@/types';

export default function ReportsTab() {
  const t = useTranslations('admin');
  const [agents,      setAgents]      = useState<{ id: string; name: string }[]>([]);
  const [selected,    setSelected]    = useState('');
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingOne, setExportingOne] = useState(false);
  const [exportErr,   setExportErr]   = useState('');

  useEffect(() => {
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(d => setAgents((d.agents ?? []).map((a: AgentStats) => ({ id: a.agent.id, name: a.agent.name }))))
      .catch(() => {});
  }, []);

  async function download(url: string, filename: string, setLoading: (v: boolean) => void) {
    setLoading(true);
    setExportErr('');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { setExportErr(t('reports.exportFailed')); }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-blue-600" /> {t('reports.overallTitle')}
            </h3>
            <div className="text-sm text-muted-foreground mt-1">
              <p>{t('reports.overallDesc')}</p>
              <p>{t('reports.overallColors')}</p>
            </div>
          </div>
          <button
            onClick={() => download('/api/admin/export', `BrainTrade_All_${new Date().toISOString().slice(0,10)}.xlsx`, setExportingAll)}
            disabled={exportingAll}
            className="flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 whitespace-nowrap"
          >
            <Download size={16} /> {exportingAll ? t('reports.exporting') : t('reports.exportAll')}
          </button>
        </div>

        <div className="border-t border-border" />

        <div>
          <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
            <Users size={20} className="text-blue-600" /> {t('reports.individualTitle')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('reports.individualDesc')}
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <select
                value={selected}
                onChange={e => setSelected(e.target.value)}
                className="w-full appearance-none bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
              >
                <option value="">{t('reports.selectAgent')}</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={() => {
                if (!selected) return;
                const name = agents.find(a => a.id === selected)?.name ?? selected;
                download(`/api/admin/export?agentId=${selected}`, `BrainTrade_${name}.xlsx`, setExportingOne);
              }}
              disabled={!selected || exportingOne}
              className="flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50"
            >
              <Download size={16} /> {exportingOne ? t('reports.exporting') : t('reports.export')}
            </button>
          </div>
        </div>
      </div>

      {exportErr && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{exportErr}</p>
      )}

      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5 text-sm text-amber-400">
        <p className="font-semibold mb-1 flex items-center gap-2"><Zap size={16} /> {t('reports.notesTitle')}</p>
        <ul className="space-y-1 text-amber-400/80 list-disc list-inside">
          <li>{t('reports.notesColors')}</li>
          <li>{t('reports.notesFormula')}</li>
        </ul>
      </div>
    </div>
  );
}
