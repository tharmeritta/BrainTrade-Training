'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  Users, Search, Upload, UserPlus, Plus, Check, X, Pencil, Trash2
} from 'lucide-react';
import type { Agent } from '@/types';
import BulkImportModal from '../BulkImportModal';

export default function AgentSection({ role }: { role: string }) {
  const t = useTranslations('admin');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentSearch, setAgentSearch] = useState('');
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [agentErr, setAgentErr] = useState('');
  const [saving, setSaving] = useState(false);

  const isIT = role === 'it';

  const confirmITAction = useCallback(() => {
    if (!isIT) return true;
    return confirm("Confirm to send this request for administrator approval?");
  }, [isIT]);

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) { 
        const d = await res.json(); 
        setAgents((d.agents ?? []).map((a: any) => a.agent));
      }
    } catch { /* empty */ }
    setLoadingAgents(false);
  }, []);

  useEffect(() => { 
    loadAgents();
  }, [loadAgents]);

  async function addAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    if (!confirmITAction()) return;
    setSaving(true);
    setAgentErr('');
    const res = await fetch('/api/admin/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAgentName.trim() }),
    });
    if (res.ok) {
      setNewAgentName(''); setShowAgentForm(false);
      await loadAgents();
    } else {
      const d = await res.json();
      setAgentErr(d.error ?? 'Failed to add agent');
    }
    setSaving(false);
  }

  async function saveAgentEdit() {
    if (!editingAgent) return;
    if (!confirmITAction()) return;
    setSaving(true);
    setAgentErr('');
    const res = await fetch(`/api/admin/agents/${editingAgent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingAgent.name, stageName: editingAgent.stageName }),
    });
    if (res.ok) { setEditingAgent(null); await loadAgents(); }
    else { const d = await res.json(); setAgentErr(d.error ?? 'Failed to save'); }
    setSaving(false);
  }

  async function toggleAgentActive(id: string, active: boolean) {
    if (!confirmITAction()) return;
    await fetch(`/api/admin/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    await loadAgents();
  }

  async function deleteAgent(id: string, name: string) {
    if (!confirm(t('agents.deleteConfirm', { name }))) return;
    if (!confirmITAction()) return;
    setAgentErr('');
    const res = await fetch(`/api/admin/agents/${id}`, { method: 'DELETE' });
    if (!res.ok) setAgentErr('Failed to delete agent.');
    else await loadAgents();
  }

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(agentSearch.toLowerCase()) || 
    (a.stageName ?? '').toLowerCase().includes(agentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users size={20} className="text-primary" /> {t('agents.addAgent')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage training agents and bulk imports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowBulk(true)} className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors border border-border"><Upload size={16} /> {t('agents.bulkImport')}</button>
          <button onClick={() => setShowAgentForm(f => !f)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"><UserPlus size={16} /> {t('agents.addAgent')}</button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder={t('agents.searchPlaceholder')} className="pl-9 pr-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full" />
        </div>
      </div>

      <AnimatePresence>
        {showAgentForm && (
          <motion.form onSubmit={addAgent} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-3 items-center overflow-hidden">
            <input value={newAgentName} onChange={e => setNewAgentName(e.target.value)} placeholder={t('agents.addPlaceholder')} className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none text-foreground" required />
            <button type="submit" disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">{saving ? t('agents.adding') : t('agents.create')}</button>
            <button type="button" onClick={() => setShowAgentForm(false)} className="text-muted-foreground hover:text-foreground px-3 py-2.5 text-sm">{t('agents.cancel')}</button>
          </motion.form>
        )}
      </AnimatePresence>

      {agentErr && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{agentErr}</p>}

      <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {loadingAgents ? (
          <div className="text-center py-16 flex flex-col items-center gap-3"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /><span className="text-sm text-muted-foreground animate-pulse">{t('agents.loading')}</span></div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">{t('agents.noAgents')}</div>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-y-2 px-2">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-[10px]">{t('agents.table.agent')}</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t('agents.stageName')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t('agents.table.status')}</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map(a => (
                <tr key={a.id} className="bg-card/60 backdrop-blur-md hover:bg-card hover:shadow-md transition-all group">
                  {editingAgent?.id === a.id ? (
                    <>
                      <td className="px-5 py-3 rounded-l-2xl border-y border-l border-border/50 group-hover:border-primary/20"><input value={editingAgent.name} onChange={e => setEditingAgent(prev => prev ? { ...prev, name: e.target.value } : null)} className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none" /></td>
                      <td className="px-4 py-3 border-y border-border/50 group-hover:border-y-primary/20"><input value={editingAgent.stageName} onChange={e => setEditingAgent(prev => prev ? { ...prev, stageName: e.target.value } : null)} className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none" /></td>
                      <td className="px-4 py-3 text-center border-y border-border/50 group-hover:border-y-primary/20"><span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${a.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{a.active ? t('agents.active') : t('agents.inactive')}</span></td>
                      <td className="px-4 py-3 text-right rounded-r-2xl border-y border-r border-border/50 group-hover:border-primary/20"><div className="flex items-center justify-end gap-1.5"><button onClick={saveAgentEdit} disabled={saving} className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50"><Check size={14} /></button><button onClick={() => setEditingAgent(null)} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"><X size={14} /></button></div></td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4 rounded-l-2xl border-y border-l border-border/50 group-hover:border-primary/20 font-semibold text-foreground flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black uppercase text-xs">{a.name.charAt(0)}</div> {a.name}</td>
                      <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20 italic text-muted-foreground">{a.stageName || '–'}</td>
                      <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20"><button onClick={() => toggleAgentActive(a.id, a.active)} className={`px-2.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors ${a.active ? 'bg-emerald-500/15 text-emerald-400 hover:bg-red-500/15 hover:text-red-400' : 'bg-red-500/15 text-red-400 hover:bg-emerald-500/15 hover:text-emerald-400'}`}>{a.active ? t('agents.active') : t('agents.inactive')}</button></td>
                      <td className="px-4 py-4 text-right rounded-r-2xl border-y border-r border-border/50 group-hover:border-primary/20"><div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingAgent(a)} className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors"><Pencil size={14} /></button><button onClick={() => deleteAgent(a.id, a.name)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button></div></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {showBulk && <BulkImportModal onClose={() => setShowBulk(false)} onSuccess={loadAgents} />}
      </AnimatePresence>
    </div>
  );
}
