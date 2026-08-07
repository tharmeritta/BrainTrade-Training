'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  BookOpen, Plus, Edit3, Trash2, Layers, Upload, 
  ExternalLink, FileText, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { storage, auth } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithCustomToken } from 'firebase/auth';
import { EditorHeader, FormField } from './SharedUI';
import { updateDeep } from '@/lib/hooks/useConfigEditor';

interface PresentationInfo {
  slideUrls?: string[];
  presentationId?: string;
  totalSlides: number;
}

interface LearnModule {
  id: string;
  title: string;
  titleTh: string;
  description: string;
  descriptionTh: string;
  gradient: string;
  presentations: {
    th: PresentationInfo;
    en: PresentationInfo;
  };
}

interface LearnConfig {
  modules: Record<string, LearnModule>;
  order: string[];
}

export default function LearnEditor({ initialModules, data, onSave, onChange, saving }: { initialModules: Record<string, LearnModule>, data: LearnConfig | undefined, onSave: (d: LearnConfig) => void, onChange: () => void, saving: boolean, readOnly?: boolean }) {
  const [modules, setModules] = useState<Record<string, LearnModule>>(initialModules);
  const [order, setOrder] = useState<string[]>(data?.order || Object.keys(modules));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'loading' | 'done' | 'error'>>({});

  useEffect(() => { setModules(initialModules); }, [initialModules]);

  const ensureFirebaseSession = async () => {
    if (auth.currentUser) return;
    const res = await fetch('/api/auth/firebase-token');
    const { firebaseToken } = await res.json();
    if (firebaseToken) await signInWithCustomToken(auth, firebaseToken);
  };

  const moveModule = (idx: number, direction: 'up' | 'down') => {
    const newOrder = [...order];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];
    setOrder(newOrder);
    onChange();
  };

  const handleFileUpload = async (moduleId: string, lang: 'en' | 'th', files: FileList) => {
    const key = `${moduleId}_${lang}`;
    setUploadStatus(prev => ({ ...prev, [key]: 'loading' }));
    try {
      await ensureFirebaseSession();
      const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      const slideUrls: string[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const storageRef = ref(storage, `slides/${moduleId}/${lang}/${i + 1}.png`);
        await uploadBytes(storageRef, sorted[i]);
        slideUrls.push(await getDownloadURL(storageRef));
      }
      setModules(prev => {
        const updated = updateDeep(prev, `${moduleId}.presentations.${lang}`, { ...prev[moduleId].presentations[lang], slideUrls, totalSlides: slideUrls.length });
        return updated;
      });
      setUploadStatus(prev => ({ ...prev, [key]: 'done' }));
      onChange();
    } catch (err: any) { 
      alert(err.message); 
      setUploadStatus(prev => ({ ...prev, [key]: 'error' })); 
    }
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    if (field === 'id') {
      const trimmed = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!trimmed || trimmed === id || modules[trimmed]) return;
      if (!window.confirm(`Warning: Changing ID requires re-uploading slides. Continue?`)) return;
      const updated: Record<string, LearnModule> = { ...modules, [trimmed]: { ...modules[id], id: trimmed } };
      delete updated[id];
      setOrder(order.map(o => o === id ? trimmed : o));
      setModules(updated);
      setEditingId(trimmed);
      onChange();
      return;
    }
    setModules(prev => updateDeep(prev, id + (field.startsWith('.') ? '' : '.') + field, value));
    onChange();
  };

  return (
    <div className="p-6 space-y-6">
      <EditorHeader title="Learn Courses" icon={BookOpen} onSave={() => onSave({ modules, order })} saving={saving} saveLabel="Save Learn Config">
        <button onClick={() => {
          const id = `module_${Date.now()}`;
          setModules({ ...modules, [id]: { id, title: 'New Course', titleTh: 'คอร์สใหม่', description: '', descriptionTh: '', gradient: 'from-gray-600 to-slate-700', presentations: { th: { totalSlides: 0 }, en: { totalSlides: 0 } } } as any });
          setOrder([...order, id]);
          setEditingId(id);
          onChange();
        }} className="bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
          <Plus size={14} /> Add Module
        </button>
      </EditorHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {order.map((id, idx) => {
          const mod = modules[id];
          if (!mod) return null;
          return (
            <div key={id} className={`group p-4 rounded-xl border transition-all ${editingId === id ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-secondary/10 hover:border-primary/30'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase opacity-40">{id}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(editingId === id ? null : id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => {
                    if (window.confirm(`Delete course "${mod.title}"?`)) {
                      const updated = { ...modules }; delete updated[id];
                      setModules(updated); setOrder(order.filter(o => o !== id));
                      if (editingId === id) setEditingId(null);
                      onChange();
                    }
                  }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h4 className="font-bold truncate text-sm mb-1">{mod.title || 'Untitled'}</h4>
              <div className="flex flex-col gap-1 text-[10px] font-bold text-muted-foreground">
                <div className="flex items-center gap-1"><FileText size={10} /> {(mod.presentations?.en?.slideUrls?.length || 0) + (mod.presentations?.th?.slideUrls?.length || 0)} Slides</div>
                {(mod.presentations?.en?.presentationId || mod.presentations?.th?.presentationId) && <div className="text-primary flex items-center gap-1"><ExternalLink size={10} /> Has Google Slides</div>}
              </div>
              <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button disabled={idx === 0} onClick={() => moveModule(idx, 'up')} className="p-1 rounded bg-background/50 border border-border disabled:opacity-20"><ArrowUp size={10} /></button>
                <button disabled={idx === order.length - 1} onClick={() => moveModule(idx, 'down')} className="p-1 rounded bg-background/50 border border-border disabled:opacity-20"><ArrowDown size={10} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {editingId && modules[editingId] && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-primary/20 bg-card space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h4 className="font-black text-sm uppercase tracking-wider text-primary flex items-center gap-2"><Edit3 size={16} /> Editing: {editingId}</h4>
            <button onClick={() => setEditingId(null)} className="text-xs font-bold text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <FormField id="mod-id" label="Internal ID">
                <input id="mod-id" type="text" value={modules[editingId].id} onChange={e => handleUpdate(editingId, 'id', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm font-mono outline-none" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField id="title-en" label="Title EN"><input id="title-en" value={modules[editingId].title} onChange={e => handleUpdate(editingId, 'title', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm outline-none" /></FormField>
                <FormField id="title-th" label="Title TH"><input id="title-th" value={modules[editingId].titleTh} onChange={e => handleUpdate(editingId, 'titleTh', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm outline-none" /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField id="desc-en" label="Desc EN"><textarea id="desc-en" value={modules[editingId].description} onChange={e => handleUpdate(editingId, 'description', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm h-20 outline-none resize-none" /></FormField>
                <FormField id="desc-th" label="Desc TH"><textarea id="desc-th" value={modules[editingId].descriptionTh} onChange={e => handleUpdate(editingId, 'descriptionTh', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm h-20 outline-none resize-none" /></FormField>
              </div>
              <FormField id="gradient" label="Visual Gradient">
                <input id="gradient" value={modules[editingId].gradient} onChange={e => handleUpdate(editingId, 'gradient', e.target.value)} className="w-full bg-secondary/30 p-2.5 rounded-xl text-sm font-mono outline-none" />
                <div className={`mt-2 h-4 w-full rounded-full bg-gradient-to-r ${modules[editingId].gradient}`} />
              </FormField>
            </div>
            <div className="space-y-6">
              {['en', 'th'].map(lang => {
                const pres = modules[editingId].presentations[lang as 'en' | 'th'];
                return (
                  <div key={lang} className="p-5 rounded-2xl bg-secondary/10 border border-border space-y-4">
                    <div className="flex items-center justify-between"><h5 className="text-xs font-black uppercase text-primary">{lang === 'en' ? 'English' : 'Thai'} Pres</h5>{uploadStatus[`${editingId}_${lang}`] === 'loading' && <Loader2 size={14} className="animate-spin text-primary" />}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField id={`pres-${lang}`} label="Google Slides ID"><input id={`pres-${lang}`} value={pres?.presentationId || ''} onChange={e => handleUpdate(editingId, `presentations.${lang}.presentationId`, e.target.value)} className="w-full bg-background border p-2 rounded-lg text-xs font-mono outline-none" /></FormField>
                      <FormField id={`slides-${lang}`} label="Total Slides"><input id={`slides-${lang}`} type="number" value={pres?.totalSlides || 0} onChange={e => handleUpdate(editingId, `presentations.${lang}.totalSlides`, parseInt(e.target.value) || 0)} className="w-full bg-background border p-2 rounded-lg text-xs outline-none" /></FormField>
                    </div>
                    <div className="space-y-2">
                      <input type="file" id={`up-${editingId}-${lang}`} className="hidden" multiple accept="image/*" onChange={e => e.target.files && handleFileUpload(editingId, lang as any, e.target.files)} />
                      <button onClick={() => document.getElementById(`up-${editingId}-${lang}`)?.click()} className="w-full py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-[10px] font-black uppercase text-primary flex items-center justify-center gap-2 hover:bg-primary/10 transition-all"><Upload size={14} /> Upload PNGs</button>
                      {(pres?.slideUrls?.length || 0) > 0 && (
                        <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto p-2 bg-black/5 rounded-xl scrollbar-hide">
                          {pres.slideUrls!.map((url, sIdx) => (
                            <div key={sIdx} className="relative aspect-video bg-black/20 rounded-lg overflow-hidden"><Image src={url} fill className="object-cover" alt="" unoptimized /><span className="absolute bottom-0.5 right-1 bg-black/60 text-[8px] text-white px-1 rounded-sm font-black">{sIdx + 1}</span></div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
