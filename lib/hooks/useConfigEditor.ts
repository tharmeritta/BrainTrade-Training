import { useState, useEffect, useCallback, useRef } from 'react';

export interface ConfigData {
  learn?: any;
  quizzes?: any;
  ai_eval?: any;
  features?: any;
}

export function useConfigEditor(role: string) {
  const [configs, setConfigs] = useState<ConfigData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const initialConfigsRef = useRef<ConfigData>({});

  const isIT = role === 'it';
  const confirmITAction = useCallback(() => {
    if (!isIT) return true;
    return typeof window !== 'undefined' ? window.confirm("Confirm to send this request for administrator approval?") : true;
  }, [isIT]);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        const fetchedConfigs = data.configs || {};
        setConfigs(fetchedConfigs);
        initialConfigsRef.current = JSON.parse(JSON.stringify(fetchedConfigs));
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Load config error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleSave = async (id: string, data: any) => {
    if (!confirmITAction()) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data })
      });
      if (res.ok) {
        setSaveStatus('success');
        setHasUnsavedChanges(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
        const updatedConfigs = { ...configs, [id]: data };
        setConfigs(updatedConfigs);
        initialConfigsRef.current = JSON.parse(JSON.stringify(updatedConfigs));
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return {
    configs,
    loading,
    saving,
    saveStatus,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    handleSave,
    loadConfigs
  };
}

/**
 * Utility to update a nested object property by path (e.g., "title.en")
 */
export function updateDeep(obj: any, path: string, value: any) {
  const updated = { ...obj };
  const parts = path.split('.');
  let curr: any = updated;
  for (let i = 0; i < parts.length - 1; i++) {
    curr[parts[i]] = { ...curr[parts[i]] };
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = value;
  return updated;
}
