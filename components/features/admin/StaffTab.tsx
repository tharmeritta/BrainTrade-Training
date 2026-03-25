'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Plus, Check, X, Eye, EyeOff, Pencil, Trash2, Download } from 'lucide-react';
import type { StaffAccount } from '@/types';

interface EditState {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'evaluator' | 'trainer';
}

export default function StaffTab() {
  const t = useTranslations('admin');
  const [staff,    setStaff]    = useState<StaffAccount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<EditState | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPw,   setShowPw]   = useState<Record<string, boolean>>({});
  const [staffErr, setStaffErr] = useState('');

  // New account form state
  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'manager' as 'admin' | 'manager' | 'evaluator' | 'trainer' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) { const d = await res.json(); setStaff(d.staff ?? []); }
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function exportStaff() {
    setDownloading(true);
    try {
      const res = await fetch('/api/admin/export-staff');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Staff_Accounts_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export staff accounts');
      }
    } catch {
      alert('Network error during export');
    } finally {
      setDownloading(false);
    }
  }

  async function createStaff(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStaffErr('');
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setNewUser({ username: '', password: '', name: '', role: 'manager' });
        setShowForm(false);
        await load();
      } else {
        let errMsg = 'Failed to create account';
        try { const d = await res.json(); errMsg = d.error ?? errMsg; } catch {}
        setStaffErr(errMsg);
      }
    } catch {
      setStaffErr('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setStaffErr('');
    try {
      const res = await fetch(`/api/admin/staff/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editing.username,
          password: editing.password,
          name: editing.name,
          role: editing.role,
        }),
      });
      if (res.ok) {
        setEditing(null);
        await load();
      } else {
        let errMsg = 'Failed to save';
        try { const d = await res.json(); errMsg = d.error ?? errMsg; } catch {}
        setStaffErr(errMsg);
      }
    } catch {
      setStaffErr('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStaffActive(id: string, active: boolean) {
    await fetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    await load();
  }

  async function deleteStaff(id: string, name: string) {
    if (!confirm(t('staff.deleteConfirm', { name }))) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    await load();
  }

  const ROLE_COLORS: Record<string, string> = {
    admin:     'bg-red-500/15 text-red-400',
    manager:   'bg-blue-500/15 text-blue-400',
    evaluator: 'bg-violet-500/15 text-violet-400',
    trainer:   'bg-amber-500/15 text-amber-400',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck size={20} className="text-blue-600" /> {t('staff.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">{t('staff.desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportStaff}
            disabled={downloading}
            className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <Download size={16} className={downloading ? 'animate-bounce' : ''} />
            {downloading ? t('reports.exporting') : t('reports.export')}
          </button>
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> {t('staff.addAccount')}
          </button>
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={createStaff}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4"
          >
            <p className="font-semibold text-sm text-foreground">{t('staff.newAccount')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">{t('staff.displayName')}</label>
                <input value={newUser.name} onChange={e => setNewUser(v => ({ ...v, name: e.target.value }))}
                  placeholder="e.g. Sarah Manager" required
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">{t('staff.role')}</label>
                <select value={newUser.role} onChange={e => setNewUser(v => ({ ...v, role: e.target.value as 'admin' | 'manager' | 'evaluator' | 'trainer' }))}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="admin">{t('staff.roles.admin')}</option>
                  <option value="manager">{t('staff.roles.manager')}</option>
                  <option value="evaluator">{t('staff.roles.evaluator')}</option>
                  <option value="trainer">{t('staff.roles.trainer')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">{t('staff.username')}</label>
                <input value={newUser.username} onChange={e => setNewUser(v => ({ ...v, username: e.target.value }))}
                  placeholder="login username" required
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium block mb-1">{t('staff.password')}</label>
                <input value={newUser.password} onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))}
                  placeholder="password" required type="text"
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                {saving ? t('staff.creating') : t('staff.createAccount')}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground px-4 py-2.5 text-sm">{t('staff.cancel')}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {staffErr && (
        <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">{staffErr}</p>
      )}

      {/* Staff table */}
      <div className="bg-card/40 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground animate-pulse">{t('staff.loading')}</span>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('staff.noStaff')}
          </div>
        ) : (
          <table className="w-full text-sm border-separate border-spacing-y-2 px-2">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left px-5 py-3 font-bold uppercase tracking-wider text-[10px]">{t('staff.table.name')}</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t('staff.table.username')}</th>
                <th className="text-left px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t('staff.table.password')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t('staff.table.role')}</th>
                <th className="text-center px-4 py-3 font-bold uppercase tracking-wider text-[10px]">{t('staff.table.status')}</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id} className="bg-card/60 backdrop-blur-md hover:bg-card hover:shadow-md transition-all group">
                  {editing?.id === s.id ? (
                    // Edit row
                    <>
                      <td className="px-5 py-3 rounded-l-2xl border-y border-l border-border/50 group-hover:border-primary/20">
                        <input value={editing.name} onChange={e => setEditing(v => v && ({ ...v, name: e.target.value }))}
                          className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </td>
                      <td className="px-4 py-3 border-y border-border/50 group-hover:border-y-primary/20">
                        <input value={editing.username} onChange={e => setEditing(v => v && ({ ...v, username: e.target.value }))}
                          className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </td>
                      <td className="px-4 py-3 border-y border-border/50 group-hover:border-y-primary/20">
                        <input value={editing.password} onChange={e => setEditing(v => v && ({ ...v, password: e.target.value }))}
                          className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </td>
                      <td className="px-4 py-3 text-center border-y border-border/50 group-hover:border-y-primary/20">
                        <select value={editing.role} onChange={e => setEditing(v => v && ({ ...v, role: e.target.value as 'admin' | 'manager' | 'evaluator' | 'trainer' }))}
                          className="bg-secondary/40 border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none">
                          <option value="admin">{t('staff.roles.admin')}</option>
                          <option value="manager">{t('staff.roles.manager')}</option>
                          <option value="evaluator">{t('staff.roles.evaluator')}</option>
                          <option value="trainer">{t('staff.roles.trainer')}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center border-y border-border/50 group-hover:border-y-primary/20">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${s.active ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                          {s.active ? t('staff.active') : t('staff.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right rounded-r-2xl border-y border-r border-border/50 group-hover:border-primary/20">
                        <div className="flex items-center justify-end gap-1.5 pt-0.5">
                          <button onClick={saveEdit} disabled={saving}
                            className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditing(null)}
                            className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View row
                    <>
                      <td className="px-5 py-4 rounded-l-2xl border-y border-l border-border/50 group-hover:border-primary/20 font-semibold text-foreground">{s.name}</td>
                      <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20 font-mono text-sm text-foreground">{s.username}</td>
                      <td className="px-4 py-4 border-y border-border/50 group-hover:border-y-primary/20">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-foreground">
                            {showPw[s.id] ? s.password : '••••••••'}
                          </span>
                          <button onClick={() => setShowPw(v => ({ ...v, [s.id]: !v[s.id] }))}
                            className="text-muted-foreground hover:text-foreground transition-colors">
                            {showPw[s.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold capitalize ${ROLE_COLORS[s.role]}`}>
                          {t(`staff.roles.${s.role}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center border-y border-border/50 group-hover:border-y-primary/20">
                        <button
                          onClick={() => toggleStaffActive(s.id, s.active)}
                          className={`px-2.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors ${
                            s.active
                              ? 'bg-blue-500/15 text-blue-400 hover:bg-red-500/15 hover:text-red-400'
                              : 'bg-red-500/15 text-red-400 hover:bg-blue-500/15 hover:text-blue-400'
                          }`}
                        >
                          {s.active ? t('staff.active') : t('staff.inactive')}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right rounded-r-2xl border-y border-r border-border/50 group-hover:border-primary/20">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditing({ id: s.id, username: s.username, password: s.password, name: s.name, role: s.role as 'manager' | 'evaluator' | 'trainer' })}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteStaff(s.id, s.name)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-5 text-sm text-blue-400">
        <p className="font-semibold mb-1 flex items-center gap-2"><ShieldCheck size={16} /> {t('staff.aboutTitle')}</p>
        <ul className="space-y-1 text-blue-400/80 list-disc list-inside">
          <li>{t('staff.aboutManager')}</li>
          <li>{t('staff.aboutTrainer')}</li>
          <li>{t('staff.aboutEvaluator')}</li>
          <li>{t('staff.aboutAdmin')}</li>
        </ul>
      </div>
    </div>
  );
}
